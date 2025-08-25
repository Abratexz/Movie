// routes/movies.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const moviePublicController = require('../controllers/moviePublicController');

router.get('/home', requireAuth, (req, res) => res.redirect('/movies/now-showing'));
router.get('/now-showing', requireAuth, moviePublicController.nowShowing);
router.get('/coming-soon', requireAuth, moviePublicController.comingSoon);

// detail page
router.get('/:id/showtimes', requireAuth, moviePublicController.showtimes);

// API used by the detail page (read-only seats; no holding)
router.get('/api/showtimes/:id/seats', requireAuth, moviePublicController.seatMap);

module.exports = router;
