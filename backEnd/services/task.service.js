// ─── Dependencies ─────────────────────────────────────────────────────────────
const { Task } = require('../models');

const { Op } = require('sequelize');

const {
  NotFoundError,
} = require('../utils/errors-classes.util');

// ─── Create Task ──────────────────────────────────────────────────────────────
exports.createTask = async (
  data
) => {
  return await Task.create(
    data
  );
};

// ─── Get Tasks ────────────────────────────────────────────────────────────────
exports.getTasks = async ({
  page = 1,
  limit = 10,

  status,
  search,

  sortBy = 'created_at',
  order = 'DESC',

  startDate,
  endDate,
} = {}) => {
  const where = {};

  // ─── Status Filter ─────────────────────────────────────────────────────────
  if (status === 'completed') {
    where.completed = true;
  }

  if (status === 'pending') {
    where.completed = false;
  }

  // ─── Search Filter ─────────────────────────────────────────────────────────
  if (search) {
    where.title = {
      [Op.iLike]: `%${search}%`,
    };
  }

  // ─── Date Range Filter ─────────────────────────────────────────────────────
  if (
    startDate &&
    endDate &&
    !Number.isNaN(
      new Date(startDate).getTime()
    ) &&
    !Number.isNaN(
      new Date(endDate).getTime()
    )
  ) {
    where.created_at = {
      [Op.between]: [
        new Date(startDate),
        new Date(endDate),
      ],
    };
  }

  // ─── Safe Pagination ───────────────────────────────────────────────────────
  const pageNumber = Math.max(
    1,
    Number(page) || 1
  );

  const limitNumber =
    Math.max(
      1,
      Number(limit) || 10
    );

  const offset =
    (pageNumber - 1) *
    limitNumber;

  // ─── Safe Sorting ──────────────────────────────────────────────────────────
  const allowedSortFields = [
    'created_at',
    'updated_at',
    'title',
    'priority',
    'completed',
  ];

  const safeSortBy =
    allowedSortFields.includes(
      sortBy
    )
      ? sortBy
      : 'created_at';

  const safeOrder =
    String(order).toUpperCase() ===
    'ASC'
      ? 'ASC'
      : 'DESC';

  // ─── Query ─────────────────────────────────────────────────────────────────
  const { rows, count } =
    await Task.findAndCountAll({
      where,

      limit: limitNumber,

      offset,

      order: [
        [
          safeSortBy,
          safeOrder,
        ],

        [
          'created_at',
          'DESC',
        ],
      ],
    });

  // ─── Return ────────────────────────────────────────────────────────────────
  return {
    tasks: rows,

    pagination: {
      total: count,

      page: pageNumber,

      limit: limitNumber,

      totalPages:
        Math.ceil(
          count /
            limitNumber
        ),
    },
  };
};

// ─── Get Task By ID ───────────────────────────────────────────────────────────
exports.getTaskById = async (
  id
) => {
  const task =
    await Task.findByPk(id);

  if (!task) {
    throw new NotFoundError(
      'Task not found'
    );
  }

  return task;
};

// ─── Update Task ──────────────────────────────────────────────────────────────
exports.updateTask = async (
  id,
  data
) => {
  const task =
    await Task.findByPk(id);

  if (!task) {
    throw new NotFoundError(
      'Task not found'
    );
  }

  // ─── Handle Completion ────────────────────────────────────────────────────
  if (
    data.completed === true
  ) {
    data.completed_at =
      new Date();
  }

  if (
    data.completed === false
  ) {
    data.completed_at = null;
  }

  return await task.update(
    data
  );
};

// ─── Delete Task ──────────────────────────────────────────────────────────────
exports.deleteTask = async (
  id
) => {
  const task =
    await Task.findByPk(id);

  if (!task) {
    throw new NotFoundError(
      'Task not found'
    );
  }

  await task.destroy();

  return {
    message:
      'Task deleted',
  };
};