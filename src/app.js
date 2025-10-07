require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const waitlistRoutes = require('./routes/waitlistRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// If behind a proxy like Nginx, trust the first proxy so rate limiting uses the real IP
app.set('trust proxy', 1);

// Core middleware
app.use(cors()); // Allow all origins by default (adjust if needed)
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/waitlist', waitlistRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Tickets2Go API listening on port ${PORT}`);
});
