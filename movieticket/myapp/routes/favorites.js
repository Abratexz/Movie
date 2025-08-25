// routes/favorites.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const favoriteCtl = require('../controllers/favoriteController');

router.use(requireAuth);

router.get('/', favoriteCtl.index);
router.post('/:movieId/toggle', favoriteCtl.toggle);
router.get('/:movieId/check', favoriteCtl.check); // optional

module.exports = router;
