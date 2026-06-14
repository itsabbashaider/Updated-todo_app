// ─── Dependencies ─────────────────────────────────────────────────────────────
const express = require('express');

const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');

// ─── Middlewares ──────────────────────────────────────────────────────────────
const asyncHandler = require('../middlewares/async-handler.middleware');
const authenticate = require('../middlewares/auth.middleware');

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  asyncHandler(analyticsController.getAnalytics)
);

module.exports = router;