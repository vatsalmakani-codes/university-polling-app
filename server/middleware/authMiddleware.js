const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.user.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `User role '${req.user.role}' is not authorized for this action.` });
    }
    next();
  };
};

// This is NOT a controller, it's a middleware that runs before the controller
exports.canManagePoll = async (req, res, next) => {
  const pollId = req.params.id;
  const user = req.user;

  // Super admins can do anything
  if (user.role === 'super-admin') {
    return next();
  }

  // Sub-admins with 'POLLS' scope must have the poll ID in their managed list
  if (user.role === 'sub-admin' && user.managedScope === 'POLLS') {
    if (user.managedPolls.includes(pollId)) {
      return next(); // They have permission
    } else {
      return res.status(403).json({ msg: 'You are not authorized to manage this specific poll.' });
    }
  }

  // Fallback for other sub-admin types or if logic gets more complex
  // (e.g., a sub-admin with 'STUDENT' scope might be able to create polls for students)
  // For now, we deny by default if the specific conditions aren't met.

  // Find the poll to check who created it
  const poll = await Poll.findById(pollId);
  if (!poll) {
    return res.status(404).json({ msg: 'Poll not found.' });
  }

  // The original creator (a sub-admin) can manage their own poll
  if (poll.createdBy.toString() === user.id.toString()) {
    return next();
  }

  return res.status(403).json({ msg: 'Not authorized for this action.' });
};