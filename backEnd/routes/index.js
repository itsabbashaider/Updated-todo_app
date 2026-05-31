// ─── Dependencies ─────────────────────────────────────────────────────────────
const express    = require('express');
const router     = express.Router();
const taskRoutes = require('./task.route');
const analyticsRoutes = require('./analytics.route');
const dashboardRoutes = require('./dashboard.route')

// ─── Routes ───────────────────────────────────────────────────────────────────
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;