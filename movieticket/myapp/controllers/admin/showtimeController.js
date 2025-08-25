// controllers/admin/showtimeController.js
const pool = require('../../models/db');
const SEAT_STATUSES = new Set(['available', 'locked', 'booked']);
const BUFFER_MIN = 15; // cleaning/turnover time between shows
// Simple default grid used when seeding seats on create
const ROW_LABELS = ['A', 'B', 'C', 'D', 'E'];
const COLS = 10;

/* ------------------------------- helpers ------------------------------- */

async function getDurationMin(movie_id) {
  const [[row]] = await pool.query(
    'SELECT duration_min FROM movies WHERE id=?',
    [movie_id]
  );
  return Number(row?.duration_min) || 120; // fallback if null/missing
}

/**
 * Returns true if the proposed showtime overlaps anything on the same screen.
 * Compares: [start_utc, start_utc + (duration+buffer)) against existing windows.
 */
async function hasOverlap({ screen_id, start_utc, movie_id, excludeId = null }) {
  const dur = await getDurationMin(movie_id);

  // We avoid overlap iff:
  //   new_end <= existing_start OR new_start >= existing_end
  // So overlap is NOT (those disjoint conditions)
  const params = [
    screen_id,
    start_utc,                 // new_start
    dur + BUFFER_MIN,          // new_end = new_start + (dur+buffer)
    start_utc,                 // new_start
    BUFFER_MIN                 // existing_end = existing_start + (m.duration_min+buffer)
  ];

  let sql = `
    SELECT 1
      FROM showtimes s
      JOIN movies m ON m.id = s.movie_id
     WHERE s.screen_id = ?
       AND NOT (
         DATE_ADD(?, INTERVAL ? MINUTE) <= s.start_utc
         OR ? >= DATE_ADD(s.start_utc, INTERVAL (m.duration_min + ?) MINUTE)
       )
  `;

  if (excludeId) {
    sql += ' AND s.id <> ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

/* ------------------------------- routes ------------------------------- */

// LIST
exports.index = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    let where = '';
    let params = [];
    if (q) {
      where = `
        WHERE m.title   LIKE ?
           OR s.name    LIKE ?
           OR st.format LIKE ?
           OR st.language LIKE ?
      `;
      params = Array(4).fill(`%${q}%`);
    }

    const sql = `
      SELECT
        st.id, st.movie_id, st.screen_id, st.start_utc,
        st.base_price, st.currency, st.format, st.language, st.status,
        m.title AS movie,
        s.name  AS screen_name
      FROM showtimes st
      LEFT JOIN movies  m ON m.id = st.movie_id
      LEFT JOIN screens s ON s.id = st.screen_id
      ${where}
      ORDER BY st.id ASC
    `;

    const [rows] = await pool.query(sql, params);

    res.render('admin/showtimes/list', {
      title: 'Manage Showtimes',
      user: req.session.user,
      showtimes: rows,
      q
    });
  } catch (e) {
    next(e);
  }
};

// NEW FORM
exports.newForm = async (req, res, next) => {
  try {
    const [movies] = await pool.query('SELECT id, title FROM movies ORDER BY title');
    const [screens] = await pool.query('SELECT id, name FROM screens ORDER BY id');
    res.render('admin/showtimes/new', {
      title: 'New Showtime',
      user: req.session.user,
      movies,
      screens
    });
  } catch (err) {
    next(err);
  }
};

// CREATE
exports.create = async (req, res, next) => {
  try {
    let {
      movie_id,
      screen_id,
      start_utc,
      base_price,
      currency,
      format,
      language
    } = req.body;

    // normalize
    movie_id   = Number(movie_id);
    screen_id  = Number(screen_id);
    base_price = Number(base_price) || 0;
    currency   = currency || 'THB';
    format     = format || null;
    language   = language || null;

    if (!movie_id || !screen_id || !start_utc) {
      req.flash('error', 'Missing required fields.');
      return res.redirect('/admin/showtimes/new');
    }

    // overlap guard
    if (await hasOverlap({ screen_id, start_utc, movie_id })) {
      req.flash('error', 'Overlap detected: this screen already has a clashing showtime.');
      return res.redirect('/admin/showtimes/new');
    }

    // insert showtime
    const [result] = await pool.query(
      `INSERT INTO showtimes
         (movie_id, screen_id, start_utc, base_price, currency, format, language, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [movie_id, screen_id, start_utc, base_price, currency, format, language]
    );

    const showtimeId = result.insertId;

    // seed seats (simple grid)
    const seatRows = [];
    for (const r of ROW_LABELS) {
      for (let c = 1; c <= COLS; c++) {
        seatRows.push([showtimeId, `${r}${c}`, 'standard', 'available']);
      }
    }
    if (seatRows.length) {
      await pool.query(
        `INSERT INTO seat_inventory (showtime_id, seat_code, seat_class, status) VALUES ?`,
        [seatRows]
      );
    }

    req.flash('success', 'Showtime created.');
    res.redirect('/admin/showtimes');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create showtime.');
    res.redirect('/admin/showtimes/new');
  }
};

// EDIT FORM
exports.editForm = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [[showtime]] = await pool.query('SELECT * FROM showtimes WHERE id = ?', [id]);
    if (!showtime) {
      return res
        .status(404)
        .render('errors/404', { title: 'Not found', user: req.session.user });
    }

    const [movies] = await pool.query('SELECT id, title FROM movies ORDER BY title');
    const [screens] = await pool.query('SELECT id, name FROM screens ORDER BY id');

    res.render('admin/showtimes/edit', {
      title: 'Edit Showtime',
      user: req.session.user,
      showtime,
      movies,
      screens
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    let {
      movie_id,
      screen_id,
      start_utc,
      base_price,
      currency,
      format,
      language,
      status
    } = req.body;

    // normalize
    movie_id   = Number(movie_id);
    screen_id  = Number(screen_id);
    base_price = Number(base_price) || 0;
    currency   = currency || 'THB';
    format     = format || null;
    language   = language || null;
    status     = status || 'scheduled';

    if (!movie_id || !screen_id || !start_utc) {
      req.flash('error', 'Missing required fields.');
      return res.redirect(`/admin/showtimes/${id}/edit`);
    }

    // overlap guard (ignore current row)
    if (await hasOverlap({ screen_id, start_utc, movie_id, excludeId: id })) {
      req.flash('error', 'Overlap detected: this screen already has a clashing showtime.');
      return res.redirect(`/admin/showtimes/${id}/edit`);
    }

    const [r] = await pool.query(
      `UPDATE showtimes
          SET movie_id=?, screen_id=?, start_utc=?, base_price=?, currency=?, format=?, language=?, status=?
        WHERE id=?`,
      [movie_id, screen_id, start_utc, base_price, currency, format, language, status, id]
    );

    if (r.affectedRows === 0) {
      req.flash('error', 'No changes saved.');
      return res.redirect(`/admin/showtimes/${id}/edit`);
    }

    req.flash('success', 'Showtime updated.');
    res.redirect('/admin/showtimes');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update showtime.');
    res.redirect(`/admin/showtimes/${req.params.id}/edit`);
  }
};

// DELETE
exports.destroy = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM showtimes WHERE id=?', [id]); // seats should cascade via FK
    if (result.affectedRows === 0) {
      req.flash('error', 'Showtime not found.');
    } else {
      req.flash('success', 'Showtime deleted.');
    }
    res.redirect('/admin/showtimes');
  } catch (err) {
    next(err);
  }
};

// SIMPLE SEAT VIEW (admin)
exports.seatInventory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const [[st]] = await pool.query(
      `SELECT s.id, s.start_utc, s.format, s.language,
              m.title, sc.name AS screen_name
         FROM showtimes s
         JOIN movies  m  ON m.id = s.movie_id
         JOIN screens sc ON sc.id = s.screen_id
        WHERE s.id = ?`,
      [id]
    );
    if (!st) return next(new Error('Showtime not found'));

    // get all inventory (any status)
    const [rows] = await pool.query(
      `SELECT seat_code, status FROM seat_inventory WHERE showtime_id=? ORDER BY seat_code`,
      [id]
    );

    const statusBy = new Map(
      rows.map(r => [String(r.seat_code).toUpperCase(), String(r.status).toLowerCase()])
    );

    const grid = ROW_LABELS.map(r =>
      Array.from({ length: COLS }, (_, i) => {
        const label = `${r}${i + 1}`;
        const status = statusBy.get(label) || 'available';
        return { label, status };
      })
    );

    res.render('admin/showtimes/seat_viewer', {
      title: `Seats • ${st.title} • ${st.screen_name}`,
      user: req.session.user,
      st,
      grid
    });
  } catch (e) {
    next(e);
  }
};


exports.seatsJson = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      'SELECT seat_code, status FROM seat_inventory WHERE showtime_id=?',
      [id]
    );
    // Map like { "A1":"booked", "A2":"available", ... }
    const seats = Object.fromEntries(
      rows.map(r => [String(r.seat_code).toUpperCase(), String(r.status).toLowerCase()])
    );
    res.set('Cache-Control', 'no-store');
    return res.json({ ok: true, seats });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
};


exports.resetSeats = async (req, res) => {
  try {
    const showtimeId = Number(req.params.id);

    // body parsing (supports array or comma string)
    const b = (req.body && typeof req.body === 'object') ? req.body : {};
    const status = String(b.status || '').toLowerCase();
    const scope  = b.scope === 'all' ? 'all' : 'selected';
    const seats  = Array.isArray(b.seats)
      ? b.seats.map(s => String(s).trim().toUpperCase()).filter(Boolean)
      : (typeof b.seats === 'string'
          ? b.seats.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
          : []);

    if (!SEAT_STATUSES.has(status)) {
      return res.status(400).json({ ok:false, error:'Invalid status' });
    }
    if (scope !== 'all' && seats.length === 0) {
      return res.status(400).json({ ok:false, error:'No seats selected' });
    }

    // If admin overrides, clear any locks/orders on those seats.
    const clearCols = `locked_by=NULL, order_id=NULL, hold_expires_at=NULL`;

    let r;
    if (scope === 'all') {
      [r] = await pool.query(
        `UPDATE seat_inventory
            SET status=?, ${clearCols}
          WHERE showtime_id=?`,
        [status, showtimeId]
      );
    } else {
      [r] = await pool.query(
        `UPDATE seat_inventory
            SET status=?, ${clearCols}
          WHERE showtime_id=? AND seat_code IN (?)`,
        [status, showtimeId, seats]
      );
    }

    return res.json({ ok:true, updated: r.affectedRows, status });
  } catch (err) {
    return res.status(500).json({ ok:false, error: err.message });
  }
};
