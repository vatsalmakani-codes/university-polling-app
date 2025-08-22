const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!email.toLowerCase().endsWith('.edu')) {
      return res.status(400).json({ msg: 'Registration is restricted to .edu email addresses only.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists.' });
    }

    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Authenticate a user and get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    // --- CORRECTED LOGIC for role mismatch ---
    const isAdminLogin = role === 'admin';
    const isUserAnAdmin = ['super-admin', 'sub-admin'].includes(user.role);

    if (isAdminLogin && !isUserAnAdmin) {
      return res.status(403).json({ msg: 'Access denied. Not an administrator.' });
    }
    if (!isAdminLogin && user.role !== role) {
      return res.status(403).json({ msg: 'Role mismatch. Please use the correct login portal.' });
    }
    // --- END CORRECTION ---
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });
    
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Get the logged-in user's profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  res.json(req.user);
};