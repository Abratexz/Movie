// controllers/admin/movieController.js
const path   = require('path');
const fs     = require('fs');
const multer = require('multer');
const pool   = require('../../models/db');

/* ------------------------------------------------------------------ */
/*  File uploads (posters)                                             */
/* ------------------------------------------------------------------ */

// Ensure destination dir exists: /public/images/posters
const POSTER_DIR = path.join(__dirname, '../../public/images/posters');
fs.mkdirSync(POSTER_DIR, { recursive: true });

// only allow common image types
const imageMimes = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, POSTER_DIR),
    filename: (_req, file, cb) => {
      const safe =
        `${Date.now()}-${file.originalname}`
          .toLowerCase()
          .replace(/[^a-z0-9.\-]/g, '_');
      cb(null, safe);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (imageMimes.has(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type'));
  }
});
exports.uploadPoster = upload.single('poster');

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizePoster(p) {
  if (!p) return 'posters/default.png'; // relative to /public/images
  if (p.startsWith('http') || p.startsWith('posters/') || p.startsWith('images/')) return p;
  return `posters/${p}`;
}

function asInt(v, def = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

function getGenreIdsFromBody(genre_ids) {
  // supports: single value string or array of strings
  if (!genre_ids) return [];
  const arr = Array.isArray(genre_ids) ? genre_ids : [genre_ids];
  return arr.map(x => asInt(x, 0)).filter(Boolean);
}

async function syncGenres(movieId, genreIds) {
  const ids = getGenreIdsFromBody(genreIds);
  await pool.query('DELETE FROM movie_genres WHERE movie_id=?', [movieId]);
  if (!ids.length) return;
  const values = ids.map(gid => [movieId, gid]);
  await pool.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ?', [values]);
}

function extractGenreIds(b) {
  const raw = b.genre_ids ?? b['genre_ids[]'];
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map(v => parseInt(v, 10))
    .filter(n => Number.isFinite(n) && n > 0);
}

/* ------------------------------------------------------------------ */
/*  Controllers                                                        */
/* ------------------------------------------------------------------ */

// GET /admin/movies
exports.index = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const where = q ? 'WHERE m.title LIKE ?' : '';
    const params = q ? [`%${q}%`] : [];

    const sql = `
      SELECT
        m.id,
        m.title,
        m.duration_min,
        m.poster_url,
        m.release_date,
        DATE_FORMAT(m.release_date, '%d %b %Y') AS release_date_label
      FROM movies m
      ${where}
      ORDER BY m.created_at DESC, m.id DESC
    `;

    const [rows] = await pool.query(sql, params);

    const movies = rows.map(m => ({
      ...m,
      poster_url: normalizePoster(m.poster_url)
    }));

    res.render('admin/movies_admin/list', {
      title: 'Manage Movies',
      user: req.session.user || null,
      rows: movies,
      q
    });
  } catch (err) {
    next(err);
  }
};

// GET /admin/movies/new
exports.newForm = async (req, res, next) => {
  try {
    const [genres] = await pool.query('SELECT id, name FROM genres ORDER BY name');
    res.render('admin/movies_admin/new', {
      title : 'New Movie',
      user  : req.session.user || null,
      genres
    });
  } catch (err) { next(err); }
};

// POST /admin/movies/new
exports.create = async (req, res, next) => {
  try {
    const b = req.body;
    const poster_url = req.file
      ? `posters/${req.file.filename}`
      : (b.poster_url ? normalizePoster(b.poster_url) : null);

    const [rs] = await pool.query(
      `INSERT INTO movies
         (title, duration_min, rating, description, poster_url, trailer_url, release_date)
       VALUES (?,?,?,?,?,?,?)`,
      [
        b.title,
        asInt(b.duration_min, 0),
        b.rating || null,
        b.description || null,
        poster_url,
        b.trailer_url || null,
        b.release_date || null
      ]
    );

    await syncGenres(rs.insertId, extractGenreIds(b));
    res.redirect('/admin/movies');
  } catch (err) { next(err); }
};


// GET /admin/movies/:id/edit
exports.editForm = async (req, res, next) => {
  try {
    const id = asInt(req.params.id);
    const [[row]] = await pool.query('SELECT * FROM movies WHERE id=?', [id]);
    if (!row) {
      return res.status(404).render('errors/404', { title: 'Not Found', user: req.session.user || null });
    }

    const [genres] = await pool.query('SELECT id, name FROM genres ORDER BY name');
    const [mgs]    = await pool.query('SELECT genre_id FROM movie_genres WHERE movie_id=?', [id]);

    const movie = { ...row, poster_url: normalizePoster(row.poster_url) };
    const selectedGenreIds = mgs.map(x => x.genre_id);

    res.render('admin/movies_admin/edit', {
      title : `Edit ${row.title}`,
      user  : req.session.user || null,
      movie,
      genres,
      selectedGenreIds
    });
  } catch (err) { next(err); }
};

// POST /admin/movies/:id/edit
exports.update = async (req, res, next) => {
  try {
    const id = asInt(req.params.id);
    const b  = req.body;
    let poster_url = b.existing_poster ? normalizePoster(b.existing_poster) : null;

    if (req.file) {
      const old = b.existing_poster;
      poster_url = `posters/${req.file.filename}`;
      if (old && old.startsWith('posters/')) {
        const toDelete = path.join(POSTER_DIR, path.basename(old));
        fs.unlink(toDelete, () => {});
      }
    }

    await pool.query(
      `UPDATE movies
          SET title=?, duration_min=?, rating=?, description=?, poster_url=?, trailer_url=?, release_date=?
        WHERE id=?`,
      [
        b.title,
        asInt(b.duration_min, 0),
        b.rating || null,
        b.description || null,
        poster_url,
        b.trailer_url || null,
        b.release_date || null,
        id
      ]
    );

    await syncGenres(id, extractGenreIds(b));
    res.redirect('/admin/movies');
  } catch (err) { next(err); }
};

// POST /admin/movies/:id/delete
exports.destroy = async (req, res, next) => {
  try {
    const id = asInt(req.params.id);

    // Optionally: remove poster file if it is a local poster (posters/...)
    const [[row]] = await pool.query('SELECT poster_url FROM movies WHERE id=?', [id]);
    if (row && row.poster_url && String(row.poster_url).startsWith('posters/')) {
      const filePath = path.join(POSTER_DIR, path.basename(row.poster_url));
      fs.unlink(filePath, () => {}); // ignore errors
    }

    await pool.query('DELETE FROM movie_genres WHERE movie_id=?', [id]);
    await pool.query('DELETE FROM movies WHERE id=?', [id]);

    res.redirect('/admin/movies');
  } catch (err) { next(err); }
};
