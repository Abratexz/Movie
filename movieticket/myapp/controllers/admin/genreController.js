// controllers/admin/genreController.js
const pool = require('../../models/db');

function cleanName(name) {
  return (name || '').trim();
}

async function existsByName(name, excludeId = null) {
  if (!name) return false;
  const sql = excludeId
    ? 'SELECT id FROM genres WHERE name = ? AND id <> ? LIMIT 1'
    : 'SELECT id FROM genres WHERE name = ? LIMIT 1';
  const params = excludeId ? [name, excludeId] : [name];
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

exports.list = async (req, res, next) => {
  try {
    const [genres] = await pool.query(
      'SELECT id, name FROM genres ORDER BY name ASC'
    );
    res.render('admin/genres/list', {
      title: 'Genres',
      user: req.session.user,
      genres
    });
  } catch (err) { next(err); }
};

exports.newForm = async (req, res, next) => {
  try {
    res.render('admin/genres/new', {
      title: 'New genre',
      user: req.session.user
    });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const name = cleanName(req.body.name);
    // basic validation
    if (!name || name.length < 2 || name.length > 100) {
      req.flash('error', 'Name is required (2–100 chars).');
      return res.redirect('/admin/genres/new');
    }
    if (await existsByName(name)) {
      req.flash('error', 'That genre already exists.');
      return res.redirect('/admin/genres/new');
    }

    await pool.query('INSERT INTO genres (name) VALUES (?)', [name]);
    req.flash('success', 'Genre created.');
    res.redirect('/admin/genres');
  } catch (err) { next(err); }
};

exports.editForm = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [[genre]] = await pool.query('SELECT id, name FROM genres WHERE id = ?', [id]);
    if (!genre) return res.status(404).render('errors/404', { title: 'Not found', user: req.session.user });

    res.render('admin/genres/edit', {
      title: `Edit genre`,
      user: req.session.user,
      genre
    });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const name = cleanName(req.body.name);

    if (!name || name.length < 2 || name.length > 100) {
      req.flash('error', 'Name is required (2–100 chars).');
      return res.redirect(`/admin/genres/${id}/edit`);
    }
    if (await existsByName(name, id)) {
      req.flash('error', 'Another genre with that name already exists.');
      return res.redirect(`/admin/genres/${id}/edit`);
    }

    await pool.query('UPDATE genres SET name = ? WHERE id = ?', [name, id]);
    req.flash('success', 'Genre updated.');
    res.redirect('/admin/genres');
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM genres WHERE id = ?', [id]); // movie_genres has ON DELETE CASCADE
    req.flash('success', 'Genre deleted.');
    res.redirect('/admin/genres');
  } catch (err) { next(err); }
};
