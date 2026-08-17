const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:order_id', chatController.getMessages);
router.post('/', chatController.sendMessage);

module.exports = router;
