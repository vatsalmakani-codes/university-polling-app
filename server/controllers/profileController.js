const User = require('../models/userModel');
const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');
const Feedback = require('../models/feedbackModel');
const bcrypt = require('bcryptjs');

/**
 * @desc    Update user's own profile (name)
 * @route   PUT /api/profile/me
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.name = req.body.name || user.name;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Change user's own password
 * @route   PUT /api/profile/change-password
 */
exports.changeMyPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect old password.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Upload or update user's profile picture
 * @route   PUT /api/profile/picture
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload an image file.' });
    }
    const user = await User.findById(req.user.id);
    const imagePath = `/${req.file.path.replace(/\\/g, "/")}`;
    user.profilePicture = imagePath;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Delete user's own account
 * @route   DELETE /api/profile/me
 */
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    // Cleanup all user's data
    await Poll.deleteMany({ createdBy: userId });
    await Vote.deleteMany({ user: userId });
    await Feedback.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ msg: 'Your account has been permanently deleted.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};