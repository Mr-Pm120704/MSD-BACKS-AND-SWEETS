const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('./auth'); // Assuming auth middleware

// 1. Place a new order (Public API)
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. Track Order (Public API)
router.get('/track/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    // We search by either 'id' (the MSD123456 string) or 'phone'
    const order = await Order.findOne({ $or: [{ id: orderId }, { phone: orderId }] });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. Get all orders (Protected Admin API)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ placedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 4. Update order status (Protected Admin API)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id }, 
      { status: req.body.status }, 
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
