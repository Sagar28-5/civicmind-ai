const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Department = require('../models/Department');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — Main dashboard stats
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
  try {
    const [
      total, pending, assigned, inProgress, resolved, critical,
      todayResolved, officers, departments,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'assigned' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ priority: 'critical' }),
      Complaint.countDocuments({ status: 'resolved', resolvedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      User.countDocuments({ role: 'officer' }),
      Department.countDocuments(),
    ]);

    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const last7Days = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const deptStats = await Complaint.aggregate([
      { $group: { _id: '$department', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
    ]);

    res.json({
      total, pending, assigned, inProgress, resolved, critical,
      todayResolved, officers, departments,
      aiAccuracy: 94, // demo value
      categoryStats, last7Days, deptStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/heatmap — Complaint locations for map
router.get('/heatmap', protect, requireRole('admin'), async (req, res) => {
  try {
    const complaints = await Complaint.find(
      { 'location.lat': { $ne: 0 } },
      'location category priority status createdAt title'
    ).limit(200);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/officers — Officer performance list
router.get('/officers', protect, requireRole('admin'), async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-passwordHash').populate('department', 'name');
    const withStats = await Promise.all(officers.map(async (o) => {
      const assigned = await Complaint.countDocuments({ assignedOfficer: o._id });
      const resolved = await Complaint.countDocuments({ assignedOfficer: o._id, status: 'resolved' });
      return { ...o.toJSON(), assigned, resolved };
    }));
    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/audit — Audit logs
router.get('/audit', protect, requireRole('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .populate('user', 'name email role');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/feed — Recent AI events for live feed
router.get('/feed', protect, requireRole('admin'), async (req, res) => {
  try {
    const recent = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('citizen', 'name')
      .populate('department', 'name');
    const feed = recent.map((c) => ({
      id: c._id,
      event: c.status === 'resolved' ? '✅ Complaint Resolved' : c.isDuplicate ? '🔄 Duplicate Detected' : '🤖 AI Classified',
      title: c.title,
      category: c.category,
      priority: c.priority,
      department: c.department?.name,
      time: c.createdAt,
    }));
    res.json(feed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
