const { toIsoString } = require('./date.util');

const DEFAULT_RANGE = 7;
const MAX_RANGE = 90;

const toInteger = (value) => Number.parseInt(value, 10) || 0;

const parseAnalyticsRange = (range) => {
  const parsed = Number.parseInt(range, 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_RANGE;
  }

  return Math.min(Math.max(parsed, 1), MAX_RANGE);
};

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

const calculateImprovement = (currentWeek, lastWeek) => {
  if (lastWeek > 0) {
    return Math.round(((currentWeek - lastWeek) / lastWeek) * 100);
  }

  return currentWeek > 0 ? 100 : 0;
};

const normalizeTrendData = (trendData) =>
  parseJsonArray(trendData).map((day) => ({
    date: toIsoString(day.date),
    total: toInteger(day.total),
    completed: toInteger(day.completed),
    pending: toInteger(day.pending),
    completionRate: toInteger(day.completionRate),
  }));

const buildAnalyticsResponse = (row = {}) => {
  const completedCount = toInteger(row.completed_count);
  const pendingCount = toInteger(row.pending_count);
  const highPriorityCount = toInteger(row.high_priority_count);
  const mediumPriorityCount = toInteger(row.medium_priority_count);
  const lowPriorityCount = toInteger(row.low_priority_count);
  const currentWeek = toInteger(row.current_week);
  const lastWeek = toInteger(row.last_week);

  return {
    stats: {
      totalCount: toInteger(row.total_count),
      completedCount,
      pendingCount,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      completionRate: toInteger(row.completion_rate),
    },
    streak: toInteger(row.streak),
    trendData: normalizeTrendData(row.trend_data),
    chartData: {
      pieData: [
        {
          name: 'Completed',
          value: completedCount,
        },
        {
          name: 'Pending',
          value: pendingCount,
        },
      ],
      priorityData: [
        {
          name: 'High',
          value: highPriorityCount,
        },
        {
          name: 'Medium',
          value: mediumPriorityCount,
        },
        {
          name: 'Low',
          value: lowPriorityCount,
        },
      ],
    },
    weeklyComparison: {
      currentWeek,
      lastWeek,
      improvement: calculateImprovement(currentWeek, lastWeek),
    },
  };
};

module.exports = {
  buildAnalyticsResponse,
  parseAnalyticsRange,
};
  