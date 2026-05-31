// ─── Dependencies ─────────────────────────────────────────────────────────────
import { useState } from 'react';

import Sidebar from '../components/layouts/sidebar.component';

import '../styles/analytics.css';

import { useAnalytics } from '../hooks/use-analytics.hook';

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

import {
  Flame,
  CheckCircle2,
  Clock3,
  Target,
  TrendingUp,
  TrendingDown,
  Rocket,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Scale,
} from 'lucide-react';

import {
  FiZap,
  FiTrendingUp,
  FiAlertTriangle,
  FiInfo,
} from 'react-icons/fi';

const iconMap = {
  zap: FiZap,
  'trending-up': FiTrendingUp,
  'alert-triangle': FiAlertTriangle,
  info: FiInfo,
};

// ─── Component ────────────────────────────────────────────────────────────────
function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(7);

  // Main analytics — changes with date selector
  const {
    analytics,
    loading,
    error,
  } = useAnalytics(dateRange);

  // Timeline analytics — always fixed at 10 days, unaffected by selector
  const { analytics: timelineAnalytics } = useAnalytics(10);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading || !analytics) {
    return (
      <div className="analytics-layout">
        <Sidebar />
        <main className="analytics-main">
          <h2>Loading analytics...</h2>
        </main>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="analytics-layout">
        <Sidebar />
        <main className="analytics-main">
          <h2>Failed to load analytics.</h2>
        </main>
      </div>
    );
  }

  // ─── Analytics Data ────────────────────────────────────────────────────────
  const {
    totalTasks,
    completedTasks,
    pendingTasks,
    productivity,
    streak,
    highPriority,
    priorityData,
    trendData: chartTrendData,
    insights,
    weeklyComparison,
  } = analytics;

  // Timeline always shows 10 days regardless of selector
  const { trendData: timelineTrendData } = timelineAnalytics || {};

  // ─── Balanced Workload Momentum Logic ──────────────────────────────────────
  const baselineScore = (pendingTasks * 2) + (highPriority * 5);
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const executionMultiplier = 1 - completionRate;
  let workloadScore = Math.min(Math.round(baselineScore * executionMultiplier), 100);

  // ─── Priority Balancing Engine ─────────────────────────────────────────────
  const highCount  = priorityData.find(p => p.name === 'High')?.value   || 0;
  const medCount   = priorityData.find(p => p.name === 'Medium')?.value || 0;
  const lowCount   = priorityData.find(p => p.name === 'Low')?.value    || 0;

  let balanceMessage = 'Your task distribution across priorities is perfectly balanced.';
  let balancePenalty = 0;
  let dominantPriority = '';

  if (highCount > (medCount + lowCount) && highCount > 0) {
    dominantPriority = 'High';
    balancePenalty = (highCount - (medCount + lowCount)) * 2;
    balanceMessage = 'You are focusing heavily on High priority items. Try parsing some Medium and Low tasks to avoid burning out.';
  } else if (medCount > (highCount + lowCount) && medCount > 0) {
    dominantPriority = 'Medium';
    balancePenalty = (medCount - (highCount + lowCount)) * 2;
    balanceMessage = 'Medium tasks are dominating your log. Ensure High targets aren\'t slipping through the cracks.';
  } else if (lowCount > (highCount + medCount) && lowCount > 0) {
    dominantPriority = 'Low';
    balancePenalty = (lowCount - (highCount + medCount)) * 2;
    balanceMessage = 'You are focusing heavily on Low priority chores. Shift attention toward higher impact objectives.';
  }

  workloadScore = Math.min(workloadScore + balancePenalty, 100);

  let workloadHealth = {
    status: 'Healthy',
    color: 'green',
    message: balancePenalty > 0 ? balanceMessage : 'Your workload is balanced and under control.',
    recommendation: 'Keep maintaining your current pace.',
  };

  if (workloadScore >= 15 && workloadScore < 35) {
    workloadHealth = {
      status: 'Moderate',
      color: 'yellow',
      message: balancePenalty > 0 ? balanceMessage : 'Your backlog is growing, but your performance is keeping it stable.',
      recommendation: 'Focus on remaining structural targets to clear the deck.',
    };
  } else if (workloadScore >= 35) {
    workloadHealth = {
      status: 'Overloaded',
      color: 'red',
      message: balancePenalty > 0 ? balanceMessage : 'Backlog volume is outstripping your completion speed.',
      recommendation: dominantPriority === 'Low'
        ? 'Stop clearing minor tasks. Force-stop incoming workflow and finish High priorities.'
        : 'Pause incoming tasks and clear out at least 3 alternative priority items.',
    };
  }

  // ─── Colors ────────────────────────────────────────────────────────────────
  const PRIORITY_COLORS = {
    High:   '#ef4444',
    Medium: '#f59e0b',
    Low:    '#10b981',
  };

  // ─── Render ────────────────────────────────────────────────────────────────
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

        <div className="analytics-container">

          {/* KEY METRICS */}
          <div className="analytics-stats">
            <div className="analytics-card">
              <h3><Target size={18} /> Total Tasks</h3>
              <h2>{totalTasks}</h2>
              <p className="card-subtitle">All time</p>
            </div>

            <div className="analytics-card">
              <h3><CheckCircle2 size={18} /> Completed</h3>
              <h2>{completedTasks}</h2>
              <p className="card-subtitle">Tasks finished</p>
            </div>

            <div className="analytics-card">
              <h3><Clock3 size={18} /> Pending</h3>
              <h2>{pendingTasks}</h2>
              <p className="card-subtitle">Waiting to do</p>
            </div>

            <div className="analytics-card">
              <h3><TrendingUp size={18} /> Productivity</h3>
              <h2>{productivity}%</h2>
              <p className="card-subtitle">Completion rate</p>
            </div>

            <div className="analytics-card streak-card">
              <h3><Flame size={18} /> Current Streak</h3>
              <h2>{streak}</h2>
              <p className="card-subtitle">Days in a row</p>
              <div className="streak-icon">
                <Flame size={26} />
              </div>
            </div>

            <div className="analytics-card">
              <h3>High Priority</h3>
              <h2>{highPriority}</h2>
              <p className="card-subtitle">Tasks to focus</p>
            </div>
          </div>

          {/* PRODUCTIVITY TRENDS — driven by dateRange */}
          <div className="trends-card">
            <div className="chart-header">
              <div>
                <h3>Productivity Trends</h3>
                <p>Daily completion rate over the last {dateRange} days</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={chartTrendData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
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

          {/* SMART INSIGHTS */}
          {insights.length > 0 && (
            <div className="insights-section">
              <h3>Smart Insights</h3>
              <div className="insights-grid">
                {insights.map((insight, index) => {
                  const Icon = iconMap[insight.icon];
                  return (
                    <div key={index} className="insight-card">
                      <div className="insight-icon">
                        {Icon && <Icon size={20} />}
                      </div>
                      <div className="insight-content">
                        <h4>{insight.title}</h4>
                        <p>{insight.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TWO COLUMN LAYOUT */}
          <div className="charts-grid">

            {/* PRODUCTIVITY TIMELINE — always 10 days, unaffected by selector */}
            <div className="timeline-chart">
              <div className="chart-header">
                <div>
                  <h3>Productivity Timeline</h3>
                  <p>Your daily performance over the last 10 days</p>
                </div>
              </div>

              <div className="timeline-list">
                {timelineTrendData?.map((day, index) => {
                  const STATUS_ICONS = {
                    excellent: Rocket,
                    good:      Flame,
                    average:   CheckCircle2,
                    low:       AlertTriangle,
                  };
                  const StatusIcon = STATUS_ICONS[day.status] || AlertTriangle;

                  return (
                    <div key={index} className="timeline-row">
                      <div className="timeline-date">{day.date}</div>
                      <div className="timeline-progress">
                        <div
                          className="timeline-progress-fill"
                          style={{ width: `${day.completionRate}%` }}
                        />
                      </div>
                      <div className="timeline-stats">
                        <span className="timeline-percent">{day.completionRate}%</span>
                        <span className="timeline-tasks">
                          <StatusIcon size={16} />
                          {day.completed} task{day.completed !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN — Workload Health + Weekly Comparison */}
            <div className="analytics-column">

              {/* WORKLOAD HEALTH */}
              <div className="chart-card workload-card">
                <div className="chart-header">
                  <h3>Workload Health</h3>
                </div>

                <div className={`workload-status ${workloadHealth.color}`}>
                  <div className="workload-icon">
                    {balancePenalty > 0 ? (
                      <Scale size={30} />
                    ) : workloadHealth.status === 'Healthy' ? (
                      <ShieldCheck size={30} />
                    ) : workloadHealth.status === 'Moderate' ? (
                      <Clock3 size={30} />
                    ) : (
                      <ShieldAlert size={30} />
                    )}
                  </div>
                  <div className="workload-info">
                    <h2>{workloadHealth.status}</h2>
                    <p>{workloadHealth.message}</p>
                  </div>
                </div>

                <div className="workload-metrics">
                  <div className="metric">
                    <span>Pending</span>
                    <strong>{pendingTasks}</strong>
                  </div>
                  <div className="metric">
                    <span>Balance Penalty</span>
                    <strong style={{ color: balancePenalty > 0 ? 'var(--red)' : 'inherit' }}>
                      +{balancePenalty}
                    </strong>
                  </div>
                  <div className="metric">
                    <span>Score</span>
                    <strong>{workloadScore}</strong>
                  </div>
                </div>

                <div className="health-progress">
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${workloadHealth.color}`}
                      style={{ width: `${workloadScore}%` }}
                    />
                  </div>
                </div>

                <div className="workload-recommendation">
                  <AlertTriangle size={16} />
                  <span>{workloadHealth.recommendation}</span>
                </div>
              </div>

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
                      {weeklyComparison.improvement >= 0
                        ? <TrendingUp size={20} />
                        : <TrendingDown size={20} />}
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
                  <BarChart
                    data={[
                      { week: 'Last', tasks: weeklyComparison.lastWeek },
                      { week: 'This', tasks: weeklyComparison.currentWeek },
                    ]}
                  >
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

            </div>
          </div>

          {/* TASK COMPLETION STATS */}
          <div className="charts-grid">
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

            <div className="chart-card">
              <div className="chart-header">
                <h3>Priority Breakdown</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    outerRadius={80}
                    label
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORITY_COLORS[entry.name]}
                      />
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
      </main>
    </div>
  );
}

export default AnalyticsPage;