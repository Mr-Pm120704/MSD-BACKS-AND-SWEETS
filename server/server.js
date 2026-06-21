const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const legacyRoot = path.join(__dirname, '../');
const clientDist = path.join(__dirname, '../client/dist');
const legacyAssets = new Set(['index.html', 'style.css', 'data.js', 'app.js', 'tracking.js', 'admin.js']);

app.use(cors());
app.use(express.json());

// Legacy site
app.get('/legacy', (req, res) => res.redirect('/legacy/'));
app.get('/legacy/', (req, res) => res.sendFile(path.join(legacyRoot, 'index.html')));
app.get('/legacy/:asset', (req, res, next) => {
  if (!legacyAssets.has(req.params.asset)) return next();
  res.sendFile(path.join(legacyRoot, req.params.asset));
});

// Routes
const { router: authRoutes } = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const workerRoutes = require('./routes/workers');
const queryRoutes = require('./routes/queries');

app.use('/api/admin', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/queries', queryRoutes);

// Socket.IO for real-time delivery tracking
const deliveryLocations = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe-tracking', (orderId) => {
    socket.join(`order-${orderId}`);
  });

  socket.on('delivery-location-update', (data) => {
    const { deliveryPersonId, lat, lng, orderId } = data;
    deliveryLocations[deliveryPersonId] = { lat, lng, updatedAt: Date.now() };
    if (orderId) {
      io.to(`order-${orderId}`).emit('location-update', {
        deliveryPersonId, lat, lng, timestamp: Date.now()
      });
    }
    io.emit('delivery-location', { deliveryPersonId, lat, lng });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve React build
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) res.status(200).sendFile(path.join(legacyRoot, 'index.html'));
  });
});

const PORT = process.env.PORT || 3080;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/msdbacks')
.then(() => {
  console.log('MongoDB Connected');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

module.exports = { app, io };
