const Poll = require('../models/pollModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// @desc    Admin creates a new poll
exports.createPoll = async (req, res) => {
  const { question, options, pollType, targetAudience, expiresAt } = req.body;
  try {
    const newPoll = new Poll({
      question,
      options: options.map(optionText => ({ optionText, votes: 0 })),
      createdBy: req.user.id,
      pollType, targetAudience, expiresAt,
    });
    const poll = await newPoll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Admin updates a poll's status, deadline, or audience
exports.updatePollSettings = async (req, res) => {
  const { status, expiresAt, targetAudience } = req.body;
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    // --- NEW LOGIC: Prevent re-opening an expired poll ---
    const newExpiry = expiresAt ? new Date(expiresAt) : new Date(poll.expiresAt);
    if (status === 'ACTIVE' && newExpiry < new Date()) {
        return res.status(400).json({ msg: 'Cannot set poll to ACTIVE because its deadline has passed. Please extend the deadline first.' });
    }
    // --- END NEW LOGIC ---

    if (status) poll.status = status;
    if (expiresAt) poll.expiresAt = expiresAt;
    if (targetAudience) poll.targetAudience = targetAudience;
    
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Admin publishes or unpublishes poll results
exports.publishPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });
    poll.resultsPublished = !poll.resultsPublished;
    if (poll.resultsPublished) {
      poll.status = 'CLOSED';
    }
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Admin resets a user's password
exports.resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: `Password for ${user.name} has been successfully reset.` });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Admin creates a new user (student or faculty)
exports.createNewUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Authorization Check: Only super-admins or sub-admins with the correct scope can create users.
  if (req.user.role === 'sub-admin') {
    if (
      (req.user.managedScope === 'STUDENT' && role !== 'student') ||
      (req.user.managedScope === 'FACULTY' && role !== 'faculty')
    ) {
      return res.status(403).json({ msg: 'You are not authorized to create a user with this role.' });
    }
  }

  try {
    if (!email.toLowerCase().endsWith('.edu')) {
      return res.status(400).json({ msg: 'Email must be a valid .edu address.' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User with this email already exists.' });

    user = new User({ name, email, role, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ msg: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};