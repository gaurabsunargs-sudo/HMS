const express = require('express');
const { getAllUsers, getUserById, updateUser, updateUserPassword, toggleUserStatus, deleteUser, updateUserValidation } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes require authentication

router.get('/', authorize('ADMIN'), getAllUsers);
router.get('/:id', authorize('ADMIN'), getUserById);
router.put('/:id', authorize('ADMIN'), updateUserValidation, updateUser);
router.patch('/:id/password', authorize('ADMIN'), updateUserPassword);
router.patch('/:id/toggle-status', authorize('ADMIN'), toggleUserStatus);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
