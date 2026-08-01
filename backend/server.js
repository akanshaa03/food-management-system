const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const { inputSanitizer } = require('./middlewares/inputValidator');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const donationRoutes = require('./routes/donationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const expiryRoutes = require('./routes/expiryRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Global Security & Input Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(inputSanitizer);

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    system: 'AI-Based Food Redistribution System Backend',
    timestamp: new Date().toISOString(),
  });
});

// API V1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/expiry', expiryRoutes);
app.use('/api/v1/pickups', pickupRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/categories', categoryRoutes);

// Unhandled Route Handler (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Server Bootstrapping
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running in [${config.nodeEnv}] mode on port ${PORT}`);
});

module.exports = app;
