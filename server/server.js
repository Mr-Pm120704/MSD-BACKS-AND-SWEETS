const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const legacyRoot = path.join(__dirname, '../');
const clientDist = path.join(__dirname, '../client/dist');
const legacyAssets = new Set([
  'index.html',
  'style.css',
  'data.js',
  'app.js',
  'tracking.js',
  'admin.js'
]);

// Middleware
app.use(cors());
app.use(express.json());

// Preserve the original static website unchanged under /legacy/.
app.get('/legacy', (req, res) => res.redirect('/legacy/'));
app.get('/legacy/', (req, res) => res.sendFile(path.join(legacyRoot, 'index.html')));
app.get('/legacy/:asset', (req, res, next) => {
  if (!legacyAssets.has(req.params.asset)) return next();
  res.sendFile(path.join(legacyRoot, req.params.asset));
});

// Routes
const { router: authRoutes } = require('./routes/auth');
const orderRoutes = require('./routes/orders');
// We will mock workers and queries in the DB for now, but keeping routes simple

app.use('/api/admin', authRoutes);
app.use('/api/orders', orderRoutes);

// Serve the React client build in production.
app.use(express.static(clientDist));

// Fallback to React index.html for SPA routing.
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) {
      res.status(200).sendFile(path.join(legacyRoot, 'index.html'));
    }
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/msdbacks')
.then(() => {
  console.log('MongoDB Connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
