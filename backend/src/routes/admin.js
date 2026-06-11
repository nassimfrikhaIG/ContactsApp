const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getUsers, getUser, updateUser, deleteUser, toggleUserStatus,
  getGlobalStats, getAllContacts, createUser
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getGlobalStats);
router.get('/contacts', getAllContacts);

router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.patch('/users/:id/toggle', toggleUserStatus);

module.exports = router;
