const { Task } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const {
  buildAnalyticsResponse,
  parseAnalyticsRange,
} = require('../utils/analytics.util');
const { ValidationError, InternalServerError } = require('../errors');

exports.getAnalytics = async (userId, range = 7) => {
  try {
    const safeRange = parseAnalyticsRange(range);
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - safeRange);

    const total_count = await this._getTotalCount(userId);
    const completed_count = await this._getCompletedCount(userId);
    const pending_count = total_count - completed_count;

    const high_priority_count = await this._getPriorityCount(userId, 'high');
    const medium_priority_count = await this._getPriorityCount(userId, 'medium');
    const low_priority_count = await this._getPriorityCount(userId, 'low');

    const completion_rate = this._calculateCompletionRate(
      completed_count,
      total_count
    );

    const streak = await this._calculateStreak(userId, today);

    const trendDataRaw = await this._getTrendDataRaw(userId);
    
    const trendData = this._buildTrendData(
      trendDataRaw,
      today,
      safeRange
    );

    const current_week = await this._getWeeklyCount(userId, {
      start: this._getWeekStart(today),
      end: today
    });

    const last_week = await this._getWeeklyCount(userId, {
      start: this._getWeekStart(today, -7),
      end: this._getWeekStart(today)
    });

    const row = {
      total_count,
      completed_count,
      pending_count,
      high_priority_count,
      medium_priority_count,
      low_priority_count,
      completion_rate,
      streak,
      trend_data: trendData,
      current_week,
      last_week,
    };

    return buildAnalyticsResponse(row);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new InternalServerError('Failed to fetch analytics data');
  }
};

exports._getTotalCount = async (userId) => {
  return await Task.count({
    where: { user_id: userId },
  });
};

exports._getCompletedCount = async (userId) => {
  return await Task.count({
    where: {
      user_id: userId,
      completed: true,
    },
  });
};

exports._getPriorityCount = async (userId, priority) => {
  return await Task.count({
    where: {
      user_id: userId,
      [Op.where]: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('priority')),
        Op.eq,
        priority.toLowerCase()
      ),
    },
  });
};

exports._calculateCompletionRate = (completed, total) => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

exports._calculateStreak = async (userId, today) => {
  const completedTasks = await Task.findAll({
    where: {
      user_id: userId,
      completed: true,
    },
    attributes: ['completed_at'],
    raw: true,
  });

  const completedDays = new Set(
    completedTasks
      .filter(t => t.completed_at)
      .map(t => {
        const date = new Date(t.completed_at);
        date.setUTCHours(0, 0, 0, 0);
        return date.toISOString().split('T')[0];
      })
  );

  let streak = 0;
  let checkDate = new Date(today);
  checkDate.setUTCHours(0, 0, 0, 0);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today);
  yesterdayStr.setDate(yesterdayStr.getDate() - 1);
  const yesterdayStr2 = yesterdayStr.toISOString().split('T')[0];

  if (completedDays.has(todayStr) || completedDays.has(yesterdayStr2)) {
    while (completedDays.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return streak;
};

exports._getTrendDataRaw = async (userId) => {
  return await Task.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('completed_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('task_id')), 'completed'],
    ],
    where: {
      user_id: userId,
      completed: true,
      completed_at: {
        [Op.not]: null,
      },
    },
    group: [sequelize.fn('DATE', sequelize.col('completed_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('completed_at')), 'ASC']],
    raw: true,
  });
};

exports._buildTrendData = (
  trendDataRaw,
  today,
  safeRange
) => {
  const trendData = [];
  const trendMap = new Map(
    trendDataRaw.map(row => [
      String(row.date).split('T')[0],
      parseInt(row.completed) || 0
    ])
  );

  for (let i = safeRange; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const completed = trendMap.get(dateStr) || 0;
    const total = completed;
    const pending = 0;
    const completionRate = completed > 0 ? 100 : 0;

    trendData.push({
      date: new Date(date).toISOString(),
      total,
      completed,
      pending,
      completionRate,
    });
  }

  return trendData;
};

exports._getWeekStart = (date, daysOffset = 0) => {
  const start = new Date(date);
  start.setDate(start.getDate() + daysOffset - 6);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

exports._getWeeklyCount = async (userId, dateRange) => {
  return await Task.count({
    where: {
      user_id: userId,
      completed: true,
      completed_at: {
        [Op.between]: [dateRange.start, dateRange.end],
      },
    },
  });
};