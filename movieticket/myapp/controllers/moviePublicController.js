// controllers/moviePublicController.js
const pool = require('../models/db');

// normalize poster path like before
function shapeMovies(rows) {
  return rows.map(m => {
    const p = m.poster_url || '';
    const needsPrefix = p && !p.startsWith('http') && !p.startsWith('posters/') && !p.startsWith('images/');
    return { ...m, poster_url: p ? (needsPrefix ? `posters/${p}` : p) : 'posters/default.png' };
  });
}
const shapeMovie = row => shapeMovies([row])[0];

/* ===================== LIST PAGES ===================== */

exports.nowShowing = async (req, res) => {
  const uid = req.session.user?.id || 0;
  const [rows] = await pool.query(
    `SELECT m.id, m.title, m.duration_min, m.release_date, m.poster_url,
            CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END AS is_favorite
       FROM movies m
       LEFT JOIN favorite_movies f
         ON f.movie_id = m.id AND f.user_id = ?
      WHERE m.release_date IS NULL OR m.release_date <= CURDATE()
      ORDER BY m.release_date DESC, m.id DESC`,
    [uid]
  );
  res.render('movies/home', {
    title: 'Now Showing',
    category: 'now',
    user: req.session.user || null,
    movies: rows
  });
};

exports.comingSoon = async (req, res) => {
  const uid = req.session.user?.id || 0;
  const [rows] = await pool.query(
    `SELECT m.id, m.title, m.duration_min, m.release_date, m.poster_url,
            CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END AS is_favorite
       FROM movies m
       LEFT JOIN favorite_movies f
         ON f.movie_id = m.id AND f.user_id = ?
      WHERE m.release_date IS NOT NULL AND m.release_date > CURDATE()
      ORDER BY m.release_date ASC, m.id DESC`,
    [uid]
  );
  res.render('movies/home', {
    title: 'Coming Soon',
    category: 'coming',
    user: req.session.user || null,
    movies: rows
  });
};

/* ===================== DETAIL / SHOWTIMES ===================== */

exports.showtimes = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const [mrows] = await pool.query(
      `SELECT id, title, poster_url, duration_min, release_date,
              description, trailer_url, rating
       FROM movies
       WHERE id = ?
       LIMIT 1`, [id]
    );
    if (!mrows.length) {
      return res.status(404).render('errors/404', { title: 'Movie not found', user: req.session.user || null });
    }

    const shaped = shapeMovie(mrows[0]);
    const movie = {
      ...shaped,
      backdrop_url: shaped.backdrop_url || shaped.poster_url || 'posters/default.png',
      tagline: '',
      genres: ''
    };

    // NEW: compute isFavorite for the current user
    let isFavorite = false;
    if (req.session.user) {
      const userId = req.session.user.id;
      const [fav] = await pool.query(
        'SELECT 1 FROM favorite_movies WHERE user_id=? AND movie_id=? LIMIT 1',
        [userId, movie.id]
      );
      isFavorite = fav.length > 0;
    }

    const [rows] = await pool.query(
      `
      SELECT
        st.id  AS showtime_id,
        s.id   AS screen_id,
        th.id  AS theater_id,
        th.name AS theater_name,
        DATE_FORMAT(CONVERT_TZ(st.start_utc,'+00:00','+07:00'), '%Y-%m-%d') AS show_date,
        DATE_FORMAT(CONVERT_TZ(st.start_utc,'+00:00','+07:00'), '%H:%i')   AS show_time,
        st.format      AS screen_type,
        st.language,
        st.base_price  AS price,
        st.currency
      FROM showtimes st
      JOIN screens  s  ON s.id  = st.screen_id
      JOIN theaters th ON th.id = s.theater_id
      WHERE st.movie_id = ?
        AND st.start_utc >= UTC_TIMESTAMP()
        AND st.status = 'scheduled'
      ORDER BY th.name, st.start_utc
      `, [id]
    );

    const theatersMap = new Map();
    const dataByTheater = {};
    for (const r of rows) {
      const tid = String(r.theater_id);
      theatersMap.set(tid, r.theater_name);
      (dataByTheater[tid] ||= {});
      (dataByTheater[tid][r.show_date] ||= []).push(r);
    }
    const theaters = [...theatersMap].map(([id, name]) => ({ id, name }));

    res.render('movies/detail', {
      title: movie.title,
      user: req.session.user || null,
      movie,
      theaters,
      dataByTheater,
      isFavorite
    });
  } catch (err) {
    next(err);
  }
};

/* --------------------------- API: Get seat map JSON --------------------------- */
/**
 * GET /movies/api/showtimes/:id/seats
 * - Ensures seat_inventory exists for the showtime (seed from screens.seat_map_json)
 * - Expires old holds
 * - Returns {meta, layout, seats}
 */
exports.seatMap = async (req, res, next) => {
  const showtimeId = Number(req.params.id);
  try {
    // meta + layout
    const [[meta]] = await pool.query(
      `SELECT st.id AS showtime_id, st.base_price AS price, st.currency,
              st.format AS screen_type, st.language,
              s.id AS screen_id, s.seat_map_json,
              th.name AS theater_name,
              DATE_FORMAT(CONVERT_TZ(st.start_utc,'+00:00','+07:00'), '%Y-%m-%d') AS show_date,
              DATE_FORMAT(CONVERT_TZ(st.start_utc,'+00:00','+07:00'), '%H:%i')   AS show_time
         FROM showtimes st
         JOIN screens  s  ON s.id  = st.screen_id
         JOIN theaters th ON th.id = s.theater_id
        WHERE st.id = ? LIMIT 1`, [showtimeId]
    );
    if (!meta) return res.status(404).json({ error: 'Showtime not found' });

    // ensure inventory exists (available by default)
    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS c FROM seat_inventory WHERE showtime_id=?`, [showtimeId]
    );
    if (!countRow.c) {
      let seatLayout;
      try { seatLayout = JSON.parse(meta.seat_map_json || '{}'); }
      catch { seatLayout = { rows: [], aisles: [] }; }

      const rows = Array.isArray(seatLayout.rows) ? seatLayout.rows : [];
      const values = [];
      for (const r of rows) {
        const rowLabel = String(r.row || '').toUpperCase();
        const cnt = Number(r.count || 0);
        for (let i = 1; i <= cnt; i++) {
          values.push([showtimeId, `${rowLabel}${i}`, 'standard', 'available', null]);
        }
      }
      if (values.length) {
        await pool.query(
          `INSERT INTO seat_inventory (showtime_id, seat_code, seat_class, status, hold_expires_at)
           VALUES ?`, [values]
        );
      }
    }

    /* ---- ADD THESE TWO QUERIES: expire timed-out holds BEFORE reading seats ---- */
    await pool.query(
      `UPDATE seat_inventory
          SET status='available', locked_by=NULL, order_id=NULL, hold_expires_at=NULL
        WHERE showtime_id=? AND status='locked' AND hold_expires_at < NOW()`,
      [showtimeId]
    );
    await pool.query(
      `UPDATE orders
          SET status='expired', updated_at=NOW()
        WHERE showtime_id=? AND status='hold' AND expires_at < NOW()`,
      [showtimeId]
    );
    /* --------------------------------------------------------------------------- */

    // fetch seats (treat as locked only if lock hasn't expired)
    const [seats] = await pool.query(
      `SELECT seat_code, seat_class,
              CASE
                WHEN status='booked' THEN 'booked'
                WHEN status='locked' AND hold_expires_at > NOW() THEN 'locked'
                ELSE 'available'
              END AS status
         FROM seat_inventory
        WHERE showtime_id=?
        ORDER BY seat_code`,
      [showtimeId]
    );

    // return
    let layout;
    try { layout = JSON.parse(meta.seat_map_json || '{}'); }
    catch { layout = { rows: [], aisles: [] }; }

    res.json({
      meta: {
        theater_name: meta.theater_name,
        date: meta.show_date,
        time: meta.show_time,
        price: meta.price,
        currency: meta.currency,
        screen_type: meta.screen_type,
        language: meta.language
      },
      layout,
      seats
    });
  } catch (err) { next(err); }
};

