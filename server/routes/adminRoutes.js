const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import Controllers
const adminController = require('../controllers/adminController');
const superAdminController = require('../controllers/superAdminController');
const feedbackController = require('../controllers/feedbackController'); // Correctly import the whole module

// === General Admin & Sub-Admin Routes ===
router.use(protect, authorize('super-admin', 'sub-admin'));

// Poll Management
router.post('/polls', adminController.createPoll);
router.put('/polls/:id/settings', adminController.updatePollSettings);
router.put('/polls/:id/publish', adminController.publishPollResults);
// You would add a poll deletion route here if needed, e.g., router.delete('/polls/:id', adminController.deletePoll)

// User Management
router.post('/users/create', adminController.createNewUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// Feedback Management
router.get('/feedback', feedbackController.getAllFeedback);
router.put('/feedback/:id/feature', feedbackController.toggleFeaturedFeedback);
router.delete('/feedback/:id', feedbackController.deleteFeedback); // This line now works

// === Super-Admin ONLY Routes ===
// These routes require an additional authorization check
router.post('/admins/create', authorize('super-admin'), superAdminController.createSubAdmin);
router.put('/admins/:id/permissions', authorize('super-admin'), superAdminController.updateSubAdminPermissions);

module.exports = router;