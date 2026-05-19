import {
  useState,
  useMemo,
} from 'react';

import Sidebar from '../components/layouts/sidebar.component';

import TaskDetailModal from '../components/modals/task-details-modal.component';

import { useTasks } from '../hooks/use-task.hook';

function HomePage() {
  const { tasks } = useTasks();

  const [detailTask, setDetailTask] =
    useState(null);

  const [isDetailOpen, setIsDetailOpen] =
    useState(false);

  /* ==========================================
     BASIC STATS
  ========================================== */

  const completedTasks = useMemo(
    () =>
      tasks.filter((task) => task.completed)
        .length,
    [tasks]
  );

  const pendingTasks = useMemo(
    () =>
      tasks.filter((task) => !task.completed)
        .length,
    [tasks]
  );

  const productivity = useMemo(() => {
    return tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;
  }, [tasks, completedTasks]);

  const highPriorityTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          'high'
      ).length,
    [tasks]
  );

  const mediumPriorityTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          'medium'
      ).length,
    [tasks]
  );

  const lowPriorityTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          'low'
      ).length,
    [tasks]
  );

  const todayTasks = useMemo(
    () => tasks.slice(0, 5),
    [tasks]
  );

  /* ==========================================
     PEAK PRODUCTIVITY HOUR
  ========================================== */

  const peakHour = useMemo(() => {
    if (tasks.length === 0) {
      return 'No Data';
    }

    const hourMap = {};

    tasks.forEach((task) => {
      const date = new Date(
        task.completed_at ||
          task.completedAt ||
          task.updated_at ||
          task.updatedAt ||
          task.created_at ||
          task.createdAt
      );

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const hour = date.getHours();

      hourMap[hour] =
        (hourMap[hour] || 0) + 1;
    });

    const peak = Object.entries(hourMap).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (!peak) {
      return 'No Data';
    }

    const hour = Number(peak[0]);

    const formattedHour =
      hour % 12 === 0 ? 12 : hour % 12;

    const period = hour >= 12 ? 'PM' : 'AM';

    return `${formattedHour}:00 ${period}`;
  }, [tasks]);

  /* ==========================================
     MOMENTUM LEVEL
  ========================================== */

  const momentumLevel = useMemo(() => {
    if (productivity >= 90) {
      return {
        label: 'Unstoppable',
        icon: '🚀',
      };
    }

    if (productivity >= 75) {
      return {
        label: 'High',
        icon: '🔥',
      };
    }

    if (productivity >= 50) {
      return {
        label: 'Building',
        icon: '⚡',
      };
    }

    return {
      label: 'Starting',
      icon: '🌱',
    };
  }, [productivity]);

  /* ==========================================
     DAILY FOCUS SCORE
  ========================================== */

  const focusScore = useMemo(() => {
    return Math.min(
      100,
      productivity +
        completedTasks +
        highPriorityTasks * 2
    );
  }, [
    productivity,
    completedTasks,
    highPriorityTasks,
  ]);

  /* ==========================================
     SMART RECOMMENDATION
  ========================================== */

  const smartRecommendation = useMemo(() => {
    if (pendingTasks >= 15) {
      return 'Focus on clearing older tasks before adding new ones.';
    }

    if (highPriorityTasks >= 5) {
      return 'Prioritize high-impact tasks while your energy is high.';
    }

    if (productivity >= 85) {
      return 'Excellent momentum. Protect your focus and keep going.';
    }

    if (productivity <= 40) {
      return 'Start with one small task to rebuild momentum.';
    }

    return 'Small consistent progress beats perfection every time.';
  }, [
    pendingTasks,
    highPriorityTasks,
    productivity,
  ]);

  /* ==========================================
     TASK MODAL
  ========================================== */

  const onViewDetail = (task) => {
    setDetailTask(task);

    setIsDetailOpen(true);
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* HEADER */}

        <div className="dashboard-header">
          <div>
            <h1>Welcome Back 👋</h1>

            <p>
              You have {pendingTasks}{' '}
              pending tasks today.
            </p>
          </div>
        </div>

        {/* STATS */}

        <section className="stats-grid">
          {/* PEAK HOUR */}

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">
                ⏰
              </span>
            </div>

            <h2>{peakHour}</h2>

            <p>
              Peak Productivity Hour
            </p>
          </div>

          {/* MOMENTUM */}

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">
                {momentumLevel.icon}
              </span>
            </div>

            <h2>
              {momentumLevel.label}
            </h2>

            <p>Momentum Level</p>
          </div>

          {/* DAILY FOCUS SCORE */}

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">
                🧠
              </span>
            </div>

            <h2>{focusScore}%</h2>

            <p>Daily Focus Score</p>
          </div>

          {/* RECOMMENDATION */}

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-icon">
                💡
              </span>
            </div>

            <h2>Focus Tip</h2>

            <p>{smartRecommendation}</p>
          </div>
        </section>

        {/* CONTENT */}

        <section className="dashboard-content">
          {/* RECENT TASKS */}

          <div className="tasks-section">
            <div className="section-header">
              <h3>Recent Tasks</h3>
            </div>

            <div className="tasks-list">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div
                    className="task-card"
                    key={
                      task.task_id ||
                      task.id
                    }
                    onClick={() =>
                      onViewDetail(task)
                    }
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <h4>{task.title}</h4>

                      <p>
                        {task.description ||
                          'No description'}
                      </p>

                      <small className="task-date">
                        Created:{' '}
                        {new Date(
                          task.created_at ||
                            task.createdAt
                        ).toLocaleString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </small>
                    </div>

                    <span
                      className={`priority-badge ${
                        task.priority?.toLowerCase() ||
                        'low'
                      }`}
                    >
                      {task.priority
                        ? task.priority[0].toUpperCase() +
                          task.priority.slice(1)
                        : 'Low'}
                    </span>
                  </div>
                ))
              ) : (
                <p>No tasks yet.</p>
              )}
            </div>
          </div>

          {/* INSIGHTS */}

          <div className="calendar-preview">
            <div className="section-header">
              <h3>Focus Insights</h3>
            </div>

            <div className="calendar-card">
              <h2>
                Personal Productivity
              </h2>

              <div className="summary-box">
                <div className="summary-item">
                  <span>
                    High Priority
                  </span>

                  <strong>
                    {highPriorityTasks}
                  </strong>
                </div>

                <div className="summary-item">
                  <span>
                    Completed Tasks
                  </span>

                  <strong>
                    {completedTasks}
                  </strong>
                </div>

                <div className="summary-item">
                  <span>
                    Pending Tasks
                  </span>

                  <strong>
                    {pendingTasks}
                  </strong>
                </div>

                <div className="summary-item">
                  <span>
                    Medium Priority
                  </span>

                  <strong>
                    {mediumPriorityTasks}
                  </strong>
                </div>

                <div className="summary-item">
                  <span>
                    Low Priority
                  </span>

                  <strong>
                    {lowPriorityTasks}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TASK MODAL */}

        <TaskDetailModal
          isOpen={isDetailOpen}
          task={detailTask}
          onClose={() => {
            setIsDetailOpen(false);

            setDetailTask(null);
          }}
        />
      </main>
    </div>
  );
}

export default HomePage;