const taskService = require("../services/task.service");
const asyncHandler = require("../middlewares/async-handler.middleware");

exports.create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: task });
});

exports.getAll = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasks();
  res.status(200).json({ success: true, data: tasks });
});

exports.getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json({ success: true, data: task });
});

exports.update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.status(200).json({ success: true, data: task });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id);
  res.status(200).json({ success: true, data: result });
});
