// ─── Dependencies ─────────────────────────────────────────────────────────────
const express = require('express');

const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');

// ─── Middlewares ──────────────────────────────────────────────────────────────
const asyncHandler = require('../middlewares/async-handler.middleware');

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(analyticsController.getAnalytics)
);

module.exports = router;