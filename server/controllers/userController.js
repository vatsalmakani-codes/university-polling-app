const User = require('../models/userModel');
const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Important: Also delete their associated data
    await Poll.deleteMany({ createdBy: req.params.id });
    await Vote.deleteMany({ user: req.params.id });
    await user.deleteOne();

    res.json({ msg: 'User and their associated data removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};