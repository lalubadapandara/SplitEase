const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

// Always read from environment — never use a hardcoded fallback in production
const JWT_SECRET = process.env.JWT_SECRET;

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// ── REGISTER ──────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name: name.trim(), email: email.toLowerCase(), password });
    await user.save();

    const token = makeToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = makeToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GOOGLE OAUTH ──────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { name, email, googleId } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // New user — create account automatically
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: 'google_' + googleId + '_' + Date.now(),
        googleId,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = makeToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
