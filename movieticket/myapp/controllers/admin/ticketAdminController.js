const pool = require('../../models/db');

const PAGE = 20;

// ========== ADMIN LIST: ALL USERS ==========
exports.index = async (req, res, next) => {
  try {
    const q    = (req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit  = PAGE;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT *
      FROM (
        SELECT
          u.id, u.name, u.email,
          COUNT(DISTINCT o.id) AS orders_count,
          SUM(CASE WHEN o.status='paid' THEN 1 ELSE 0 END) AS paid_orders,
          COUNT(tk.id) AS tickets_count,
          COALESCE(SUM(CASE WHEN o.status='paid' THEN o.total_amount ELSE 0 END),0) AS total_spent,
          MAX(o.created_at) AS last_order_at
        FROM users u
        LEFT JOIN orders  o  ON o.user_id = u.id
        LEFT JOIN tickets tk ON tk.order_id = o.id
        WHERE (? = '' OR u.name LIKE ? OR u.email LIKE ?)
        GROUP BY u.id
      ) s
      ORDER BY (s.last_order_at IS NULL), s.last_order_at DESC
      LIMIT ? OFFSET ?;
    `;
    const params = [q, `%${q}%`, `%${q}%`, limit, offset];
    const [rows] = await pool.query(sql, params);

    const [totals] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u WHERE (? = '' OR u.name LIKE ? OR u.email LIKE ?)`,
      [q, `%${q}%`, `%${q}%`]
    );
    const totalUsers = totals[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    res.render('admin/tickets/index', {
      title: 'Admin • Tickets',
      user: req.session.user,
      q, page, totalPages,
      rows
    });
  } catch (err) { next(err); }
};


// ========== ADMIN DETAIL: TICKETS FOR ONE USER ==========
exports.userTickets = async (req, res, next) => {
  try {
    const uid  = Number(req.params.uid || 0);
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit  = 20;
    const offset = (page - 1) * limit;

    // get the user
    const [users] = await pool.query(
      `SELECT id, name, email FROM users WHERE id=? LIMIT 1`,
      [uid]
    );
    if (!users.length) {
      return res.status(404).render('404', { title:'Not Found', user:req.session.user });
    }

    // ✅ No tickets join. Join seat_inventory by orders.seat_id and showtimes by orders.showtime_id
    const sql = `
      SELECT
        o.id            AS order_id,
        o.status        AS status,
        o.total_amount  AS total_amount,
        o.created_at    AS created_at,
        o.expires_at    AS expires_at,
    
        st.start_utc    AS start_utc_raw,  -- keep raw if you still need it
        -- format to "YYYY-MM-DD HH:MM" (UTC→Bangkok; drop CONVERT_TZ if not needed)
        DATE_FORMAT(CONVERT_TZ(st.start_utc, '+00:00', '+07:00'), '%Y-%m-%d %H:%i') AS start_local,
    
        m.duration_min  AS duration_min,
        m.title         AS movie_title,
        m.poster_url    AS poster_url,
        th.name         AS theater_name,
        th.city         AS city,
        si.seat_code    AS seat_code,
    
        GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), o.expires_at)) AS remaining_seconds
      FROM orders o
      JOIN showtimes st ON st.id = o.showtime_id
      JOIN movies    m  ON m.id  = st.movie_id
      JOIN screens   sc ON sc.id = st.screen_id
      JOIN theaters  th ON th.id = sc.theater_id
      LEFT JOIN seat_inventory si ON si.id = o.seat_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?;
    `;
  
    const [rows] = await pool.query(sql, [uid, limit, offset]);

    const tickets = rows.map(r => ({
      order_id: r.order_id,
      status: r.status,
      total_amount: r.total_amount,
      start_utc: r.start_local,        // your EJS uses start_local || start_utc
      duration_min: r.duration_min ?? null,
      movie_title: r.movie_title,
      poster_url: r.poster_url,
      theater_name: r.theater_name,
      city: r.city,
      seats: r.seat_code ? [r.seat_code] : [],
      remaining_seconds: Number(r.remaining_seconds) || 0
    }));

    // simple count for pagination
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders WHERE user_id=?`,
      [uid]
    );
    const totalItems = countRows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    res.render('admin/tickets/user', {
      title: `Admin • Tickets of ${users[0].name}`,
      user: req.session.user,
      person: users[0],
      page, totalPages,
      tickets
    });
  } catch (err) { next(err); }
};