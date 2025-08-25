const pool = require('../../models/db');

function parseSeatMap(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, theater_id, is_active FROM screens ORDER BY name'
    );
    res.render('admin/screens/list', { title: 'Screens', user: req.session.user, rows });
  } catch (e) { next(e); }
};

exports.newForm = (req, res) => {
  res.render('admin/screens/new', {
    title: 'New Screen',
    user: req.session.user,
    row: { name: '', theater_id: '', seat_map_json: '', is_active: 1 }
  });
};

exports.create = async (req, res, next) => {
  try {
    const { name, theater_id, seat_map_json, is_active } = req.body;
    if (!name) {
      req.flash('error', 'Name is required.');
      return res.redirect('/admin/screens/new');
    }
    const seatMap = parseSeatMap(seat_map_json);
    await pool.query(
      'INSERT INTO screens (name, theater_id, seat_map_json, is_active) VALUES (?,?,?,?)',
      [name.trim(), theater_id || 0, seatMap ? JSON.stringify(seatMap) : null, is_active ? 1 : 0]
    );
    req.flash('success', 'Screen created.');
    res.redirect('/admin/screens');
  } catch (e) { next(e); }
};

exports.editForm = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM screens WHERE id=?', [req.params.id]);
    if (rows.length === 0) return next(new Error('Screen not found'));
    const row = rows[0];
    res.render('admin/screens/edit', {
      title: 'Edit Screen',
      user: req.session.user,
      row: { ...row, seat_map_json: row.seat_map_json ? JSON.stringify(row.seat_map_json, null, 2) : '' }
    });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, theater_id, seat_map_json, is_active } = req.body;
    const seatMap = parseSeatMap(seat_map_json);
    await pool.query(
      'UPDATE screens SET name=?, theater_id=?, seat_map_json=?, is_active=? WHERE id=?',
      [name.trim(), theater_id || 0, seatMap ? JSON.stringify(seatMap) : null, is_active ? 1 : 0, req.params.id]
    );
    req.flash('success', 'Screen updated.');
    res.redirect('/admin/screens');
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    // Prevent delete if screen has showtimes
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM showtimes WHERE screen_id=?', [req.params.id]);
    if (cnt > 0) {
      req.flash('error', 'Cannot delete: screen has showtimes.');
      return res.redirect('/admin/screens');
    }
    await pool.query('DELETE FROM screens WHERE id=?', [req.params.id]);
    req.flash('success', 'Screen deleted.');
    res.redirect('/admin/screens');
  } catch (e) { next(e); }
};
