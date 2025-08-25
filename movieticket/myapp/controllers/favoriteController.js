// controllers/favoriteController.js
const pool = require('../models/db');

// tiny helper to normalize poster paths (same approach as your public controller)
function shapeMovies(rows) {
  return rows.map(m => {
    const p = m.poster_url || '';
    const needsPrefix = p && !p.startsWith('http') && !p.startsWith('posters/') && !p.startsWith('images/');
    return { ...m, poster_url: p ? (needsPrefix ? `posters/${p}` : p) : 'posters/default.png' };
  });
}

/**
 * GET /favorites
 * Renders the user's favorite movies as a grid.
 */
exports.index = async (req, res, next) => {
    try {
      const userId = req.session.user.id;
      const [rows] = await pool.query(
        `SELECT m.id, m.title, m.poster_url, m.duration_min, m.release_date
           FROM favorite_movies f
           JOIN movies m ON m.id = f.movie_id
          WHERE f.user_id = ?
          ORDER BY f.created_at DESC`,
        [userId]
      );
  
      const movies = rows.map(m => {
        const p = m.poster_url || '';
        const href = !p
          ? '/images/posters/default.png'
          : p.startsWith('http')
            ? p
            : `/images/${p}`;                    // <— key fix
        return { ...m, poster_href: href };
      });
  
      res.render('favorites/index', {
        title: 'My Favorite Movies',
        user: req.session.user,
        movies
      });
    } catch (e) { next(e); }
  };

/**
 * POST /favorites/:movieId/toggle
 * Toggles a movie as favorite for the logged-in user. Returns JSON.
 */
exports.toggle = async (req, res, next) => {
  try {
    const userId  = req.session.user.id;
    const movieId = parseInt(req.params.movieId, 10);

    // Try to add; if already exists (PK conflict), remove instead = toggle
    const [ins] = await pool.query(
      `INSERT IGNORE INTO favorite_movies (user_id, movie_id) VALUES (?, ?)`,
      [userId, movieId]
    );

    let favorited = false;
    if (ins.affectedRows === 1) {
      favorited = true;
    } else {
      await pool.query(
        `DELETE FROM favorite_movies WHERE user_id=? AND movie_id=?`,
        [userId, movieId]
      );
      favorited = false;
    }

    res.json({ ok: true, favorited });
  } catch (e) {
    next(e);
  }
};

/**
 * (Optional) GET /favorites/:movieId/check
 * Returns {favorited:boolean} to help set initial heart state on page load.
 */
exports.check = async (req, res, next) => {
  try {
    const userId  = req.session.user.id;
    const movieId = parseInt(req.params.movieId, 10);
    const [rows] = await pool.query(
      `SELECT 1 FROM favorite_movies WHERE user_id=? AND movie_id=? LIMIT 1`,
      [userId, movieId]
    );
    res.json({ ok: true, favorited: rows.length > 0 });
  } catch (e) { next(e); }
};
