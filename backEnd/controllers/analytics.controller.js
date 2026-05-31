// ─── Dependencies ─────────────────────────────────────────────────────────────
const analyticsService = require('../services/analytics.service');

const HTTP_STATUSES = require('../constants/http-status.constant');

// ─── Get Analytics ────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  const range = Number(req.query.range) || 7;

  const analytics = await analyticsService.getAnalytics(range);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: analytics,
  });
};