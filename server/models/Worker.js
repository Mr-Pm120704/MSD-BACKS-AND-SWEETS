const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['delivery', 'baker', 'helper', 'cashier'], default: 'helper' },
  salary: { type: Number, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  vehicle: { type: String },
  vehicleNo: { type: String },
  photo: { type: String, default: '👷' },
  rating: { type: Number, default: 4.0 },
  lat: { type: Number, default: 10.9601 },
  lng: { type: Number, default: 78.0766 },
  isOnDelivery: { type: Boolean, default: false }
});

module.exports = mongoose.model('Worker', workerSchema);
