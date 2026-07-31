const express = require('express');
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const { protect, requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

// POST /api/complaints — Citizen creates complaint
router.post('/', protect, requireRole('citizen', 'admin'), upload.single('image'),
  auditLogger('CREATE_COMPLAINT', 'Complaint'), async (req, res) => {
    try {
      const { title, description, category, priority, priorityScore, urgencyReason,
        aiSummary, aiKeywords, sentimentScore, address, lat, lng,
        departmentName, estimatedResolutionDays, suggestedTitle } = req.body;

      // Find or fallback department
      let dept = await Department.findOne({ name: departmentName });
      if (!dept) dept = await Department.findOne({});

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

      const complaint = await Complaint.create({
        title: suggestedTitle || title,
        description,
        category: category || 'other',
        priority: priority || 'medium',
        priorityScore: priorityScore || 50,
        urgencyReason,
        aiSummary,
        aiKeywords: aiKeywords ? JSON.parse(aiKeywords) : [],
        sentimentScore,
        location: { address, lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
        imageUrl,
        department: dept?._id,
        citizen: req.user._id,
        estimatedResolutionDays: estimatedResolutionDays || 3,
        timeline: [{ status: 'pending', note: 'Complaint submitted by citizen', by: req.user._id }],
      });

      const populated = await complaint.populate(['department', 'citizen']);
      res.status(201).json(populated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/complaints/my — Citizen's own complaints
router.get('/my', protect, requireRole('citizen'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .populate('department', 'name code color')
      .populate('assignedOfficer', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/officer/assigned — Officer's assigned complaints
router.get('/officer/assigned', protect, requireRole('officer'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedOfficer: req.user._id })
      .populate('department', 'name code color')
      .populate('citizen', 'name email phone')
      .sort({ priorityScore: -1, createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/admin/all — Admin gets all complaints
router.get('/admin/all', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('department', 'name code color')
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(filter);
    res.json({ complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('department')
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/complaints/:id/status — Officer updates status
router.patch('/:id/status', protect, requireRole('officer', 'admin'), upload.single('image'),
  auditLogger('UPDATE_STATUS', 'Complaint'), async (req, res) => {
    try {
      const { status, note, resolutionNote } = req.body;
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) return res.status(404).json({ message: 'Not found' });

      complaint.status = status;
      if (resolutionNote) complaint.resolutionNote = resolutionNote;
      if (status === 'resolved') complaint.resolvedAt = new Date();
      if (req.file) complaint.resolutionImageUrl = `/uploads/${req.file.filename}`;
      complaint.timeline.push({ status, note: note || `Status updated to ${status}`, by: req.user._id });
      await complaint.save();
      res.json(complaint);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PATCH /api/complaints/:id/assign — Admin assigns officer
router.patch('/:id/assign', protect, requireRole('admin'),
  auditLogger('ASSIGN_OFFICER', 'Complaint'), async (req, res) => {
    try {
      const { officerId } = req.body;
      const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        {
          assignedOfficer: officerId,
          status: 'assigned',
          $push: { timeline: { status: 'assigned', note: 'Officer assigned by admin', by: req.user._id } },
        },
        { new: true }
      ).populate(['department', 'assignedOfficer', 'citizen']);
      res.json(complaint);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
