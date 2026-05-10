const taskService = require("../services/task.service");
const asyncHandler = require("../middlewares/async-handler.middleware");
const HTTP_STATUSES = require("../constants/httpStatuses");

exports.create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);

  res.status(HTTP_STATUSES.CREATED).json({
    success: true,
    data: task,
  });
});

exports.getAll = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks();

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: tasks,
  });
});

exports.getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.task_id);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: task,
  });
});

exports.update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.params.task_id,
    req.body
  );

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: task,
  });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.task_id);

  res.status(HTTP_STATUSES.OK).json({
    success: true,
    data: result,
  });
});