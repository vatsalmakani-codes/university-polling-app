const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount,
  updateProfilePicture
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected and apply to the logged-in user
router.use(protect);

router.route('/me')
  .put(updateMyProfile)
  .delete(deleteMyAccount);

router.put('/change-password', changeMyPassword);

// The 'profilePicture' string must match the FormData key on the frontend
router.put('/picture', upload.single('profilePicture'), updateProfilePicture);

module.exports = router;