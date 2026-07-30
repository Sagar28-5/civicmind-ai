const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, default: 'system' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
