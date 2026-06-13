const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
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

// Konfigurasi Database-backed Session Store
const sessionStore = new MySQLStore({}, db.getPool());

// Konfigurasi Session
app.use(session({
  key: 'booking_bromo_sid',
  secret: process.env.SESSION_SECRET || 'secret_key_bromo_123',
  store: sessionStore,
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
  
  let extraDiag = "";
  if (err.message && (err.message.includes("Signature") || err.message.includes("api_key") || err.message.includes("cloud_name") || err.message.includes("secret"))) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    extraDiag = `\n\n--- Cloudinary Diagnosis ---\n` +
      `CLOUDINARY_CLOUD_NAME: ${cloudName ? `Loaded (Length: ${cloudName.length}, First 3: ${cloudName.substring(0, 3)}, Last 3: ${cloudName.substring(cloudName.length - 3)})` : "NOT LOADED"}\n` +
      `CLOUDINARY_API_KEY: ${apiKey ? `Loaded (Length: ${apiKey.length}, First 3: ${apiKey.substring(0, 3)}, Last 3: ${apiKey.substring(apiKey.length - 3)})` : "NOT LOADED"}\n` +
      `CLOUDINARY_API_SECRET: ${apiSecret ? `Loaded (Length: ${apiSecret.length}, First 3: ${apiSecret.substring(0, 3)}, Last 3: ${apiSecret.substring(apiSecret.length - 3)})` : "NOT LOADED"}\n` +
      `----------------------------\n` +
      `Tips:\n` +
      `1. Pastikan Anda sudah menambahkan variabel di Vercel Dashboard -> Settings -> Environment Variables.\n` +
      `2. Kredensial tidak akan terbaca sampai Anda melakukan REDEPLOY di Vercel setelah menyimpannya.\n` +
      `3. Periksa apakah ada spasi tambahan atau tanda petik di nilai variabel tersebut.`;
  }
  
  res.status(500).send(`Terjadi kesalahan internal pada server: ${err.message}${extraDiag ? `<br><pre>${extraDiag}</pre>` : ""}<br><pre>${err.stack}</pre>`);
});

// Jalankan Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server Booking Bromo berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
