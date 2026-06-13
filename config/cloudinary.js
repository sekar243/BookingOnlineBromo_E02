const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage untuk gambar paket wisata (admin)
const packageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bromo-booking/packages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Storage untuk bukti pembayaran (customer)
const paymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bromo-booking/payments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype) {
    return cb(null, true);
  }
  cb(new Error('Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan!'));
};

const uploadPackage = multer({
  storage: packageStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadPayment = multer({
  storage: paymentStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { cloudinary, uploadPackage, uploadPayment };
