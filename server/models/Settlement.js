const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  method: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'online'],
    default: 'cash'
  },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settlement', settlementSchema);
