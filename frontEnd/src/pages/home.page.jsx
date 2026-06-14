import { useState } from 'react';

import Sidebar from '../components/layouts/sidebar.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import { useDashboard } from '../hooks/use-dashboard.hook';
import { HomeSkeleton } from '../components/skeletons/home.skeleton';  
import { getMomentumLabel, getSmartRecommendation } from '../utils/dashboard.util';
import { formatLocalHour } from '../utils/date.util';

import { FaClock, FaBrain, FaLightbulb, FaChartLine } from 'react-icons/fa';

function HomePage() {
  const { dashboard, loading } = useDashboard();  // ← loading added

  const [detailTask, setDetailTask]   = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const onViewDetail = (task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  };

  // ← NEW — show skeleton while loading
  if (loading) return <div className="dashboard-layout"><Sidebar /><HomeSkeleton /></div>;

  const momentumLabel      = getMomentumLabel(dashboard.peakHour);
  const focusScore         = Math.round(dashboard.stats.completionRate || 0);
  const totalTasks         = dashboard.stats.totalCount;
  const completedTasks     = dashboard.stats.completedCount;
  const pendingTasks       = dashboard.stats.pendingCount;
  const highPriority       = dashboard.stats.highPriorityCount;
  const mediumPriority     = dashboard.stats.mediumPriorityCount;
  const lowPriority        = dashboard.stats.lowPriorityCount;

  const smartRecommendation = getSmartRecommendation({
    totalTasks, completedTasks, pendingTasks,
    highPriority, mediumPriority, lowPriority,
    completionRate: dashboard.stats.completionRate,
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Welcome Back 👋</h1>
            <p>You have {pendingTasks} pending tasks today.</p>
          </div>
        </div>

        <div className="dashboard-container">
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon"><FaClock /></span></div>
              <h2>{formatLocalHour(dashboard.peakHour)}</h2>
              <p>Peak Productivity Hour</p>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon"><FaChartLine /></span></div>
              <h2>{momentumLabel}</h2>
              <p>Momentum Level</p>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon"><FaBrain /></span></div>
              <h2>{focusScore}%</h2>
              <p>Daily Focus Score</p>
            </div>
            <div className="stat-card">
              <div className="stat-top"><span className="stat-icon"><FaLightbulb /></span></div>
              <h2>Focus Tip</h2>
              <p>{smartRecommendation}</p>
            </div>
          </section>

          <section className="dashboard-content">
            <div className="tasks-section">
              <div className="section-header"><h3>Recent Tasks</h3></div>
              <div className="tasks-list">
                {dashboard.recentTasks.length > 0 ? (
                  dashboard.recentTasks.map((task) => (
                    <div className="task-card" key={task.task_id}
                      onClick={() => onViewDetail(task)} style={{ cursor: 'pointer' }}>
                      <div>
                        <h4>{task.title}</h4>
                        <p>{task.description || 'No description'}</p>
                      </div>
                      <span className={`priority-badge ${task.priority?.toLowerCase() || 'low'}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No tasks yet.</p>
                )}
              </div>
            </div>

            <div className="calendar-preview">
              <div className="section-header"><h3>Focus Insights</h3></div>
              <div className="calendar-card">
                <h2>Personal Productivity</h2>
                <div className="summary-box">
                  <div className="summary-item"><span>Completed Tasks</span><strong>{completedTasks}</strong></div>
                  <div className="summary-item"><span>Pending Tasks</span><strong>{pendingTasks}</strong></div>
                  <div className="summary-item"><span>High Priority</span><strong>{highPriority}</strong></div>
                  <div className="summary-item"><span>Medium Priority</span><strong>{mediumPriority}</strong></div>
                  <div className="summary-item"><span>Low Priority</span><strong>{lowPriority}</strong></div>
                </div>
              </div>
            </div>
          </section>

          <TaskDetailModal
            isOpen={isDetailOpen}
            task={detailTask}
            onClose={() => { setIsDetailOpen(false); setDetailTask(null); }}
          />
        </div>
      </main>
    </div>
  );
}

export default HomePage;