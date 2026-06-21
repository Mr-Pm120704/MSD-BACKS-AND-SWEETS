const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { protect } = require('./auth');

// POST submit query/complaint/feedback
router.post('/', async (req, res) => {
  try {
    const query = await Query.create(req.body);
    res.status(201).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET all queries (admin)
router.get('/', protect, async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// PUT update query status/response
router.put('/:id', protect, async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!query) return res.status(404).json({ success: false, message: 'Query not found' });
    res.json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
