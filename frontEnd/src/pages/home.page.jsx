import { useState } from 'react';

import Sidebar from '../components/layouts/sidebar.component';

import TaskDetailModal from '../components/modals/task-details-modal.component';

import { useDashboard } from '../hooks/use-dashboard.hook';

import {
  FaClock,
  FaBrain,
  FaLightbulb,
  FaChartLine,
} from 'react-icons/fa';

function HomePage() {
  const {
    dashboard,
    loading,
    error,
  } = useDashboard();

  const [detailTask, setDetailTask] =
    useState(null);

  const [isDetailOpen, setIsDetailOpen] =
    useState(false);

  if (error) {
    return <h2>{error}</h2>;
  }

  const onViewDetail = (task) => {
    setDetailTask(task);

    setIsDetailOpen(true);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading || !dashboard) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="dashboard-container">
            <p>Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
          {/* HEADER */}

          <div className="dashboard-header">
            <div>
              <h1>Welcome Back 👋</h1>

              <p>
                You have{' '}
                {dashboard.pendingTasks}{' '}
                pending tasks today.
              </p>
            </div>
          </div>
        <div className="dashboard-container">

          {/* STATS */}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">
                  <FaClock />
                </span>
              </div>

              <h2>
                {dashboard.peakHour}
              </h2>

              <p>
                Peak Productivity Hour
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">
                  <FaChartLine />
                </span>
              </div>

              <h2>
                {
                  dashboard.momentumLevel
                    .label
                }
              </h2>

              <p>Momentum Level</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">
                  <FaBrain />
                </span>
              </div>

              <h2>
                {dashboard.focusScore}%
              </h2>

              <p>Daily Focus Score</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">
                  <FaLightbulb />
                </span>
              </div>

              <h2>Focus Tip</h2>

              <p>
                {
                  dashboard.smartRecommendation
                }
              </p>
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
                {dashboard.recentTasks
                  .length > 0 ? (
                  dashboard.recentTasks.map(
                    (task) => (
                      <div
                        className="task-card"
                        key={
                          task.task_id
                        }
                        onClick={() =>
                          onViewDetail(
                            task
                          )
                        }
                        style={{
                          cursor:
                            'pointer',
                        }}
                      >
                        <div>
                          <h4>
                            {task.title}
                          </h4>

                          <p>
                            {task.description ||
                              'No description'}
                          </p>
                        </div>

                        <span
                          className={`priority-badge ${
                            task.priority?.toLowerCase() ||
                            'low'
                          }`}
                        >
                          {
                            task.priority
                          }
                        </span>
                      </div>
                    )
                  )
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
                      {
                        dashboard.highPriorityTasks
                      }
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>
                      Completed Tasks
                    </span>

                    <strong>
                      {
                        dashboard.completedTasks
                      }
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>
                      Pending Tasks
                    </span>

                    <strong>
                      {
                        dashboard.pendingTasks
                      }
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>
                      Medium Priority
                    </span>

                    <strong>
                      {
                        dashboard.mediumPriorityTasks
                      }
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>
                      Low Priority
                    </span>

                    <strong>
                      {
                        dashboard.lowPriorityTasks
                      }
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MODAL */}

          <TaskDetailModal
            isOpen={isDetailOpen}
            task={detailTask}
            onClose={() => {
              setIsDetailOpen(false);

              setDetailTask(null);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
