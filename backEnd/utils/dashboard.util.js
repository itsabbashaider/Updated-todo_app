const { toIsoString } = require('./date.util');

const toInteger = (value) => Number.parseInt(value, 10) || 0;

const parseJsonArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const serializeRecentTask = (task) => ({
  task_id: task.task_id,
  id: task.task_id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  category: task.category,
  tags: task.tags || [],
  completed: Boolean(task.completed),
  createdAt: toIsoString(task.created_at),
  updatedAt: toIsoString(task.updated_at),
  dueDate: toIsoString(task.due_date),
  completedAt: toIsoString(task.completed_at),
});

const buildDashboardResponse = (row = {}) => {
  const completedCount = toInteger(row.completed_count);
  const pendingCount = toInteger(row.pending_count);

  return {
    stats: {
      totalCount: toInteger(row.total_count),
      completedCount,
      pendingCount,
      highPriorityCount: toInteger(row.high_priority_count),
      mediumPriorityCount: toInteger(row.medium_priority_count),
      lowPriorityCount: toInteger(row.low_priority_count),
      completionRate: toInteger(row.completion_rate),
    },
    peakHour:
      row.peak_hour === null || row.peak_hour === undefined
        ? null
        : toInteger(row.peak_hour),
    recentTasks: parseJsonArray(row.recent_tasks).map(serializeRecentTask),
  };
};

module.exports = {
  buildDashboardResponse,
};
