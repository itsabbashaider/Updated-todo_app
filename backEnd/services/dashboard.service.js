// ─── Dependencies ─────────────────────────────────────────────────────────────
const { Task } = require('../models');

const { Op } = require('sequelize');

// ─── Get Dashboard Data ───────────────────────────────────────────────────────
exports.getDashboardData = async () => {

  // ─── Recent Tasks ──────────────────────────────────────────────────────────
  const recentTasks =
    await Task.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
    });

  // ─── Counts ────────────────────────────────────────────────────────────────
  const totalTasks =
    await Task.count();

  const completedTasks =
    await Task.count({
      where: {
        completed: true,
      },
    });

  const pendingTasks =
    await Task.count({
      where: {
        completed: false,
      },
    });

  // ─── Priority Counts ───────────────────────────────────────────────────────
  const highPriorityTasks =
    await Task.count({
      where: {
        priority: {
          [Op.iLike]: 'high',
        },
      },
    });

  const mediumPriorityTasks =
    await Task.count({
      where: {
        priority: {
          [Op.iLike]: 'medium',
        },
      },
    });

  const lowPriorityTasks =
    await Task.count({
      where: {
        priority: {
          [Op.iLike]: 'low',
        },
      },
    });

  // ─── Productivity ──────────────────────────────────────────────────────────
  const productivity =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  // ─── Peak Hour Data ────────────────────────────────────────────────────────
  const taskDates =
    await Task.findAll({
      attributes: [
        'created_at',
        'updated_at',
        'completed_at',
      ],
    });

  let peakHour = 'No Data';

  if (taskDates.length > 0) {

    const hourMap = {};

    taskDates.forEach((task) => {

      const date = new Date(
        task.completed_at ||
          task.updated_at ||
          task.created_at
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const hour =
        date.getHours();

      hourMap[hour] =
        (hourMap[hour] || 0) + 1;
    });

    const peak =
      Object.entries(hourMap).sort(
        (a, b) =>
          b[1] - a[1]
      )[0];

    if (peak) {

      const hour =
        Number(peak[0]);

      const formattedHour =
        hour % 12 === 0
          ? 12
          : hour % 12;

      const period =
        hour >= 12
          ? 'PM'
          : 'AM';

      peakHour =
        `${formattedHour}:00 ${period}`;
    }
  }

  // ─── Momentum Level ────────────────────────────────────────────────────────
  let momentumLevel = {
    label: 'Starting',
    icon: '🌱',
  };

  if (productivity >= 90) {

    momentumLevel = {
      label: 'Unstoppable',
      icon: '🚀',
    };

  } else if (
    productivity >= 75
  ) {

    momentumLevel = {
      label: 'High',
      icon: '🔥',
    };

  } else if (
    productivity >= 50
  ) {

    momentumLevel = {
      label: 'Building',
      icon: '⚡',
    };
  }

  // ─── Focus Score ───────────────────────────────────────────────────────────
  const focusScore =
    Math.min(
      100,
      productivity +
        completedTasks +
        highPriorityTasks * 2
    );

  // ─── Recommendation ────────────────────────────────────────────────────────
  let smartRecommendation =
    'Small consistent progress beats perfection every time.';

  if (
    pendingTasks >= 15
  ) {

    smartRecommendation =
      'Focus on clearing older tasks before adding new ones.';

  } else if (
    highPriorityTasks >= 5
  ) {

    smartRecommendation =
      'Prioritize high-impact tasks while your energy is high.';

  } else if (
    productivity >= 85
  ) {

    smartRecommendation =
      'Excellent momentum. Protect your focus and keep going.';

  } else if (
    productivity <= 40
  ) {

    smartRecommendation =
      'Start with one small task to rebuild momentum.';
  }

  // ─── Response ──────────────────────────────────────────────────────────────
  return {

    pendingTasks,

    completedTasks,

    productivity,

    highPriorityTasks,

    mediumPriorityTasks,

    lowPriorityTasks,

    peakHour,

    momentumLevel,

    focusScore,

    smartRecommendation,

    recentTasks,
  };
};