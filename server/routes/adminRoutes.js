const express = require('express');
const router = express.Router();
const {
  createPoll,
  updatePollStatus,
  publishPollResults,
  resetUserPassword
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes in this file are protected and for admins only
router.use(protect, authorize('admin'));

router.post('/polls', createPoll);
router.put('/polls/:id/status', updatePollStatus);
router.put('/polls/:id/publish', publishPollResults);
router.post('/users/:id/reset-password', resetUserPassword);

module.exports = router;