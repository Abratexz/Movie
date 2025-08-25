const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const payCtl = require('../controllers/paymentController');

router.use(requireAuth);

router.get('/',      payCtl.showPage);
router.get('/:id(\\d+)',   payCtl.showPage);

router.post('/confirm',  payCtl.confirmPayment); // <-- decline logic here
router.post('/:id(\\d+)/pay',  payCtl.payNow);

router.get('/fail',    payCtl.showFail);
router.get('/success', payCtl.showSuccess);

module.exports = router;




