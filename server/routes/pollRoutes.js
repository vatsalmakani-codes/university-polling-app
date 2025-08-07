const express = require('express');
const router = express.Router();
const { createPoll, getAllPolls, getPollById, voteOnPoll, deletePoll, getMyVoteHistory } = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('faculty'), createPoll)
  .get(protect, getAllPolls);

router.route('/:id')
  .get(protect, getPollById)
  .delete(protect, authorize('faculty', 'admin'), deletePoll);

router.post('/:id/vote', protect, authorize('student'), voteOnPoll);
router.get('/history/my-votes', protect, authorize('student'), getMyVoteHistory);

module.exports = router;