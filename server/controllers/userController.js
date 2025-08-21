const User = require('../models/userModel');
const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');
const Feedback = require('../models/feedbackModel');

// @desc    Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Admin: Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ msg: 'User not found.' });

    // Prevent deleting super-admins
    if (userToDelete.role === 'super-admin') {
      return res.status(403).json({ msg: 'Cannot delete a super administrator.' });
    }
    
    // Cleanup associated data
    await Poll.deleteMany({ createdBy: req.params.id });
    await Vote.deleteMany({ user: req.params.id });
    await Feedback.deleteMany({ user: req.params.id });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User and all associated data permanently removed.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @desc    Public: Get random profiles for landing page social proof
exports.getPublicProfiles = async (req, res) => {
    try {
        const users = await User.aggregate([
            { $match: { role: { $in: ['student', 'faculty'] } } },
            { $sample: { size: 5 } },
            { $project: { name: 1, profilePicture: 1 } }
        ]);
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};