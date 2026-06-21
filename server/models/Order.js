const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  addr: { type: String, required: true },
  payment: { type: String, enum: ['cod', 'upi'], default: 'cod' },
  items: [
    { id: String, name: String, price: Number, qty: Number, emoji: String, catId: String }
  ],
  subtotal: { type: Number, required: true },
  delivery: { type: Number, default: 30 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'preparing', 'picked', 'on_way', 'delivered'], default: 'placed' },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  deliveryPersonName: { type: String },
  deliveryPersonPhone: { type: String },
  deliveryPersonVehicle: { type: String },
  deliveryPersonPhoto: { type: String },
  estimatedMins: { type: Number, default: 30 },
  placedAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
