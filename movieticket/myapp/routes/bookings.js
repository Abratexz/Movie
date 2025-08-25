// routes/bookings.js
const express = require('express');
const router = express.Router();

// Booking pages (public)
router.get('/', (req, res) => {
  res.render('bookings/index', { title: 'My Bookings' });
});

router.post('/create', (req, res) => {
  const { movieId, seats } = req.body;
  console.log('Booking:', movieId, seats);
  res.redirect('/bookings');
});

module.exports = router;
