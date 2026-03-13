const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shareAmount: { type: Number, required: true }
  }],
  splitMethod: {
    type: String,
    enum: ['equal', 'unequal', 'percentage', 'shares'],
    default: 'equal'
  },
  category: {
    type: String,
    enum: ['food', 'travel', 'rent', 'shopping', 'utilities', 'entertainment', 'other'],
    default: 'other'
  },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
