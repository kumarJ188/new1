const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    joinedAt: { type: Date },
  },
  { timestamps: true }
);

membershipSchema.index({ user: 1, community: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);
