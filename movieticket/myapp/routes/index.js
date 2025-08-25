// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/movies/home');
  }
  res.render('index', { user: null });
});

module.exports = router;
