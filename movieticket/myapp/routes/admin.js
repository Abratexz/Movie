// routes/admin.js
const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/auth');
const userCtl  = require('../controllers/admin/userController');
const movieCtl = require('../controllers/admin/movieController');
const genreCtl = require('../controllers/admin/genreController');
const showtimeCtl = require('../controllers/admin/showtimeController');

// Gate everything under /admin
router.use(requireAuth, requireAdmin);

/* ---------------- USERS ---------------- */
router.get('/users',           userCtl.index);
router.get('/users/new',       userCtl.newForm);
router.post('/users',          userCtl.create);
router.get('/users/:id/edit',  userCtl.editForm);
router.post('/users/:id/edit', userCtl.update);
router.post('/users/:id/delete', userCtl.destroy);

/* ---------------- MOVIES --------------- */
router.get('/movies',             movieCtl.index);
router.get('/movies/new',         movieCtl.newForm);
router.post('/movies',            movieCtl.uploadPoster, movieCtl.create);
router.get('/movies/:id/edit',    movieCtl.editForm);
router.post('/movies/:id/edit',   movieCtl.uploadPoster, movieCtl.update);
router.post('/movies/:id/delete', movieCtl.destroy);

/* ---------------- GENRES --------------- */
router.get('/genres',             genreCtl.list);
router.get('/genres/new',         genreCtl.newForm);
router.post('/genres',            genreCtl.create);              // <— create
router.get('/genres/:id/edit',    genreCtl.editForm);
router.post('/genres/:id/edit',   genreCtl.update);
router.post('/genres/:id/delete', genreCtl.destroy);

/* ---------------- SHOWTIMES --------------- */
router.get('/showtimes', showtimeCtl.index);
router.get('/showtimes/new', showtimeCtl.newForm);
router.post('/showtimes/new', showtimeCtl.create);
router.get('/showtimes/:id/edit', showtimeCtl.editForm);
router.post('/showtimes/:id/edit', showtimeCtl.update);
router.post('/showtimes/:id/delete', showtimeCtl.destroy);
router.get('/showtimes/:id/seats', showtimeCtl.seatInventory);

module.exports = router;
