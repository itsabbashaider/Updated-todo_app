import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ThemePresetSwitcher from '../components/theme-preset-switcher.component';

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function Dashboard() {
  
  const { state }      = useLocation();
  const navigate       = useNavigate();
  const [hoverIndex, setHoverIndex] = useState(null);

  const tasks        = state?.tasks || [];
  const selectedDate = new Date(state?.selectedDate || new Date());
  const selected     = selectedDate.toDateString();

  // ─── Daily Stats ──────────────────────────────────────────────────────────
  const todayTasks = tasks.filter((task) => {
    const createdToday   = task.createdAt && new Date(task.createdAt).toDateString() === selected;
    const completedToday = task.completed && task.completed_at && new Date(task.completed_at).toDateString() === selected;
    const overdueTask    = task.createdAt && new Date(task.createdAt) < selectedDate && !task.completed && selectedDate.toDateString() === new Date().toDateString();

    return createdToday || completedToday || overdueTask;
  });

  const total          = todayTasks.length;
  const completed      = todayTasks.filter((t) => t.completed).length;
  const pending        = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // ─── Weekly Data ──────────────────────────────────────────────────────────
  const weeklyData = [...Array(7)].map((_, i) => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));

    const count = tasks.filter((t) => {
      if (!t.completed || !t.completed_at) return false;

      const completedDate = new Date(t.completed_at);
      completedDate.setHours(0, 0, 0, 0);

      return completedDate.toDateString() === d.toDateString();
    }).length;

    return {
      day       : d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed : count,
    };
  });

  // ─── Streak ───────────────────────────────────────────────────────────────
  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const dateStr = d.toDateString();
    const hasCompleted = tasks.some(
      (t) => t.completed && t.completed_at && new Date(t.completed_at).toDateString() === dateStr
    );

    if (hasCompleted) {
      streak++;
    } else {
      break;
    }
  }

  // ─── Score ────────────────────────────────────────────────────────────────
  const score = completionRate;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app-container dashboard-page">
      
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="date">{selectedDate.toDateString()}</p>
        </div>

        <div className="dashboard-actions">
          <ThemePresetSwitcher />

          <button className="btn secondary" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <h3>{total}</h3>
          <p>Total</p>
        </div>

        <div className="stat-box success">
          <h3>{completed}</h3>
          <p>Completed</p>
        </div>

        <div className="stat-box warning">
          <h3>{pending}</h3>
          <p>Pending</p>
        </div>

        <div className="stat-box primary">
          <h3>{completionRate}%</h3>
          <p>Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${completionRate}%` }} />
      </div>

      {/* Weekly Activity Chart */}
      <h2 className="section-title">Weekly Activity</h2>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData}>
            
            <XAxis dataKey="day" stroke="var(--text-soft)" />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="custom-tooltip">
                      <p>{payload[0].payload.day}</p>
                      <h4>{payload[0].value} Completed</h4>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar dataKey="completed" radius={[8, 8, 0, 0]} barSize={24} cursor="pointer">
              {weeklyData.map((entry, index) => (
                <Cell
                  key={index}
                  className="chart-bar"
                  fill={hoverIndex === index ? 'var(--accent-hover)' : 'var(--accent)'}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day Navigation */}
      <div className="day-nav">
        <button
          className="btn secondary-btn"
          onClick={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            navigate('/dashboard', { state: { tasks, selectedDate: prev } });
          }}
        >
          ← Prev
        </button>

        <button
          className="btn secondary-btn"
          onClick={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            navigate('/dashboard', { state: { tasks, selectedDate: next } });
          }}
        >
          Next →
        </button>
      </div>

      {/* Score Box */}
      <div className="score-box compact">
        <h2>Score</h2>
        <h1>{score}</h1>
        <p>
          {score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Focus'}
        </p>
      </div>

      {/* Streak Box */}
      <div className="streak-box compact">
        🔥 <strong>{streak} day streak</strong>
      </div>

    </div>
  );
}

export default Dashboard;
