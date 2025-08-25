const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const orders = require('../controllers/orderController');

router.post('/api/orders', requireAuth, orders.create);
router.get('/api/orders/:id', requireAuth, orders.getOrder);

router.get('/my-tickets', requireAuth, orders.myTicketsPage);
router.post('/orders/:id/cancel', requireAuth, orders.cancel);

module.exports = router;
