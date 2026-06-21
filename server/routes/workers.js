const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const { protect } = require('./auth');

// GET all workers
router.get('/', protect, async (req, res) => {
  try {
    const workers = await Worker.find().sort({ name: 1 });
    res.json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET delivery persons only
router.get('/delivery', async (req, res) => {
  try {
    const deliveryPersons = await Worker.find({ role: 'delivery', isActive: true });
    res.json({ success: true, data: deliveryPersons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET single worker
router.get('/:id', protect, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST add new worker
router.post('/', protect, async (req, res) => {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// PUT update worker
router.put('/:id', protect, async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// DELETE worker
router.delete('/:id', protect, async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST check-in
router.post('/:id/checkin', protect, async (req, res) => {
  try {
    const workerId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await Attendance.findOneAndUpdate(
      { workerId, date: today },
      { checkIn: new Date(), status: 'present' },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST check-out
router.post('/:id/checkout', protect, async (req, res) => {
  try {
    const workerId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const attendance = await Attendance.findOne({ workerId, date: today });
    if (!attendance) return res.status(404).json({ success: false, message: 'No check-in found for today' });
    attendance.checkOut = now;
    if (attendance.checkIn) {
      const diffMs = now - attendance.checkIn;
      attendance.hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      if (attendance.hoursWorked > 8) {
        attendance.overtime = Math.round((attendance.hoursWorked - 8) * 100) / 100;
      }
    }
    await attendance.save();
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET attendance records
router.get('/:id/attendance', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { workerId: req.params.id };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST mark attendance (admin)
router.post('/attendance/mark', protect, async (req, res) => {
  try {
    const { workerId, date, status, note } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { workerId, date: new Date(date) },
      { status, note },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST calculate salary
router.post('/salary/calculate', protect, async (req, res) => {
  try {
    const { workerId, month, year } = req.body;
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const totalDays = end.getDate();

    const attendance = await Attendance.find({ workerId, date: { $gte: start, $lte: end } });
    const daysPresent = attendance.filter(a => a.status === 'present').length;
    const halfDays = attendance.filter(a => a.status === 'half_day').length;
    const effectiveDays = daysPresent + halfDays * 0.5;
    const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);

    const baseSalary = worker.salary;
    const perDaySalary = baseSalary / totalDays;
    const earnedSalary = Math.round(perDaySalary * effectiveDays);
    const overtimePay = Math.round(overtimeHours * (worker.role === 'delivery' ? 120 : 100));
    const netSalary = earnedSalary + overtimePay;

    const salary = await Salary.findOneAndUpdate(
      { workerId, month, year },
      {
        baseSalary, daysPresent: effectiveDays, totalDays,
        overtimeHours, overtimeRate: worker.role === 'delivery' ? 120 : 100,
        netSalary
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// GET salary records
router.get('/salary/:workerId', protect, async (req, res) => {
  try {
    const salaries = await Salary.find({ workerId: req.params.workerId }).sort({ year: -1, month: -1 });
    res.json({ success: true, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST pay salary
router.post('/salary/:id/pay', protect, async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(req.params.id, { isPaid: true, paidAt: new Date() }, { new: true });
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT update delivery person location
router.put('/delivery/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { lat, lng, isOnDelivery: true },
      { new: true }
    );
    if (!worker) return res.status(404).json({ success: false, message: 'Delivery person not found' });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET all salary summary for a month
router.get('/salary/summary/:month/:year', protect, async (req, res) => {
  try {
    const { month, year } = req.params;
    const salaries = await Salary.find({ month: parseInt(month), year: parseInt(year) }).populate('workerId', 'name role');
    res.json({ success: true, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
