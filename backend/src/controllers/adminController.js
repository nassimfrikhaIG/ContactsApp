const User = require('../models/User');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, role, isActive } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(query)
    ]);

    // Enrich with contact count per user
    const userIds = users.map(u => u._id);
    const contactCounts = await Contact.aggregate([
      { $match: { owner: { $in: userIds } } },
      { $group: { _id: '$owner', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    contactCounts.forEach(c => { countMap[c._id.toString()] = c.count; });
    const enriched = users.map(u => ({ ...u, contactCount: countMap[u._id.toString()] || 0 }));

    res.json({
      success: true,
      data: {
        users: enriched,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (error) { next(error); }
};

// @desc    Get single user with their contacts
// @route   GET /api/admin/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [contacts, contactCount, activityLog] = await Promise.all([
      Contact.find({ owner: req.params.id }).sort('-createdAt').limit(10).lean(),
      Contact.countDocuments({ owner: req.params.id }),
      Activity.find({ user: req.params.id }).sort('-createdAt').limit(20).lean()
    ]);

    res.json({ success: true, data: { user: { ...user, contactCount }, contacts, activityLog } });
  } catch (error) { next(error); }
};

// @desc    Update user (role, isActive)
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own account via admin' });
    }
    const { role, isActive, name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { role, isActive, name, email }, { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated', data: { user } });
  } catch (error) { next(error); }
};

// @desc    Delete user and all their contacts
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    await Contact.deleteMany({ owner: req.params.id });
    await Activity.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User and all their data deleted' });
  } catch (error) { next(error); }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate yourself' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { isActive: user.isActive } });
  } catch (error) { next(error); }
};

// @desc    Global platform statistics
// @route   GET /api/admin/stats
const getGlobalStats = async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers, adminUsers,
      totalContacts, totalFavorites,
      newUsersThisMonth, newContactsThisMonth,
      contactsBySource, topUsers, recentActivity,
      userGrowth, contactGrowth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Contact.countDocuments(),
      Contact.countDocuments({ isFavorite: true }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
      Contact.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
      Contact.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Contact.aggregate([
        { $group: { _id: '$owner', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { count: 1, 'user.name': 1, 'user.email': 1 } }
      ]),
      Activity.find().sort('-createdAt').limit(15)
        .populate('user', 'name email').lean(),
      // User growth last 6 months
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Contact growth last 6 months
      Contact.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalUsers, activeUsers, adminUsers, inactiveUsers: totalUsers - activeUsers, totalContacts, totalFavorites, newUsersThisMonth, newContactsThisMonth },
        contactsBySource, topUsers, recentActivity, userGrowth, contactGrowth
      }
    });
  } catch (error) { next(error); }
};

// @desc    Get all contacts (admin view)
// @route   GET /api/admin/contacts
const getAllContacts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, userId } = req.query;
    const query = {};
    if (userId) query.owner = userId;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit))
        .populate('owner', 'name email').lean(),
      Contact.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: { contacts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }
    });
  } catch (error) { next(error); }
};

// @desc    Create admin user
// @route   POST /api/admin/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: role || 'user' });
    res.status(201).json({ success: true, message: 'User created', data: { user } });
  } catch (error) { next(error); }
};

module.exports = { getUsers, getUser, updateUser, deleteUser, toggleUserStatus, getGlobalStats, getAllContacts, createUser };
