// controllers/admin/userController.js
const pool = require('../../models/db');

exports.index = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const role = (req.query.role || '').trim();

    const where = [];
    const params = [];
    if (q) {
      where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (role) {
      where.push('role = ?');
      params.push(role);
    }
    const wsql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, name, email, phone, role, created_at
         FROM users
         ${wsql}
         ORDER BY created_at DESC, id DESC`,
      params
    );

    res.render('admin/users/list', {
      title: 'Manage Users',
      user: req.session.user,
      rows,
      q,
      role,
    });
  } catch (e) { next(e); }
};

exports.newForm = (req, res) => {
  res.render('admin/users/new', {
    title: 'New User',
    user: req.session.user
  });
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, role = 'customer', password = '123' } = req.body;
    await pool.query(
      `INSERT INTO users (name, email, phone, role, password)
       VALUES (?,?,?,?,?)`,
      [name, email, phone || null, role, password]
    );
    res.redirect('/admin/users');
  } catch (e) { next(e); }
};

exports.editForm = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [[row]] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
    if (!row) return res.status(404).render('errors/404', { title: 'Not Found', user: req.session.user });
    res.render('admin/users/edit', {
      title: `Edit ${row.name}`,
      user: req.session.user,
      row
    });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, email, phone, role } = req.body;
    await pool.query(
      'UPDATE users SET name=?, email=?, phone=?, role=? WHERE id=?',
      [name, email, phone || null, role, id]
    );
    res.redirect('/admin/users');
  } catch (e) { next(e); }
};

exports.destroy = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.redirect('/admin/users');
  } catch (e) { next(e); }
};
