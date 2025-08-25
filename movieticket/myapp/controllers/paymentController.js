// controllers/paymentController.js
const pool = require('../models/db');

const FAIL_CARD = '4000000000000002'; // simulate decline

/* ----------------------------- helpers ----------------------------- */

function shapeMovies(rows) {
  return rows.map(m => {
    const p = m.poster_url || '';
    const needsPrefix =
      p && !p.startsWith('http') && !p.startsWith('posters/') && !p.startsWith('images/');
    return { ...m, poster_url: p ? (needsPrefix ? `posters/${p}` : p) : 'posters/default.png' };
  });
}
function shapeMovie(row) { return shapeMovies([row])[0]; }

/** Release all seats tied to an order (used on expiry/decline/cancel). */
async function releaseSeats(orderId) {
  if (!orderId) return;
  await pool.query(
    `UPDATE seat_inventory
        SET status='available', locked_by=NULL, order_id=NULL, hold_expires_at=NULL
      WHERE order_id=?`,
    [orderId]
  );
}

/** If the order is a past-due hold, expire it and release seats. */
async function expireIfNeeded(orderId) {
  if (!orderId) return;
  const [[o]] = await pool.query(
    `SELECT id FROM orders WHERE id=? AND status='hold' AND expires_at < NOW() LIMIT 1`,
    [orderId]
  );
  if (!o) return;
  await pool.query(`UPDATE orders SET status='expired', updated_at=NOW() WHERE id=?`, [orderId]);
  await releaseSeats(orderId);
}

/** Seats for an order: prefer current locks; fall back to CSV seat_id history. */
async function getSeatCodesForOrder(orderId) {
  const [locked] = await pool.query(
    `SELECT seat_code FROM seat_inventory WHERE order_id=? ORDER BY seat_code`,
    [orderId]
  );
  if (locked.length) return locked.map(r => r.seat_code);

  const [csv] = await pool.query(
    `SELECT si.seat_code
       FROM orders o
       JOIN seat_inventory si ON FIND_IN_SET(si.id, o.seat_id)
      WHERE o.id=? ORDER BY si.seat_code`,
    [orderId]
  );
  return csv.map(r => r.seat_code);
}

/* ------------------------------- pages ------------------------------ */

/** GET /payment?order_id=..   or   GET /payment/:id */
exports.showPage = async (req, res, next) => {
  try {
    const user = req.session.user;
    const rawId = req.params.id ?? req.query.order_id;
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).send('Bad order id');
    }

    // expire if past due
    await expireIfNeeded(id);

    const [[o]] = await pool.query(
      `
      SELECT
        o.id, o.user_id, o.showtime_id, o.total_amount, o.status, o.expires_at,
        st.currency,
        DATE_FORMAT(CONVERT_TZ(st.start_utc,'+00:00','+07:00'), '%Y-%m-%d %H:%i') AS start_local,
        sc.name AS theater,
        m.id AS movie_id, m.title, m.poster_url, m.rating, m.duration_min,
        CASE
          WHEN o.expires_at IS NULL THEN 0
          WHEN NOW() >= o.expires_at THEN 0
          ELSE TIMESTAMPDIFF(SECOND, NOW(), o.expires_at)
        END AS remaining_seconds,
        (o.status='hold' AND NOW() < o.expires_at) AS can_pay
      FROM orders o
      JOIN showtimes st ON st.id = o.showtime_id
      JOIN screens   sc ON sc.id = st.screen_id
      JOIN movies     m ON m.id  = st.movie_id
      WHERE o.id = ?
      LIMIT 1
      `,
      [id]
    );

    // owner check (allow if o.user_id is null)
    if (!o || (user && o.user_id && o.user_id !== user.id)) {
      return res.status(404).send('Order not found');
    }

    const seats = await getSeatCodesForOrder(id);

    const movie = shapeMovie({
      id: o.movie_id,
      title: o.title,
      poster_url: o.poster_url,
      rating: o.rating,
      duration_min: o.duration_min
    });

    const [dateStr, timeStr] = String(o.start_local || '').split(' ');

    const booking = {
      order_id: o.id,
      showtime_id: o.showtime_id,
      movie_id: o.movie_id,
      date: dateStr || '',
      time: timeStr || '',
      theater: o.theater,
      seats,
      total: o.total_amount,
      currency: o.currency,
      status: o.status,
      remaining_seconds: Number(o.remaining_seconds) || 0,
      can_pay: !!o.can_pay
    };

    return res.render('payments/payment', { booking, movie, user });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /payment/confirm
 * Accepts card fields; declines when card=4000 0000 0000 0002; on success delegates to payNow.
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { order_id, card_name, card_number } = req.body;
    if (!order_id || !card_name || !card_number) {
      return res.status(400).send('Missing payment information');
    }

    // ensure any overdue hold flips to expired
    await expireIfNeeded(Number(order_id));

    // Simulated decline
    const n = String(card_number).replace(/\s+/g, '');
    if (n === FAIL_CARD) {
      await releaseSeats(order_id);
      await pool.query(`UPDATE orders SET status='failed', updated_at=NOW() WHERE id=?`, [order_id]);
      return res.redirect('/payment/fail');
    }

    // Must still be a valid hold order
    const [[o]] = await pool.query(`SELECT id, status FROM orders WHERE id=? LIMIT 1`, [order_id]);
    if (!o || o.status !== 'hold') return res.status(404).send('Order not found or expired');

    // Reuse payNow flow
    req.params.id = String(order_id);
    return exports.payNow(req, res);
  } catch (err) {
    console.error('Error in confirmPayment:', err);
    return res.status(500).send('Payment failed');
  }
};

/**
 * POST /payment/:id/pay
 * Books seats and marks the order paid. Also supports optional card decline
 * if a `card_number` is posted to this route.
 */
exports.payNow = async (req, res) => {
  const user = req.session.user;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    req.flash('error', 'Invalid order.');
    return res.redirect('/my-tickets');
  }

  try {
    // optional decline if card_number is posted here instead of /confirm
    const postedNumber = (req.body?.card_number || '').replace(/\s+/g, '');
    if (postedNumber && postedNumber === FAIL_CARD) {
      await releaseSeats(id);
      await pool.query(`UPDATE orders SET status='failed', updated_at=NOW() WHERE id=?`, [id]);
      return res.redirect('/payment/fail');
    }

    await expireIfNeeded(id);

    const [[o]] = await pool.query(
      `SELECT id, user_id, status, showtime_id, total_amount FROM orders WHERE id=? LIMIT 1`,
      [id]
    );
    if (!o || (user && o.user_id && o.user_id !== user.id)) {
      req.flash('error', 'Order not found.');
      return res.redirect('/my-tickets');
    }
    if (o.status !== 'hold') {
      req.flash('error', 'Order is not payable.');
      return res.redirect(`/payment/${id}`);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE orders SET status='paid', updated_at=NOW() WHERE id=?`,
        [id]
      );

      await conn.query(
        `UPDATE seat_inventory
            SET status='booked', hold_expires_at=NULL
          WHERE order_id=?`,
        [id]
      );

      await conn.commit();
      conn.release();
    } catch (e) {
      try { await conn.rollback(); } catch {}
      conn.release();
      console.error(e);
      req.flash('error', 'Payment failed.');
      return res.redirect(`/payment/${id}`);
    }

    // Success page data
    const [[info]] = await pool.query(
      `SELECT st.start_utc, st.currency, sc.name AS theater,
              m.id AS movie_id, m.title, m.poster_url, m.rating, m.duration_min
         FROM showtimes st
         JOIN screens sc ON sc.id = st.screen_id
         JOIN movies  m  ON m.id = st.movie_id
        WHERE st.id=? LIMIT 1`,
      [o.showtime_id]
    );
    const seats = await getSeatCodesForOrder(id);

    const movie = shapeMovie(info);
    const booking = {
      id,
      order_id: id,
      showtime_id: o.showtime_id,
      movie_id: info.movie_id,
      date: new Date(info.start_utc).toLocaleDateString('en-US'),
      time: new Date(info.start_utc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      theater: info.theater,
      seats,
      total: o.total_amount,
      currency: info.currency,
      status: 'success',
      payment_date: new Date().toLocaleDateString('en-US'),
      payment_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    res.render('payments/success', { message: 'Payment Successful!', booking, movie, user });
  } catch (e) {
    console.error(e);
    req.flash('error', 'Server error.');
    res.redirect('/my-tickets');
  }
};

/* ---------- simple result pages ---------- */

exports.showFail = (req, res) => {
  res.render('payments/paymentfail', {
    message: 'Payment Failed! Your card was declined.',
    user: req.session.user || null
  });
};

exports.showSuccess = (req, res) => {
  res.render('payments/success', {
    message: 'Payment Successful!',
    booking: req.session.lastBooking || {},
    movie: req.session.lastMovie || {},
    user: req.session.user || null
  });
};

/* ---------------------- background expiry sweep --------------------- */
setInterval(async () => {
  try {
    const [rows] = await pool.query(
      `SELECT id FROM orders WHERE status='hold' AND expires_at IS NOT NULL AND expires_at < NOW()`
    );
    for (const r of rows) {
      await pool.query(`UPDATE orders SET status='expired', updated_at=NOW() WHERE id=?`, [r.id]);
      await releaseSeats(r.id);
    }
  } catch (err) {
    console.error('Error clearing expired holds:', err);
  }
}, 60_000);

/* ---------------- back-compat aliases ------------------ */
exports.showPaymentPage = exports.showPage;
