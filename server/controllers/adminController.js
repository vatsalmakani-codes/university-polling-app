const Poll = require('../models/pollModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

/**
 * @desc    Admin creates a new poll
 * @route   POST /api/admin/polls
 * @access  Private (Admin only)
 */
exports.createPoll = async (req, res) => {
  const { question, options, pollType, targetAudience, expiresAt } = req.body;
  try {
    const newPoll = new Poll({
      question,
      options: options.map(optionText => ({ optionText, votes: 0 })),
      createdBy: req.user.id,
      pollType,
      targetAudience,
      expiresAt,
    });
    const poll = await newPoll.save();
    res.status(201).json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Admin updates a poll's status or deadline
 * @route   PUT /api/admin/polls/:id/status
 * @access  Private (Admin only)
 */
exports.updatePollStatus = async (req, res) => {
  const { status, expiresAt } = req.body;
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    if (status) poll.status = status;
    if (expiresAt) poll.expiresAt = expiresAt;

    await poll.save();
    res.json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Admin publishes or unpublishes poll results
 * @route   PUT /api/admin/polls/:id/publish
 * @access  Private (Admin only)
 */
exports.publishPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    // Toggle the boolean value
    poll.resultsPublished = !poll.resultsPublished;
    await poll.save();
    res.json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Admin resets a user's password
 * @route   POST /api/admin/users/:id/reset-password
 * @access  Private (Admin only)
 */
exports.resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: 'Please provide a new password with at least 6 characters.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: `Password for ${user.name} has been successfully reset.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};