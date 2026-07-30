const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  status: String,
  note: String,
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['road', 'water', 'electricity', 'garbage', 'health', 'traffic', 'other'],
    default: 'other',
  },
  subcategory: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  priorityScore: { type: Number, default: 50 },
  urgencyReason: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  aiKeywords: [String],
  sentimentScore: { type: String, default: 'neutral' },
  location: {
    address: { type: String, default: '' },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  imageUrl: { type: String, default: '' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDuplicate: { type: Boolean, default: false },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  estimatedResolutionDays: { type: Number, default: 3 },
  resolvedAt: { type: Date },
  resolutionNote: { type: String, default: '' },
  timeline: [timelineSchema],
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
