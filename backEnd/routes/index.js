// ─── Dependencies ─────────────────────────────────────────────────────────────
const express    = require('express');
const router     = express.Router();
const taskRoutes = require('./task.route');

// ─── Routes ───────────────────────────────────────────────────────────────────
router.use('/tasks', taskRoutes);

module.exports = router;