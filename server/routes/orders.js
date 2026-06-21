const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Worker = require('../models/Worker');
const { protect } = require('./auth');

// Place a new order
router.post('/', async (req, res) => {
  try {
    const deliveryPersons = await Worker.find({ role: 'delivery', isActive: true });
    const dp = deliveryPersons.length > 0
      ? deliveryPersons[Math.floor(Math.random() * deliveryPersons.length)]
      : null;

    const orderData = {
      ...req.body,
      deliveryPersonId: dp ? dp._id : undefined,
      deliveryPersonName: dp ? dp.name : 'Not Assigned',
      deliveryPersonPhone: dp ? dp.phone : '',
      deliveryPersonVehicle: dp ? dp.vehicle : '',
      deliveryPersonPhoto: dp ? dp.photo : '🚴'
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Track order (public)
router.get('/track/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ $or: [{ id: orderId }, { phone: orderId }] }).populate('deliveryPersonId', 'name phone vehicle vehicleNo photo rating lat lng');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all orders (admin)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find().sort({ placedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update order status (admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'delivered') update.deliveredAt = new Date();
    const order = await Order.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Assign delivery person (admin)
router.put('/:id/assign', protect, async (req, res) => {
  try {
    const dp = await Worker.findById(req.body.deliveryPersonId);
    if (!dp) return res.status(404).json({ success: false, message: 'Delivery person not found' });
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      {
        deliveryPersonId: dp._id,
        deliveryPersonName: dp.name,
        deliveryPersonPhone: dp.phone,
        deliveryPersonVehicle: dp.vehicle,
        deliveryPersonPhoto: dp.photo
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
