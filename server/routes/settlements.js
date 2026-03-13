const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settlement = require('../models/Settlement');

// Get settlements for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('payer', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort('-date');
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create settlement
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, amount, groupId, method, note } = req.body;
    const settlement = new Settlement({
      payer: req.user._id,
      receiver: receiverId,
      amount, group: groupId,
      method: method || 'cash',
      note
    });
    await settlement.save();
    await settlement.populate('payer receiver', 'name email avatar');
    res.status(201).json(settlement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
