import { useState, useMemo } from 'react';
import Sidebar from '../components/layouts/sidebar.component';
import '../styles/analytics.css';
import { useTasks } from '../hooks/use-task.hook';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

function AnalyticsPage() {
  const { tasks } = useTasks();
  const [dateRange, setDateRange] = useState(7); // 7, 14, or 30 days

  // ==========================================
  // CALCULATE BASIC METRICS
  // ==========================================

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;
  const highPriority = tasks.filter((task) => task.priority?.toLowerCase() === 'high').length;
  const mediumPriority = tasks.filter((task) => task.priority?.toLowerCase() === 'medium').length;
  const lowPriority = tasks.filter((task) => task.priority?.toLowerCase() === 'low').length;

  const productivity = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // ==========================================
  // CALCULATE STREAK
  // ==========================================

  const calculateStreak = useMemo(() => {
    if (tasks.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.completed_at || task.completedAt || task.updated_at || task.updatedAt || task.created_at || task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === currentDate.getTime() && task.completed;
      });

      if (dayTasks.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [tasks]);

  // ==========================================
  // GENERATE PRODUCTIVITY TRENDS DATA
  // ==========================================

  const generateTrendData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = dateRange - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.completed_at || task.completedAt || task.updated_at || task.updatedAt || task.created_at || task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === date.getTime();
      });

      const completed = dayTasks.filter((t) => t.completed).length;
      const total = dayTasks.length;

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        completed: completed,
        pending: total - completed,
        total: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return data;
  }, [dateRange, tasks]);
  // ==========================================
  // WEEKLY COMPARISON
  // ==========================================

  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Current week
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());

    const currentWeekTasks = tasks.filter((task) => {
      const taskDate = new Date(task.completed_at || task.completedAt || task.updated_at || task.updatedAt || task.created_at || task.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= currentWeekStart && taskDate <= today && task.completed;
    }).length;

    // Last week
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

    const lastWeekTasks = tasks.filter((task) => {
      const taskDate = new Date(task.completed_at || task.completedAt || task.updated_at || task.updatedAt || task.created_at || task.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= lastWeekStart && taskDate <= lastWeekEnd && task.completed;
    }).length;

    const improvement = lastWeekTasks > 0 ? Math.round(((currentWeekTasks - lastWeekTasks) / lastWeekTasks) * 100) : (currentWeekTasks > 0 ? 100 : 0);

    return {
      currentWeek: currentWeekTasks,
      lastWeek: lastWeekTasks,
      improvement: improvement,
    };
  }, [tasks]);

  // ==========================================
  // SMART INSIGHTS
  // ==========================================

  const insights = useMemo(() => {
    const insightsList = [];

    // Insight 1: Productivity rate
    if (productivity >= 80) {
      insightsList.push({
        icon: '🔥',
        title: 'Exceptional Performance',
        description: `You're crushing it with ${productivity}% completion rate!`,
      });
    } else if (productivity >= 60) {
      insightsList.push({
        icon: '⭐',
        title: 'Strong Progress',
        description: `You've completed ${productivity}% of your tasks. Keep pushing!`,
      });
    } else if (productivity >= 40) {
      insightsList.push({
        icon: '📈',
        title: 'Steady Progress',
        description: `You're at ${productivity}% completion. Time to focus!`,
      });
    }

    // Insight 2: Streak
    if (calculateStreak >= 7) {
      insightsList.push({
        icon: '🏆',
        title: `${calculateStreak}-Day Streak!`,
        description: 'Consistency is key. Keep the momentum going!',
      });
    } else if (calculateStreak >= 3) {
      insightsList.push({
        icon: '⚡',
        title: 'Nice Streak',
        description: `${calculateStreak} days of productivity. Almost there!`,
      });
    }

    // Insight 3: High priority tasks
    if (highPriority > 5) {
      insightsList.push({
        icon: '⚠️',
        title: 'Heavy Workload',
        description: `You have ${highPriority} high-priority tasks. Focus on the most critical ones.`,
      });
    }

    // Insight 4: Weekly improvement
    if (weeklyComparison.improvement > 0) {
      insightsList.push({
        icon: '📊',
        title: 'Week-over-Week Growth',
        description: `${weeklyComparison.improvement > 0 ? '+' : ''}${weeklyComparison.improvement}% improvement this week!`,
      });
    } else if (weeklyComparison.improvement < 0) {
      insightsList.push({
        icon: '💡',
        title: 'Time to Reset',
        description: `Last week was stronger. Let's get back on track!`,
      });
    }

    return insightsList;
  }, [productivity, calculateStreak, highPriority, weeklyComparison.improvement]);

  // ==========================================
  // PIE CHART DATA
  // ==========================================

  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
  ];

  const priorityData = [
    { name: 'High', value: highPriority },
    { name: 'Medium', value: mediumPriority },
    { name: 'Low', value: lowPriority },
  ];

  const COLORS = ['#7c3aed', '#c4b5fd'];
  const PRIORITY_COLORS = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981',
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="analytics-layout">
      <Sidebar />

      <main className="analytics-main">
        {/* HEADER */}
        <div className="analytics-header">
          <div>
            <h1>Analytics</h1>
            <p>Visualize your productivity and task progress.</p>
          </div>

          <div className="date-range-selector">
            <button
              className={`range-btn ${dateRange === 7 ? 'active' : ''}`}
              onClick={() => setDateRange(7)}
            >
              7 Days
            </button>
            <button
              className={`range-btn ${dateRange === 14 ? 'active' : ''}`}
              onClick={() => setDateRange(14)}
            >
              14 Days
            </button>
            <button
              className={`range-btn ${dateRange === 30 ? 'active' : ''}`}
              onClick={() => setDateRange(30)}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="analytics-stats">
          <div className="analytics-card">
            <h3>Total Tasks</h3>
            <h2>{tasks.length}</h2>
            <p className="card-subtitle">All time</p>
          </div>

          <div className="analytics-card">
            <h3>Completed</h3>
            <h2>{completedTasks}</h2>
            <p className="card-subtitle">Tasks finished</p>
          </div>

          <div className="analytics-card">
            <h3>Pending</h3>
            <h2>{pendingTasks}</h2>
            <p className="card-subtitle">Waiting to do</p>
          </div>

          <div className="analytics-card">
            <h3>Productivity</h3>
            <h2>{productivity}%</h2>
            <p className="card-subtitle">Completion rate</p>
          </div>

          <div className="analytics-card streak-card">
            <h3>Current Streak</h3>
            <h2>{calculateStreak}</h2>
            <p className="card-subtitle">Days in a row</p>
            <div className="streak-icon">🔥</div>
          </div>

          <div className="analytics-card">
            <h3>High Priority</h3>
            <h2>{highPriority}</h2>
            <p className="card-subtitle">Tasks to focus</p>
          </div>
        </div>

        {/* PRODUCTIVITY TRENDS */}
        <div className="chart-card trends-card">
          <div className="chart-header">
            <div>
              <h3>Productivity Trends</h3>
              <p>Daily completion rate over the last {dateRange} days</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={generateTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                }}
              />
              <Legend wrapperStyle={{ color: 'var(--text)' }} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ fill: '#7c3aed', r: 5 }}
                activeDot={{ r: 7 }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#c4b5fd"
                strokeWidth={2}
                dot={{ fill: '#c4b5fd', r: 4 }}
                activeDot={{ r: 6 }}
                name="Pending"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="charts-grid">
          {/* PRODUCTIVITY TIMELINE */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Productivity Timeline</h3>
                <p>Your daily performance over the last {dateRange} days</p>
              </div>
            </div>

            <div className="timeline-list">
              {generateTrendData.map((day, index) => {
                let statusIcon = '⚠️';

                if (day.completionRate >= 90) {
                  statusIcon = '🚀';
                } else if (day.completionRate >= 60) {
                  statusIcon = '🔥';
                } else if (day.completionRate >= 40) {
                  statusIcon = '✅';
                }

                return (
                  <div key={index} className="timeline-row">
                    <div className="timeline-date">
                      {day.date}
                    </div>

                    <div className="timeline-progress">
                      <div
                        className="timeline-progress-fill"
                        style={{
                          width: `${day.completionRate}%`,
                        }}
                      />
                    </div>

                    <div className="timeline-stats">
                      <span className="timeline-percent">
                        {day.completionRate}%
                      </span>

                      <span className="timeline-tasks">
                        {statusIcon} {day.completed} task
                        {day.completed !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WEEKLY COMPARISON & PRIORITY */}
          <div className="analytics-column">
            {/* WEEKLY COMPARISON */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Weekly Comparison</h3>
              </div>

              <div className="weekly-comparison">
                <div className="week-item">
                  <span className="week-label">This Week</span>
                  <div className="week-stat">
                    <span className="week-number">{weeklyComparison.currentWeek}</span>
                    <span className="week-subtext">tasks completed</span>
                  </div>
                </div>

                <div className="comparison-arrow">
                  <span className={`arrow ${weeklyComparison.improvement >= 0 ? 'up' : 'down'}`}>
                    {weeklyComparison.improvement >= 0 ? '↑' : '↓'}
                  </span>
                  <span className={`percentage ${weeklyComparison.improvement >= 0 ? 'positive' : 'negative'}`}>
                    {weeklyComparison.improvement >= 0 ? '+' : ''}
                    {weeklyComparison.improvement}%
                  </span>
                </div>

                <div className="week-item">
                  <span className="week-label">Last Week</span>
                  <div className="week-stat">
                    <span className="week-number">{weeklyComparison.lastWeek}</span>
                    <span className="week-subtext">tasks completed</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { week: 'Last', tasks: weeklyComparison.lastWeek },
                  { week: 'This', tasks: weeklyComparison.currentWeek },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                    }}
                  />
                  <Bar dataKey="tasks" fill="#7c3aed" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* PRIORITY BREAKDOWN */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Priority Breakdown</h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" outerRadius={80} label>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SMART INSIGHTS */}
        {insights.length > 0 && (
          <div className="insights-section">
            <h3>Smart Insights</h3>
            <div className="insights-grid">
              {insights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-icon">{insight.icon}</div>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASK COMPLETION STATS */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Task Overview</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Priority Distribution</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                  }}
                />
                <Bar dataKey="value" fill="#7c3aed" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;
