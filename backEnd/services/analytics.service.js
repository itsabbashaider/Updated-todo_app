// ─── Dependencies ─────────────────────────────────────────────────────────────
const { Task } = require('../models');

const { Op } = require('sequelize');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const startOfDay = (date) => {
  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  return d;
};

// ─── Get Analytics ────────────────────────────────────────────────────────────
exports.getAnalytics = async (range = 7) => {
  // ─── Basic Counts ──────────────────────────────────────────────────────────
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
  const highPriority =
    await Task.count({
      where: {
        priority: {
          [Op.iLike]: 'high',
        },
      },
    });

  const mediumPriority =
    await Task.count({
      where: {
        priority: {
          [Op.iLike]: 'medium',
        },
      },
    });

  const lowPriority =
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
          (completedTasks / totalTasks) *
            100
        )
      : 0;

  // ─── Recent Tasks For Trends/Streaks ───────────────────────────────────────
  const tasks = await Task.findAll({
    where: {
      created_at: {
        [Op.gte]: new Date(
          Date.now() -
            range *
              24 *
              60 *
              60 *
              1000
        ),
      },
    },

    order: [['created_at', 'DESC']],
  });

  // ─── Streak ────────────────────────────────────────────────────────────────
  let streak = 0;

  const today = startOfDay(
    new Date()
  );

  let currentDate = new Date(today);

  while (true) {
    const hasCompletedTask =
      tasks.some((task) => {
        if (!task.completed) {
          return false;
        }

        const taskDate = startOfDay(
          task.completed_at ||
            task.updated_at ||
            task.created_at
        );

        return (
          taskDate.getTime() ===
          currentDate.getTime()
        );
      });

    if (!hasCompletedTask) {
      break;
    }

    streak++;

    currentDate.setDate(
      currentDate.getDate() - 1
    );
  }

// ─── Trend Data ────────────────────────────────────────────────────────────
  const trendData = [];

  for (
    let i = range - 1;
    i >= 0;
    i--
  ) {
    const current = startOfDay(
      new Date()
    );

    current.setDate(
      current.getDate() - i
    );

    const dayTasks = tasks.filter(
      (task) => {
        const taskDate =
          startOfDay(
            task.completed_at ||
              task.updated_at ||
              task.created_at
          );

        return (
          taskDate.getTime() ===
          current.getTime()
        );
      }
    );

    const completed =
      dayTasks.filter(
        (task) => task.completed
      ).length;

    const total =
      dayTasks.length;

    const completionRate =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0;

    // ─── Status Logic Moved To Backend ─────────────────────────────────────
    let status = 'low';

    if (completionRate >= 90) {
      status = 'excellent';
    } else if (
      completionRate >= 60
    ) {
      status = 'good';
    } else if (
      completionRate >= 40
    ) {
      status = 'average';
    }

    trendData.push({
      date:
        current.toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
            day: 'numeric',
          }
        ),

      completed,

      pending:
        total - completed,

      total,

      completionRate,

      status,
    });
  }

  // ─── Weekly Comparison ─────────────────────────────────────────────────────
  const todayDate = startOfDay(
    new Date()
  );

  const currentWeekStart =
    new Date(todayDate);

  currentWeekStart.setDate(
    todayDate.getDate() -
      todayDate.getDay()
  );

  const lastWeekStart =
    new Date(currentWeekStart);

  lastWeekStart.setDate(
    lastWeekStart.getDate() - 7
  );

  const lastWeekEnd =
    new Date(lastWeekStart);

  lastWeekEnd.setDate(
    lastWeekEnd.getDate() + 6
  );

  const currentWeek =
    await Task.count({
      where: {
        completed: true,

        created_at: {
          [Op.gte]:
            currentWeekStart,
        },
      },
    });

  const lastWeek =
    await Task.count({
      where: {
        completed: true,

        created_at: {
          [Op.between]: [
            lastWeekStart,
            lastWeekEnd,
          ],
        },
      },
    });

  const improvement =
    lastWeek > 0
      ? Math.round(
          ((currentWeek -
            lastWeek) /
            lastWeek) *
            100
        )
      : currentWeek > 0
      ? 100
      : 0;

  // ─── Insights ──────────────────────────────────────────────────────────────
  const insights = [];

  if (productivity >= 80) {
    insights.push({
      icon: 'trending-up',

      title:
        'Exceptional Performance',

      description: `You're crushing it with ${productivity}% completion rate!`,
    });
  }

  if (streak >= 3) {
    insights.push({
      icon: 'Zap',

      title: `${streak}-Day Streak`,

      description:
        'Consistency is building momentum!',
    });
  }

  if (highPriority >= 5) {
    insights.push({
      icon: 'alert-triangle',

      title: 'Heavy Workload',

      description: `You have ${highPriority} high-priority tasks.`,
    });
  }

  if (insights.length === 0) {
  insights.push({
    icon: 'info',

    title: 'Keep Going',

    description:
      'Stay consistent and complete tasks to unlock deeper productivity insights.',
  });
}

  // ─── Charts ────────────────────────────────────────────────────────────────
  const pieData = [
    {
      name: 'Completed',

      value: completedTasks,
    },

    {
      name: 'Pending',

      value: pendingTasks,
    },
  ];

  const priorityData = [
    {
      name: 'High',

      value: highPriority,
    },

    {
      name: 'Medium',

      value: mediumPriority,
    },

    {
      name: 'Low',

      value: lowPriority,
    },
  ];

  // ─── Response ──────────────────────────────────────────────────────────────
  return {
    totalTasks,

    completedTasks,

    pendingTasks,

    highPriority,

    mediumPriority,

    lowPriority,

    productivity,

    streak,

    trendData,

    pieData,

    priorityData,

    insights,

    weeklyComparison: {
      currentWeek,

      lastWeek,

      improvement,
    },
  };
};