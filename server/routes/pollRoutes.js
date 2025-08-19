const express = require('express');
const router = express.Router();

// Import the controller functions that these routes will use
const {
  getAllPolls,
  getPollById,
  voteOnPoll,
  getMyVoteHistory,
  getMyCreatedPolls 
} = require('../controllers/pollController');

// Import middleware for route protection and role-based authorization
const { protect, authorize } = require('../middleware/authMiddleware');


// @route   GET /api/polls
// @desc    Get all polls visible to the logged-in user (for the dashboard)
// @access  Private (accessible to Student, Faculty, Admin)
router.get('/', protect, getAllPolls);

// @route   GET /api/polls/history/my-votes
// @desc    Get the voting history for a student
// @access  Private (restricted to Student role)
router.get('/history/my-votes', protect, authorize('student'), getMyVoteHistory);

// @route   GET /api/polls/history/my-polls
// @desc    Get all polls created by a faculty member or admin
// @access  Private (restricted to Faculty and Admin roles)
router.get('/history/my-polls', protect, authorize('faculty', 'admin'), getMyCreatedPolls);

// @route   GET /api/polls/:id
// @desc    Get the details of a single poll
// @access  Private (accessible to Student, Faculty, Admin)
router.get('/:id', protect, getPollById);

// @route   POST /api/polls/:id/vote
// @desc    Allow a user to cast their vote on a poll
// @access  Private (restricted to Student and Faculty roles)
router.post('/:id/vote', protect, authorize('student', 'faculty'), voteOnPoll);


module.exports = router;