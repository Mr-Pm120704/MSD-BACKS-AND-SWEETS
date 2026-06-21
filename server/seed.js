const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Worker = require('./models/Worker');
const Admin = require('./models/Admin');

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/msdbacks');
  console.log('Connected to MongoDB');

  // Create default admin if none exists
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({ username: 'admin', password: 'admin123' });
    console.log('Default admin created (admin / admin123)');
  }

  // Seed workers
  const workerCount = await Worker.countDocuments();
  if (workerCount === 0) {
    const workers = [
      { name: 'Rajan Kumar', phone: '9876501234', role: 'delivery', salary: 12000, vehicle: 'TVS Apache', vehicleNo: 'TN-47-AB-1234', photo: '🚴', rating: 4.8, lat: 10.9601, lng: 78.0766 },
      { name: 'Murugan S', phone: '9876502345', role: 'delivery', salary: 12000, vehicle: 'Activa', vehicleNo: 'TN-47-CD-5678', photo: '🏍️', rating: 4.6, lat: 10.9560, lng: 78.0710 },
      { name: 'Selvam K', phone: '9876503456', role: 'delivery', salary: 11000, vehicle: 'Splendor', vehicleNo: 'TN-47-EF-9012', photo: '🛵', rating: 4.9, lat: 10.9640, lng: 78.0820 },
      { name: 'Kumar R', phone: '9876504567', role: 'baker', salary: 15000 },
      { name: 'Priya M', phone: '9876505678', role: 'cashier', salary: 10000 },
      { name: 'Senthil V', phone: '9876506789', role: 'helper', salary: 8000 },
    ];
    await Worker.insertMany(workers);
    console.log(`${workers.length} workers seeded`);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
