// server/routes/profileRoutes.js (NEW FILE)
const express = require('express');
const router = express.Router();
const {
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/me')
  .put(updateMyProfile)
  .delete(deleteMyAccount);

router.put('/change-password', changeMyPassword);

module.exports = router;