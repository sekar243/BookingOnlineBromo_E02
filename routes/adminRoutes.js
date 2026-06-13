const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const AuthController = require('../controllers/AuthController');
const { uploadPackage } = require('../config/cloudinary');

// Semua route admin memerlukan otentikasi admin
router.use(AuthController.isAuthenticated);
router.use(AuthController.isAdmin);

router.get('/', AdminController.renderDashboard);
router.post('/booking/approve/:id', AdminController.approveBooking);
router.post('/booking/reject/:id', AdminController.rejectBooking);

// CRUD Paket Wisata
router.get('/packages', AdminController.renderPackages);
router.post('/packages/create', uploadPackage.single('image'), AdminController.createPackage);
router.post('/packages/update/:id', uploadPackage.single('image'), AdminController.updatePackage);
router.post('/packages/delete/:id', AdminController.deletePackage);

module.exports = router;
