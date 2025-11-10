const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  color: {
    type: String,
    default: '#4A5568'
  },
  icon: {
    type: String,
    default: 'folder'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

categorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Category', categorySchema);