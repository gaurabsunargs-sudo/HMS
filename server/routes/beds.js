const express = require('express');
const { getAllBeds, getBedById, createBed, updateBed, deleteBed, getAllBedsSelect } = require('../controllers/bedController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes require authentication

router.get('/', getAllBeds);
router.get('/select', getAllBedsSelect);
router.get('/:id', getBedById);
router.post('/', authorize('ADMIN', 'DOCTOR'), createBed);
router.put('/:id', authorize('ADMIN', 'DOCTOR'), updateBed);
router.delete('/:id', authorize('ADMIN'), deleteBed);

module.exports = router;
