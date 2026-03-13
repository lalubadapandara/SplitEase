const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const dotenv    = require('dotenv');

dotenv.config();

const app = express();

// ─────────────────────────────────────────────────────────────────
//  CORS — which frontends are allowed to call this backend
//  Local dev  → http://localhost:3000
//  Production → FRONTEND_URL env variable (your Vercel URL)
// ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://split-ease-pink.vercel.app/',
  process.env.FRONTEND_URL,        // e.g. https://splitease.vercel.app
].filter(Boolean);                 // removes undefined if FRONTEND_URL not set

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.get("/", (req, res) => {
  res.send("SplitEase Backend API is running 🚀");
});

// ─────────────────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/groups',      require('./routes/groups'));
app.use('/api/expenses',    require('./routes/expenses'));
app.use('/api/settlements', require('./routes/settlements'));

// Health check — visit this URL to confirm backend is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SplitEase API is running' });
});

// ─────────────────────────────────────────────────────────────────
//  DATABASE + SERVER START
// ─────────────────────────────────────────────────────────────────
const PORT      = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set. Add it to your .env file or Render environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
