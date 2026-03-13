const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Get expenses for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort('-date');
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Dashboard summary  
router.get('/dashboard/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const Settlement = require('../models/Settlement');
    const expenses = await Expense.find({
      $or: [{ paidBy: userId }, { 'participants.user': userId }]
    }).populate('paidBy', 'name').populate('participants.user', 'name');
    const settlements = await Settlement.find({ $or: [{ payer: userId }, { receiver: userId }] });
    let totalOwed = 0, totalOwe = 0;
    expenses.forEach(exp => {
      const paidByMe = exp.paidBy._id.toString() === userId.toString();
      exp.participants.forEach(p => {
        const pid = p.user._id.toString();
        if (paidByMe && pid !== userId.toString()) totalOwed += p.shareAmount;
        else if (!paidByMe && pid === userId.toString()) totalOwe += p.shareAmount;
      });
    });
    settlements.forEach(s => {
      if (s.payer.toString() === userId.toString()) totalOwe -= s.amount;
      if (s.receiver.toString() === userId.toString()) totalOwed -= s.amount;
    });
    res.json({
      totalOwed: Math.max(0, Math.round(totalOwed * 100) / 100),
      totalOwe: Math.max(0, Math.round(totalOwe * 100) / 100),
      netBalance: Math.round((totalOwed - totalOwe) * 100) / 100
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all expenses for current user
router.get('/my', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [{ paidBy: req.user._id }, { 'participants.user': req.user._id }]
    })
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('group', 'name icon')
      .sort('-date').limit(50);
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add expense
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, paidBy, groupId, participants, splitMethod, category, description, date } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Always trust pre-computed shareAmounts from frontend
    const calculatedParticipants = participants.map(p => ({
      user: p.user || p.userId,
      shareAmount: parseFloat(p.shareAmount) || 0
    }));

    const expense = new Expense({
      title, amount, paidBy, group: groupId,
      participants: calculatedParticipants,
      splitMethod: splitMethod || 'equal',
      category: category || 'other',
      description, date: date || new Date()
    });
    await expense.save();
    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('participants.user', 'name email avatar');
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.paidBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the payer can edit this expense' });

    const { title, amount, paidBy, participants, splitMethod, category, description, date } = req.body;

    const calculatedParticipants = participants.map(p => ({
      user: p.user || p.userId,
      shareAmount: parseFloat(p.shareAmount) || 0
    }));

    expense.title = title;
    expense.amount = amount;
    expense.paidBy = paidBy;
    expense.participants = calculatedParticipants;
    expense.splitMethod = splitMethod;
    expense.category = category;
    expense.description = description;
    expense.date = date || expense.date;

    await expense.save();
    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('participants.user', 'name email avatar');
    res.json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.paidBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the payer can delete this expense' });
    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
