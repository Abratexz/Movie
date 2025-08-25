const pool = require('../../models/db');

const BUFFER_MIN = 15; // cleaning/turnover time between shows

// constants at top of file
const ROW_LABELS = ['A', 'B', 'C', 'D', 'E'];
const COLS = 10;

async function getDurationMin(movie_id) {
  const [[row]] = await pool.query('SELECT duration_min FROM movies WHERE id=?', [movie_id]);
  return Number(row?.duration_min) || 120; // default if null/missing
}

async function hasOverlap({ screen_id, start_utc, movie_id, excludeId = null }) {
  const dur = await getDurationMin(movie_id);
  const params = [
    screen_id,
    start_utc,                    
    dur + BUFFER_MIN,
    start_utc,                   
    BUFFER_MIN
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
  if (excludeId) { sql += ' AND s.id <> ?'; params.push(excludeId); }
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

// list all showtimes with movie and screen info
exports.index = async (req, res, next) => {
    try {
      const q = (req.query.q || '').trim();
  
      // Optional WHERE + params for search
      let where = '';
      let params = [];
      if (q) {
        where = `
          WHERE m.title LIKE ? 
             OR s.name LIKE ? 
             OR st.format LIKE ? 
             OR st.language LIKE ?
        `;
        params = [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`];
      }
  
      // ✅ Define the SQL string (was undefined before)
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
        showtimes: rows,   // what the EJS expects to loop
        q                  // so value="<%= q || '' %>" works
      });
    } catch (e) {
      next(e);
    }
  };

// render new form
exports.newForm = async (req, res, next) => {
  try {
    const [movies] = await pool.query('SELECT id, title FROM movies ORDER BY title');
    const [screens] = await pool.query('SELECT id, name FROM screens ORDER BY id');
    res.render('admin/showtimes/new', { title: 'New Showtime', user: req.session.user, movies, screens });
  } catch (err) { next(err); }
};

// create
exports.create = async (req, res, next) => {
    try {
      const { movie_id, screen_id, start_utc, base_price, currency, format, language } = req.body;
  
      // ⛔ overlap guard
      if (await hasOverlap({ screen_id, start_utc, movie_id })) {
        req.flash('error', 'Overlap detected: this screen already has a clashing showtime.');
        return res.redirect('/admin/showtimes/new');
      }
  
      // ✅ safe to insert
      const [result] = await pool.query(`
        INSERT INTO showtimes (movie_id, screen_id, start_utc, base_price, currency, format, language, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
      `, [movie_id, screen_id, start_utc, base_price, currency || 'THB', format || null, language || null]);
  
      const showtimeId = result.insertId;
  
      // auto-seed seat inventory (example: 100 seats, A1..J10)
      const seatRows = [];
      for (const r of ROW_LABELS) {
        for (let c = 1; c <= COLS; c++) {
          seatRows.push([showtimeId, `${r}${c}`, 'standard', 'available']);
        }
      }
      await pool.query(
        `INSERT INTO seat_inventory (showtime_id, seat_code, seat_class, status) VALUES ?`,
        [seatRows]
      );
      req.flash('success', 'Showtime created.');
      res.redirect('/admin/showtimes');
    } catch (err) { next(err); }
  };
  

// edit form
exports.editForm = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [[showtime]] = await pool.query('SELECT * FROM showtimes WHERE id = ?', [id]);
    if (!showtime) return res.status(404).render('errors/404', { title: 'Not found', user: req.session.user });

    const [movies] = await pool.query('SELECT id, title FROM movies ORDER BY title');
    const [screens] = await pool.query('SELECT id, name FROM screens ORDER BY id');

    res.render('admin/showtimes/edit', { title: 'Edit Showtime', user: req.session.user, showtime, movies, screens });
  } catch (err) { next(err); }
};

// update
exports.update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { movie_id, screen_id, start_utc, base_price, currency, format, language, status } = req.body;
  
      // ⛔ overlap guard (ignore current row)
      if (await hasOverlap({ screen_id, start_utc, movie_id, excludeId: id })) {
        req.flash('error', 'Overlap detected: this screen already has a clashing showtime.');
        return res.redirect(`/admin/showtimes/${id}/edit`);
      }
  
      // ✅ safe to update
      await pool.query(`
        UPDATE showtimes
           SET movie_id=?, screen_id=?, start_utc=?, base_price=?, currency=?, format=?, language=?, status=?
         WHERE id=?
      `, [movie_id, screen_id, start_utc, base_price, currency, format, language, status, id]);
  
      req.flash('success', 'Showtime updated.');
      res.redirect('/admin/showtimes');
    } catch (err) { next(err); }
  };
  

// delete
exports.destroy = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM showtimes WHERE id=?', [id]); // seats auto-delete via FK
    if (result.affectedRows === 0) {
      req.flash('error', 'Showtime not found.');
    } else {
      req.flash('success', 'Showtime deleted.');
    }
    res.redirect('/admin/showtimes');
  } catch (err) { next(err); }
};

exports.seatInventory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const [[st]] = await pool.query(`
      SELECT s.id, s.start_utc, s.format, s.language,
             m.title, sc.name AS screen_name
      FROM showtimes s
      JOIN movies  m  ON m.id = s.movie_id
      JOIN screens sc ON sc.id = s.screen_id
      WHERE s.id = ?`, [id]
    );
    if (!st) return next(new Error('Showtime not found'));

    // <-- IMPORTANT: no WHERE status IN (...) filter. Get all rows.
    const [rows] = await pool.query(
      `SELECT seat_code, status FROM seat_inventory WHERE showtime_id=?`,
      [id]
    );
    const statusBy = new Map(
      rows.map(r => [String(r.seat_code).toUpperCase(), String(r.status).toLowerCase()])
    );

    const ROWS = ['A','B','C','D','E'];
    const COLS = 10;

    const grid = ROWS.map(r =>
      Array.from({ length: COLS }, (_, i) => {
        const label  = `${r}${i+1}`;
        const status = statusBy.get(label) || 'available'; // default green
        return { label, status };
      })
    );

    res.render('admin/showtimes/seat_viewer', {
      title: `Seats • ${st.title} • ${st.screen_name}`,
      user: req.session.user,
      st, grid
    });
  } catch (e) { next(e); }
};
