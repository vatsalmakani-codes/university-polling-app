const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getPublicProfiles } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/public-profiles', getPublicProfiles); // Public route
router.get('/', protect, authorize('super-admin', 'sub-admin'), getAllUsers);
router.delete('/:id', protect, authorize('super-admin', 'sub-admin'), deleteUser);

module.exports = router;