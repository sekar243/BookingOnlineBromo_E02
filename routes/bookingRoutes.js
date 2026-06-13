const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const AuthController = require('../controllers/AuthController');
const { uploadPayment } = require('../config/cloudinary');

// Semua route booking memerlukan otentikasi
router.use(AuthController.isAuthenticated);

router.get('/new', BookingController.renderBookingForm);
router.post('/new', BookingController.createBooking);

router.get('/history', BookingController.renderHistory);
router.post('/payment', uploadPayment.single('payment_proof'), BookingController.uploadPaymentProof);

router.post('/cancel/:id', BookingController.cancelBooking);

module.exports = router;
