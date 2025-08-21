const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// @desc    Super-admin creates a new sub-admin
// @route   POST /api/admin/admins/create
exports.createSubAdmin = async (req, res) => {
    const { name, email, password, managedScope, managedPolls } = req.body;
    try {
        if (!email.toLowerCase().endsWith('.edu')) {
            return res.status(400).json({ msg: 'Email must be a valid .edu address.' });
        }
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User with this email already exists.' });

        user = new User({
            name,
            email,
            password,
            role: 'sub-admin', // Explicitly set role
            managedScope,
            managedPolls
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(201).json({ msg: 'Sub-Admin created successfully.' });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Super-admin updates a sub-admin's permissions
// @route   PUT /api/admin/admins/:id/permissions
exports.updateSubAdminPermissions = async (req, res) => {
    const { managedScope, managedPolls } = req.body;
    try {
        const adminToUpdate = await User.findById(req.params.id);
        if (!adminToUpdate || !['sub-admin', 'super-admin'].includes(adminToUpdate.role)) {
            return res.status(404).json({ msg: 'Administrator not found.' });
        }
        
        adminToUpdate.managedScope = managedScope;
        adminToUpdate.managedPolls = managedPolls;
        await adminToUpdate.save();

        res.json({ msg: 'Admin permissions updated.' });
    } catch(err) {
        res.status(500).send('Server Error');
    }
};