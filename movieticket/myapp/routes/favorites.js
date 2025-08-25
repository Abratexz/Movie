// routes/favorites.js
const express = require('express');
const router = express.Router();

// Favorites page
router.get('/', (req, res) => {
  res.render('favorites/index', { title: 'My Favorite Movies' });
});

router.post('/add', (req, res) => {
  const { movieId } = req.body;
  console.log('Add favorite:', movieId);
  res.redirect('/favorites');
});

module.exports = router;
