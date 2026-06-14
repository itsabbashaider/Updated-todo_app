// ─── Dependencies ─────────────────────────────────────────────────────────────
const express    = require('express');
const router     = express.Router();
const taskRoutes = require('./task.route');
const analyticsRoutes = require('./analytics.route');
const dashboardRoutes = require('./dashboard.route')
const userRoutes = require('./user.route');


// ─── Routes ───────────────────────────────────────────────────────────────────
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

module.exports = router;