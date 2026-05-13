// ─── Dependencies ─────────────────────────────────────────────────────────────
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors    = require('cors');

// ─── Routes & Middlewares ─────────────────────────────────────────────────────
const router       = require('./routes/index');
const errorHandler = require('./middlewares/error.middleware');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', router);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});