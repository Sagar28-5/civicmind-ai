const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  head: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  color: { type: String, default: '#2563EB' },
  icon: { type: String, default: '🏛️' },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
