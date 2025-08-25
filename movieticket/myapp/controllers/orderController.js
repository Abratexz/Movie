// controllers/orderController.js
const pool = require('../models/db');

const HOLD_MINUTES = 1;

/* ------------------------- helpers ------------------------- */

async function cleanupExpired(orderId = null, showtimeId = null, userId = null) {
  // expire orders past their deadline
  const params = [];
  let where = 'status = "hold" AND expires_at < NOW()';
  if (orderId)   { where += ' AND id = ?'; params.push(orderId); }
  if (showtimeId){ where += ' AND showtime_id = ?'; params.push(showtimeId); }
  if (userId)    { where += ' AND user_id = ?'; params.push(userId); }

  const [expiredIdsRows] = await pool.query(`SELECT id FROM orders WHERE ${where}`, params);
  if (!expiredIdsRows.length) return { released: 0 };

  const ids = expiredIdsRows.map(r => r.id);
  await pool.query(`UPDATE orders SET status='expired', updated_at=NOW() WHERE id IN (?)`, [ids]);
  const [r2] = await pool.query(
    `UPDATE seat_inventory
        SET status='available', locked_by=NULL, order_id=NULL, hold_expires_at=NULL
      WHERE order_id IN (?)`,
    [ids]
  );
  return { released: r2.affectedRows || 0 };
}

async function computeTotal(showtimeId, seatCount) {
  const [[row]] = await pool.query(
    'SELECT base_price, currency FROM showtimes WHERE id=? LIMIT 1', [showtimeId]
  );
  if (!row) throw new Error('Showtime not found');
  return { total: Number(row.base_price) * seatCount, currency: row.currency || 'THB' };
}

/* ------------------------- controllers ------------------------- */

/**
 * POST /api/orders
 * body: { showtime_id:number, seats: string[] | 'A1,B2,...' }
 * Creates an order in status 'hold' and locks seats for 10 minutes.
 * Returns { ok, order_id, expires_at, pay_url }
 */
exports.create = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ ok:false, error:'AUTH' });

  let { showtime_id, seats } = req.body;

  try {
    const user_id = Number(user.id);
    showtime_id = Number(showtime_id);
    if (!showtime_id) return res.status(400).json({ ok:false, error:'BAD_REQUEST' });

    if (typeof seats === 'string') seats = seats.split(',').map(s => s.trim()).filter(Boolean);
    if (!Array.isArray(seats) || seats.length === 0) return res.status(400).json({ ok:false, error:'NO_SEATS' });
    seats = [...new Set(seats)];

    await cleanupExpired(null, showtime_id, null);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [candidate] = await conn.query(
        `SELECT id, seat_code
           FROM seat_inventory
          WHERE showtime_id = ?
            AND seat_code IN (?)
            AND (status='available' OR (status='locked' AND hold_expires_at <= NOW()))
          FOR UPDATE`,
        [showtime_id, seats]
      );
      if (candidate.length !== seats.length) {
        await conn.rollback(); conn.release();
        return res.status(409).json({ ok:false, error:'SEAT_TAKEN', detail: { have: candidate.map(s=>s.seat_code) } });
      }

      const { total, currency } = await computeTotal(showtime_id, seats.length);

      const [ordRes] = await conn.query(
        `INSERT INTO orders
           (user_id, showtime_id, total_amount, status, expires_at, created_at, updated_at, seat_id)
         VALUES (?, ?, ?, 'hold', DATE_ADD(NOW(), INTERVAL ? MINUTE), NOW(), NOW(), ?)`,
        [user_id, showtime_id, total, HOLD_MINUTES, candidate.map(c=>c.id).join(',')]
      );
      const orderId = ordRes.insertId;

      const ids = candidate.map(c => c.id);
      const [upd] = await conn.query(
        `UPDATE seat_inventory
            SET status='locked',
                locked_by=?,
                order_id=?,
                hold_expires_at=DATE_ADD(NOW(), INTERVAL ? MINUTE)
          WHERE id IN (?)
            AND (status='available' OR (status='locked' AND hold_expires_at <= NOW()))`,
        [user_id, orderId, HOLD_MINUTES, ids]
      );
      if (upd.affectedRows !== ids.length) {
        await conn.rollback(); conn.release();
        return res.status(409).json({ ok:false, error:'SEAT_RACE' });
      }

      await conn.commit();
      conn.release();

      return res.json({
        ok: true,
        order_id: orderId,
        currency,
        total_amount: total,
        pay_url: `/payment?order_id=${orderId}`
      });
    } catch (e) {
      try { await conn.rollback(); } catch {}
      conn.release();
      console.error(e);
      return res.status(500).json({ ok:false, error:'SERVER' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error:'SERVER' });
  }
};

/**
 * GET /my-tickets
 * Renders the user's orders (active & history).
 * Shows remaining seconds for 'hold' orders.
 */
// controllers/orderController.js (or wherever myTicketsPage lives)

exports.myTicketsPage = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/login?next=/my-tickets');

    // expire this user's overdue holds before listing
    if (typeof cleanupExpired === 'function') {
      await cleanupExpired(null, null, user.id);
    }

    const [rows] = await pool.query(
      `
      SELECT
        o.id                               AS order_id,
        o.status,
        o.total_amount,
        o.created_at,
        o.expires_at,
        st.id                              AS showtime_id,
        -- local Bangkok datetime string for display
        DATE_FORMAT(CONVERT_TZ(st.start_utc,'+00:00','+07:00'), '%Y-%m-%d %H:%i') AS start_local,
        st.start_utc,
        m.title                            AS movie_title,
        COALESCE(m.poster_url,'posters/default.jpg') AS poster_url,
        m.duration_min,
        th.name                            AS theater_name,
        th.city                            AS city,
        -- keep seats visible even after release/cancel (uses CSV of seat ids on order)
        GROUP_CONCAT(si.seat_code ORDER BY si.seat_code SEPARATOR ',') AS seats_csv,
        -- countdown (never negative)
        GREATEST(TIMESTAMPDIFF(SECOND, NOW(), o.expires_at), 0) AS remaining_seconds
      FROM orders o
      JOIN showtimes st ON st.id = o.showtime_id
      JOIN screens   s  ON s.id = st.screen_id
      JOIN theaters  th ON th.id = s.theater_id
      JOIN movies    m  ON m.id = st.movie_id
      LEFT JOIN seat_inventory si ON FIND_IN_SET(si.id, o.seat_id)
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC, o.id DESC
      `,
      [user.id]
    );

    // shape for tickets/index.ejs
    const tickets = rows.map(r => ({
      order_id: r.order_id,
      status: r.status,                                  // 'hold' | 'paid' | 'cancelled' | 'expired' | 'failed'
      total_amount: Number(r.total_amount) || 0,
      showtime_id: r.showtime_id,
      start_local: r.start_local,
      start_utc: r.start_utc,
      movie_title: r.movie_title,
      poster_url: r.poster_url,
      duration_min: Number(r.duration_min) || 0,
      theater_name: r.theater_name,
      city: r.city,
      seats: (r.seats_csv || '').split(',').filter(Boolean), // array for display
      remaining_seconds: Number(r.remaining_seconds) || 0
    }));

    return res.render('tickets/index', { tickets, user });
  } catch (e) {
    next(e);
  }
};


/**
 * POST /orders/:id/cancel
 * Allows the owner to cancel a 'hold' order and free seats immediately.
 */
exports.cancel = async (req, res) => {
  const userId = req.session.user?.id;
  const id = Number(req.params.id);
  if (!userId) return res.status(401).json({ ok:false, error:'AUTH' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[o]] = await conn.query(
      'SELECT id, user_id, status FROM orders WHERE id=? FOR UPDATE',
      [id]
    );
    if (!o || o.user_id !== userId) {
      await conn.rollback(); conn.release();
      return req.xhr
        ? res.status(404).json({ ok:false, error:'NOT_FOUND' })
        : res.redirect('/my-tickets');
    }
    if (o.status !== 'hold') {
      await conn.commit(); conn.release();
      return req.xhr
        ? res.json({ ok:true, status:o.status })
        : res.redirect('/my-tickets');
    }

    await conn.query(
      `UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id=?`,
      [id]
    );
    await conn.query(
      `UPDATE seat_inventory
          SET status='available', order_id=NULL, locked_by=NULL, hold_expires_at=NULL
        WHERE order_id=?`,
      [id]
    );

    await conn.commit();
    conn.release();

    return req.xhr
      ? res.json({ ok:true, status:'cancelled' })
      : res.redirect('/my-tickets');
  } catch (e) {
    try { await conn.rollback(); } catch {}
    conn.release();
    return req.xhr
      ? res.status(500).json({ ok:false, error:'SERVER' })
      : res.redirect('/my-tickets');
  }
};

/**
 * GET /api/orders/:id
 * Returns order details (used by payment page).
 */
exports.getOrder = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ ok:false, error:'AUTH' });

  const id = Number(req.params.id);
  try {
    // auto-expire if necessary
    await cleanupExpired(id, null, null);

    const [[o]] = await pool.query(
      `SELECT id, user_id, showtime_id, total_amount, status, expires_at
         FROM orders WHERE id=? LIMIT 1`,
      [id]
    );
    if (!o || o.user_id !== user.id) return res.status(404).json({ ok:false, error:'NOT_FOUND' });

    const [seats] = await pool.query(
      `SELECT seat_code FROM seat_inventory WHERE order_id=? ORDER BY seat_code`, [id]
    );

    return res.json({
      ok: true,
      order: {
        ...o,
        seats: seats.map(s => s.seat_code),
        remaining_seconds: o.status === 'hold'
          ? Math.max(0, Math.floor((new Date(o.expires_at).getTime() - Date.now()) / 1000))
          : 0
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error:'SERVER' });
  }
};
