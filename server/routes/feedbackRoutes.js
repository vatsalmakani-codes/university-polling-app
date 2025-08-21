const express = require('express');
const router = express.Router();
const { submitFeedback, getFeaturedFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/featured', getFeaturedFeedback);
router.post('/polls/:id', protect, authorize('student', 'faculty'), submitFeedback);

module.exports = router;