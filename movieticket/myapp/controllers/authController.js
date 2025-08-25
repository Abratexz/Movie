const pool = require('../models/db');
const crypto = require('crypto');

// =====================================
// Show Pages
// =====================================
exports.showLoginForm = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    error: res.locals.error,
    success: res.locals.success
  });
};

exports.showRegisterForm = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    error: res.locals.error,
    success: res.locals.success
  });
};

exports.showForgotPasswordForm = (req, res) => {
  const resetLink = req.session.resetLink || null;
  delete req.session.resetLink; 

  res.render('auth/forgot', {
    title: 'Forgot Password',
    error: res.locals.error,
    success: res.locals.success,
    resetLink
  });
};
exports.showResetPasswordForm = async (req, res) => {
  const { token } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token=? AND expires_at > NOW() AND used_at IS NULL',
      [token]
    );

    if (rows.length === 0) {
      req.flash('error', 'Invalid or expired reset link.');
      return res.redirect('/auth/forgot');
    }

    res.render('auth/reset', {
      title: 'Reset Password',
      token,
      error: res.locals.error,
      success: res.locals.success
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error.');
    res.redirect('/auth/forgot');
  }
};

// =====================================
// Register (Form POST with flash)
// =====================================
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email=?', [
      email.toLowerCase().trim()
    ]);

    if (existing.length > 0) {
      req.flash('error', 'Email already in use');
      return res.redirect('/auth/register');
    }

    await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone || null, password, 'customer']
    );

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error. Try again.');
    res.redirect('/auth/register');
  }
};

// =====================================
// Login
// =====================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email=? AND password=?',
      [email.toLowerCase().trim(), password]
    );

    if (rows.length === 0) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    req.session.user = rows[0];
    req.flash('success', 'Welcome back!');
    res.redirect('/movies/home');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error. Try again.');
    res.redirect('/auth/login');
  }
};

// =====================================
// Forgot Password
// =====================================
exports.sendResetLink = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email=?', [
      email.toLowerCase().trim()
    ]);

    if (users.length === 0) {
      req.flash('error', 'Email not found');
      return res.redirect('/auth/forgot');
    }

    const userId = users[0].id;
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    // dev only: just show the reset link
    const resetLink = `http://localhost:3000/auth/reset/${token}`;
    req.flash('success', `Link`);
    req.session.resetLink = resetLink;
    res.redirect('/auth/forgot');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error. Try again.');
    res.redirect('/auth/forgot');
  }
};

// =====================================
// Reset Password
// =====================================
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token=? AND expires_at > NOW() AND used_at IS NULL',
      [token]
    );

    if (rows.length === 0) {
      req.flash('error', 'Invalid or expired reset link.');
      return res.redirect('/auth/forgot');
    }

    const reset = rows[0];

    // update user password (⚠ plain text for mini project)
    await pool.query('UPDATE users SET password=? WHERE id=?', [password, reset.user_id]);

    // mark token as used
    await pool.query('UPDATE password_resets SET used_at=NOW() WHERE id=?', [reset.id]);

    req.flash('success', 'Password has been reset. Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error. Try again.');
    res.redirect('/auth/forgot');
  }
};

// =====================================
// Logout
// =====================================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
