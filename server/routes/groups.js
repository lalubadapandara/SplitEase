const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

// Get all groups for current user
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .populate('creator', 'name email')
      .sort('-createdAt');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create group
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, memberEmails } = req.body;
    const User = require('../models/User');
    
    let memberIds = [req.user._id];
    if (memberEmails && memberEmails.length > 0) {
      const members = await User.find({ email: { $in: memberEmails } });
      memberIds = [...new Set([...memberIds, ...members.map(m => m._id.toString())])];
    }

    const group = new Group({ name, icon: icon || '🏠', creator: req.user._id, members: memberIds });
    await group.save();
    await group.populate('members', 'name email avatar');
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get group by id
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate('creator', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some(m => m._id.toString() === req.user._id.toString()))
      return res.status(403).json({ message: 'Not a member' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add member to group
router.post('/:id/members', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const group = await Group.findById(req.params.id);
    if (group.members.includes(user._id))
      return res.status(400).json({ message: 'Already a member' });

    group.members.push(user._id);
    await group.save();
    await group.populate('members', 'name email avatar');
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get group balances
router.get('/:id/balances', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email avatar');
    const expenses = await Expense.find({ group: req.params.id }).populate('paidBy participants.user');
    const settlements = await Settlement.find({ group: req.params.id });

    // Build balance map
    const balances = {};
    group.members.forEach(m => { balances[m._id.toString()] = 0; });

    expenses.forEach(exp => {
      const paidById = exp.paidBy._id.toString();
      exp.participants.forEach(p => {
        const userId = p.user._id.toString();
        if (userId !== paidById) {
          balances[paidById] = (balances[paidById] || 0) + p.shareAmount;
          balances[userId] = (balances[userId] || 0) - p.shareAmount;
        }
      });
    });

    settlements.forEach(s => {
      balances[s.payer.toString()] = (balances[s.payer.toString()] || 0) + s.amount;
      balances[s.receiver.toString()] = (balances[s.receiver.toString()] || 0) - s.amount;
    });

    // Generate simplified debts
    const memberMap = {};
    group.members.forEach(m => { memberMap[m._id.toString()] = m; });

    const creditors = [];
    const debtors = [];
    Object.entries(balances).forEach(([id, bal]) => {
      if (bal > 0.01) creditors.push({ id, balance: bal });
      else if (bal < -0.01) debtors.push({ id, balance: -bal });
    });

    const transactions = [];
    let i = 0, j = 0;
    const cred = [...creditors];
    const debt = [...debtors];

    while (i < cred.length && j < debt.length) {
      const amount = Math.min(cred[i].balance, debt[j].balance);
      transactions.push({
        from: memberMap[debt[j].id],
        to: memberMap[cred[i].id],
        amount: Math.round(amount * 100) / 100
      });
      cred[i].balance -= amount;
      debt[j].balance -= amount;
      if (cred[i].balance < 0.01) i++;
      if (debt[j].balance < 0.01) j++;
    }

    res.json({ balances, transactions, members: group.members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete group
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only creator can delete' });
    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
