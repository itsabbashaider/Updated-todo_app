// ─── Dependencies ─────────────────────────────────────────────────────────────
const taskService =
  require('../services/task.service');

const asyncHandler =
  require('../middlewares/async-handler.middleware');

const HTTP_STATUSES =
  require('../constants/http-status.constant');

// ─── Create ───────────────────────────────────────────────────────────────────
exports.create = asyncHandler(
  async (req, res) => {
    const task =
      await taskService.createTask(
        req.body
      );

    res
      .status(
        HTTP_STATUSES.CREATED
      )
      .json({
        success: true,

        data: task,
      });
  }
);

// ─── Get All ──────────────────────────────────────────────────────────────────
exports.getAll = asyncHandler(
  async (req, res) => {
    const result =
      await taskService.getTasks(
        req.query
      );

    res
      .status(
        HTTP_STATUSES.OK
      )
      .json({
        success: true,

        data: result.tasks,

        pagination:
          result.pagination,
      });
  }
);

// ─── Get One ──────────────────────────────────────────────────────────────────
exports.getOne = asyncHandler(
  async (req, res) => {
    const task =
      await taskService.getTaskById(
        req.params.task_id
      );

    res
      .status(
        HTTP_STATUSES.OK
      )
      .json({
        success: true,

        data: task,
      });
  }
);

// ─── Update ───────────────────────────────────────────────────────────────────
exports.update = asyncHandler(
  async (req, res) => {
    const task =
      await taskService.updateTask(
        req.params.task_id,
        req.body
      );

    res
      .status(
        HTTP_STATUSES.OK
      )
      .json({
        success: true,

        data: task,
      });
  }
);

// ─── Remove ───────────────────────────────────────────────────────────────────
exports.remove = asyncHandler(
  async (req, res) => {
    const result =
      await taskService.deleteTask(
        req.params.task_id
      );

    res
      .status(
        HTTP_STATUSES.OK
      )
      .json({
        success: true,

        data: result,
      });
  }
);