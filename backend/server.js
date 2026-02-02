const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const { initDb } = require('./models/database');
const playersRoutes = require('./routes/players');
const votesRoutes = require('./routes/votes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', playersRoutes);
app.use('/api', votesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Init DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Foot Vibes API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
