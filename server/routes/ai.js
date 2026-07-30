const express = require('express');
const { analyzeComplaint, predictIssues, ariaChat } = require('../utils/gemini');
const { protect, requireRole } = require('../middleware/auth');
const Complaint = require('../models/Complaint');

const router = express.Router();

// POST /api/ai/analyze — Analyze complaint before submission
router.post('/analyze', protect, async (req, res) => {
  try {
    const { text, imageDesc } = req.body;
    if (!text) return res.status(400).json({ message: 'Complaint text required' });
    const result = await analyzeComplaint(text, imageDesc || '');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/predict — Predict upcoming city issues
router.post('/predict', protect, requireRole('admin'), async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: { category: '$category', priority: '$priority' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    const predictions = await predictIssues(stats);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/chat — ARIA admin chat
router.post('/chat', protect, requireRole('admin'), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const [totalComplaints, resolved, pending, critical] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ priority: 'critical' }),
    ]);

    const context = { totalComplaints, resolved, pending, critical, date: new Date().toDateString() };
    const response = await ariaChat(message, context);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
