const dashboardService =
  require('../services/dashboard.service');

const asyncHandler =
  require('../middlewares/async-handler.middleware');

const HTTP_STATUSES =
  require('../constants/http-status.constant');

exports.getDashboard =
  asyncHandler(async (req, res) => {
    const data =
      await dashboardService.getDashboardData(req);

    res
      .status(HTTP_STATUSES.OK)
      .json({
        success: true,
        data,
      });
  });