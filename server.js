const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Muat variabel lingkungan
dotenv.config();

const db = require('./config/db');

// Rute
const authRoutes = require('./routes/authRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const PackageController = require('./controllers/PackageController');

const app = express();
const PORT = process.env.PORT || 3000;

// Pastikan folder upload ada di public/uploads
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Inisialisasi Database MySQL XAMPP
db.initDB();

// Pengaturan Template Engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sajikan folder public secara statis
app.use(express.static(path.join(__dirname, 'public')));
// Dukungan routing upload langsung jika tidak termuat dari public
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Konfigurasi Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key_bromo_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // Sesi bertahan 1 Hari
  }
}));

// Global Middleware untuk melemparkan sesi user ke EJS template secara otomatis
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routing Utama
app.get('/', PackageController.renderCatalog);
app.use('/auth', authRoutes);
app.use('/packages', packageRoutes);
app.use('/booking', bookingRoutes);
app.use('/admin', adminRoutes);

// Penanganan 404 Not Found
app.use((req, res, next) => {
  res.status(404).render('login', { 
    error: 'Halaman yang Anda cari tidak ditemukan.', 
    success: null, 
    user: req.session.user || null 
  });
});

// Penanganan Error Global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi kesalahan internal pada server.');
});

// Jalankan Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server Booking Bromo berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
