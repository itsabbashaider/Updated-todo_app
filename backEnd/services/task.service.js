const { Op } = require('sequelize');
const { Task } = require('../models');
const { NotFoundError } = require('../utils/errors-classes.util');
const { getRequestUserId } = require('../utils/request.util');
const {
  TASK_ATTRIBUTES,
  parsePositiveInteger,
  serializeTask,
} = require('../utils/task.util');

const MAX_PAGE_SIZE = 100;

const findUserTask = async (taskId, userId, options = {}) => {
  const task = await Task.findOne({
    where: {
      task_id: taskId,
      user_id: userId,
    },
    ...options,
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return task;
};

exports.createTask = async (data, req) => {
  const userId = getRequestUserId(req);
  const payload = {
    ...data,
    user_id: userId,
  };

  if (payload.completed === true && !payload.completed_at) {
    payload.completed_at = new Date();
  }

  const task = await Task.create(payload);

  return serializeTask(task);
};

exports.getTasks = async (
  req,
  {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'created_at',
    order = 'DESC',
    startDate,
    endDate,
  } = {}
) => {
  const userId = getRequestUserId(req);
  const where = { user_id: userId };

  if (status === 'completed') {
    where.completed = true;
  }

  if (status === 'pending') {
    where.completed = false;
  }

  if (search) {
    where.title = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;

  if (
    parsedStartDate &&
    parsedEndDate &&
    !Number.isNaN(parsedStartDate.getTime()) &&
    !Number.isNaN(parsedEndDate.getTime())
  ) {
    where.created_at = {
      [Op.between]: [parsedStartDate, parsedEndDate],
    };
  }

  const pageNumber = parsePositiveInteger(page, 1);
  const limitNumber = Math.min(parsePositiveInteger(limit, 10), MAX_PAGE_SIZE);
  const offset = (pageNumber - 1) * limitNumber;

  const allowedSortFields = [
    'created_at',
    'updated_at',
    'title',
    'priority',
    'completed',
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'created_at';

  const safeOrder =
    String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { rows, count } = await Task.findAndCountAll({
    where,
    limit: limitNumber,
    offset,
    attributes: TASK_ATTRIBUTES,
    order: [[safeSortBy, safeOrder], ['created_at', 'DESC']],
    raw: true,
  });

  return {
    data: rows.map(serializeTask),
    pagination: {
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
    },
  };
};

exports.getTaskById = async (taskId, req) => {
  const userId = getRequestUserId(req);
  const task = await findUserTask(taskId, userId, {
    attributes: TASK_ATTRIBUTES,
    raw: true,
  });

  return serializeTask(task);
};

exports.updateTask = async (taskId, data, req) => {
  const userId = getRequestUserId(req);
  const task = await findUserTask(taskId, userId);
  const payload = { ...data };

  if (payload.completed === true) {
    payload.completed_at = task.completed_at || new Date();
  }

  if (payload.completed === false) {
    payload.completed_at = null;
  }

  await task.update(payload);

  return serializeTask(task);
};

exports.deleteTask = async (taskId, req) => {
  const userId = getRequestUserId(req);
  const task = await findUserTask(taskId, userId);

  await task.destroy();

  return {
    success: true,
    message: 'Task deleted',
  };
};
