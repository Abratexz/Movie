const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/seats', paymentController.showPaymentPage);
router.post('/confirm', paymentController.confirmPayment);

module.exports = router;
