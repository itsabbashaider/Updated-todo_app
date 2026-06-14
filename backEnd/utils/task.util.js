const { toIsoString } = require('./date.util');

const TASK_ATTRIBUTES = [
  'task_id',
  'title',
  'description',
  'priority',
  'completed',
  'created_at',
  'updated_at',
  'due_date',
  'completed_at',
  'category',
  'tags',
];

const serializeTask = (task) => {
  const plainTask =
    typeof task?.get === 'function' ? task.get({ plain: true }) : task;

  return {
    task_id: plainTask.task_id,
    title: plainTask.title,
    description: plainTask.description,
    priority: plainTask.priority,
    completed: Boolean(plainTask.completed),
    createdAt: toIsoString(plainTask.created_at),
    updatedAt: toIsoString(plainTask.updated_at),
    dueDate: toIsoString(plainTask.due_date),
    completedAt: toIsoString(plainTask.completed_at),
    category: plainTask.category,
    tags: plainTask.tags || [],
  };
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

module.exports = {
  TASK_ATTRIBUTES,
  parsePositiveInteger,
  serializeTask,
};
