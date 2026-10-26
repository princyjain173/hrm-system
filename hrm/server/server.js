require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', require('./routes'));
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') err.status = 400;
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong on the server' });
});
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrm')
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('HRM API running')))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
