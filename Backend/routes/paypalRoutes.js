const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');

// Create PayPal order
router.post('/orders', paypalController.createOrder);

// Capture PayPal order
router.post('/orders/:orderID/capture', paypalController.captureOrder);

module.exports = router;
