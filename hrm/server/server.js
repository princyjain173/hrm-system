require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose'), path = require('path');
const { User } = require('./models');
const { seedData } = require('./seed');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '200kb' }));
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
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm')
  .then(async () => {
    try {
      // Auto-seed if database is empty (ideal for fresh cloud deployments like Render)
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Database is empty. Automatically initializing demo data...');
        await seedData(false);
      }
    } catch (seedErr) {
      console.warn('Initial seed check warning:', seedErr.message);
    }
    app.listen(PORT, () => console.log(`StaffSync HRM server running on port ${PORT}`));
  })
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
