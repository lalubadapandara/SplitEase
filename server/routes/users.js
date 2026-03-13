const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search users by email
router.get('/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json([]);
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id }
    }).limit(5);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
