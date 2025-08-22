const express = require('express');
const router = express.Router();

const {
  getAllPolls,
  getPollById,
  voteOnPoll,
  getMyVoteHistory,
  getMyCreatedPolls 
} = require('../controllers/pollController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllPolls);
router.get('/history/my-votes', protect, authorize('student', 'faculty'), getMyVoteHistory);
router.get('/history/my-polls', protect, authorize('faculty', 'super-admin', 'sub-admin'), getMyCreatedPolls);
router.get('/:id', protect, getPollById);
router.post('/:id/vote', protect, authorize('student', 'faculty'), voteOnPoll);

module.exports = router;