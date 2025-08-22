const Feedback = require('../models/feedbackModel');

// @desc    User submits feedback for a poll
exports.submitFeedback = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const existingFeedback = await Feedback.findOne({ user: req.user.id, poll: req.params.id });
    if (existingFeedback) {
      return res.status(400).json({ msg: 'You have already submitted feedback for this poll.' });
    }
    const newFeedback = new Feedback({
      poll: req.params.id,
      user: req.user.id,
      rating,
      comment,
    });
    await newFeedback.save();
    res.status(201).json({ msg: 'Feedback submitted successfully. Thank you!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Public: Get featured feedback for the landing page
exports.getFeaturedFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'name profilePicture');
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Admin: Get all feedback items
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('user', 'name').populate('poll', 'question').sort({ createdAt: -1 });
        res.json(feedback);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin: Toggle the featured status of a feedback item
exports.toggleFeaturedFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ msg: 'Feedback not found.' });
        feedback.isFeatured = !feedback.isFeatured;
        await feedback.save();
        res.json(feedback);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin: Delete a feedback item
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ msg: 'Feedback not found.' });
        }
        await feedback.deleteOne();
        res.json({ msg: 'Feedback item removed.' });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};