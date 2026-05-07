const { Task } = require("../models");

/* ======================
    CREATE TASK
====================== */
exports.createTask = async (data) => {
  return await Task.create(data);
};

/* ======================
    GET ALL TASKS
====================== */
exports.getTasks = async () => {
  return await Task.findAll({
    order: [["createdAt", "DESC"]],
  });
};

/* ======================
    GET TASK BY ID
====================== */
exports.getTaskById = async (id) => {
  const task = await Task.findByPk(id);

  if (!task) throw new Error("Task not found");

  return task;
};

/* ======================
    UPDATE TASK
====================== */
exports.updateTask = async (id, data) => {
  const task = await Task.findByPk(id);

  if (!task) throw new Error("Task not found");

  return await task.update(data);
};

/* ======================
    DELETE TASK
====================== */
exports.deleteTask = async (id) => {
  const task = await Task.findByPk(id);

  if (!task) throw new Error("Task not found");

  await task.destroy();

  return { message: "Task deleted" };
};
