require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose'), path = require('path');
const { User } = require('./models');
const { seedData } = require('./seed');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '200kb' }));

let isDbConnected = false;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    mongoConfigured: !!process.env.MONGO_URI
  });
});

// Middleware to check database connection on API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!isDbConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is connecting or MONGO_URI is missing in Render environment variables. Please check your Render configuration.'
    });
  }
  next();
});

app.use('/api', require('./routes'));

// Static serving for built React client
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Client SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') err.status = 400;
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

// Listen on all network interfaces ('0.0.0.0') for Render compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`StaffSync HRM server running on port ${PORT}`);
});

// Connect to MongoDB asynchronously without crashing the web process
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm';

if (!process.env.MONGO_URI) {
  console.warn('⚠️ WARNING: MONGO_URI is not set in environment variables! Using local fallback.');
}

console.log('Connecting to MongoDB...');
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    isDbConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Database is empty. Automatically initializing demo data...');
        await seedData(false);
      }
    } catch (seedErr) {
      console.warn('Initial seed check warning:', seedErr.message);
    }
  })
  .catch(e => {
    isDbConnected = false;
    console.error('❌ MongoDB connection failed:', e.message);
    console.error('👉 If deploying on Render: verify MONGO_URI in Render > Environment and ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas.');
  });
