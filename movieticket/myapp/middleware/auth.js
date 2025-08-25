

// Must be logged in
function requireAuth(req, res, next) {
  if (req.session.user) return next();

  const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest';
  if (isAjax) return res.status(401).json({ ok: false, error: 'AUTH' });

  req.flash('error', 'Please log in');
  res.redirect('/auth/login');
};

// Must be admin
function requireAdmin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please log in as admin.');
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'admin') {
    req.flash('error', 'You are not authorized to access this page.');
    return res.redirect('/');
  }
  next();
}


function attachUser(req, res, next) {
  res.locals.user = req.session.user || null;
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  attachUser
};
