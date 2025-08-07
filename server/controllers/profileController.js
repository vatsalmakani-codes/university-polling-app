// server/controllers/profileController.js (NEW FILE)
const User = require('../models/userModel');
const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');
const bcrypt = require('bcryptjs');

// @desc    Update user's own profile (name)
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.name = req.body.name || user.name;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Change user's own password
exports.changeMyPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Incorrect old password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Delete user's own account
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await Poll.deleteMany({ createdBy: userId });
    await Vote.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ msg: 'Your account has been permanently deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};