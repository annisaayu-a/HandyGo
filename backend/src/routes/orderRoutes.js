const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/pending', orderController.getPendingOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/accept', orderController.acceptOrder);

module.exports = router;
