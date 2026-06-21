import { useState } from 'react';

import Sidebar from '../components/layouts/sidebar.component';
import { useAnalytics } from '../hooks/use-analytics.hook';
import { AnalyticsSkeleton } from '../components/skeletons/analytics.skeleton';
import {
  getStatusFromCompletion,
  generateInsights,
  calculateWorkloadHealth,
} from '../utils/analytics.util';
import { formatLocalDay, formatLocalShortDate } from '../utils/date.util';

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

import { FiZap, FiTrendingUp, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ICON_MAP = {
  zap: FiZap,
  'trending-up': FiTrendingUp,
  'alert-triangle': FiAlertTriangle,
  info: FiInfo,
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const DATE_RANGE_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
];

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(7);

  const { analytics, loading } = useAnalytics(dateRange);
  const { analytics: timelineAnalytics } = useAnalytics(10);

  if (loading) {
    return (
      <div className="analytics-layout">
        <Sidebar />
        <AnalyticsSkeleton />
      </div>
    );
  }

  const {
    stats = {},
    streak = 0,
    trendData: rawTrendData = [],
    chartData = {},
    weeklyComparison = {},
  } = analytics || {};

  const totalTasks = stats.totalCount || 0;
  const completedTasks = stats.completedCount || 0;
  const pendingTasks = stats.pendingCount || 0;
  const productivity = stats.completionRate || 0;
  const highPriority = stats.highPriorityCount || 0;
  const priorityData = chartData.priorityData || [];

  const weeklyComparisonData = {
    currentWeek: weeklyComparison?.currentWeek || 0,
    lastWeek: weeklyComparison?.lastWeek || 0,
    improvement: weeklyComparison?.improvement || 0,
  };

  const { trendData: timelineTrendData = [] } = timelineAnalytics || {};

  const chartTrendData = (rawTrendData || []).map((day) => ({
    ...day,
    dateLabel: formatLocalDay(day.date),
    status: getStatusFromCompletion(day.completionRate),
  }));

  const timelineTrendDataWithStatus = (timelineTrendData || []).map((day) => ({
    ...day,
    dateLabel: formatLocalShortDate(day.date),
    status: getStatusFromCompletion(day.completionRate),
  }));

  const insights = generateInsights(stats, streak, weeklyComparisonData, productivity);

  const { workloadHealth, workloadScore, balancePenalty } = calculateWorkloadHealth(
    stats,
    priorityData
  );

  return (
    <div className="analytics-layout">
      <Sidebar />
      <main className="analytics-main">
        <div className="analytics-header">
          <div>
            <h1>Analytics</h1>
            <p>Visualize your productivity and task progress.</p>
          </div>
          <div className="date-range-selector">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`range-btn ${dateRange === option.value ? 'active' : ''}`}
                onClick={() => setDateRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="analytics-container">
          <div className="analytics-stats">
            <div className="analytics-card">
              <h3>
                <Target size={18} /> Total Tasks
              </h3>
              <h2>{totalTasks}</h2>
              <p className="card-subtitle">All time</p>
            </div>
            <div className="analytics-card">
              <h3>
                <CheckCircle2 size={18} /> Completed
              </h3>
              <h2>{completedTasks}</h2>
              <p className="card-subtitle">Tasks finished</p>
            </div>
            <div className="analytics-card">
              <h3>
                <Clock3 size={18} /> Pending
              </h3>
              <h2>{pendingTasks}</h2>
              <p className="card-subtitle">Waiting to do</p>
            </div>
            <div className="analytics-card">
              <h3>
                <TrendingUp size={18} /> Productivity
              </h3>
              <h2>{productivity}%</h2>
              <p className="card-subtitle">Completion rate</p>
            </div>
            <div className="analytics-card streak-card">
              <h3>
                <Flame size={18} /> Current Streak
              </h3>
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

          <div className="trends-card">
            <div className="chart-header">
              <div>
                <h3>Productivity Trends</h3>
                <p>Daily completion rate over the last {dateRange} days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dateLabel" stroke="var(--text-muted)" />
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

          {insights.length > 0 && (
            <div className="insights-section">
              <h3>Smart Insights</h3>
              <div className="insights-grid">
                {insights.map((insight, index) => {
                  const Icon = ICON_MAP[insight.icon];
                  return (
                    <div key={index} className="insight-card">
                      <div className="insight-icon">{Icon && <Icon size={20} />}</div>
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

          <div className="charts-grid">
            <div className="timeline-chart">
              <div className="chart-header">
                <div>
                  <h3>Productivity Timeline</h3>
                  <p>Your daily performance over the last 10 days</p>
                </div>
              </div>
              <div className="timeline-list">
                {timelineTrendDataWithStatus?.map((day, index) => {
                  const STATUS_ICONS = {
                    excellent: Rocket,
                    good: Flame,
                    average: CheckCircle2,
                    low: AlertTriangle,
                  };
                  const StatusIcon = STATUS_ICONS[day.status] || AlertTriangle;
                  return (
                    <div key={index} className="timeline-row">
                      <div className="timeline-date">{day.dateLabel}</div>
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

            <div className="analytics-column">
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

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Weekly Comparison</h3>
                </div>
                <div className="weekly-comparison">
                  <div className="week-item">
                    <span className="week-label">This Week</span>
                    <div className="week-stat">
                      <span className="week-number">{weeklyComparisonData.currentWeek}</span>
                      <span className="week-subtext">tasks completed</span>
                    </div>
                  </div>
                  <div className="comparison-arrow">
                    <span
                      className={`arrow ${weeklyComparisonData.improvement >= 0 ? 'up' : 'down'}`}
                    >
                      {weeklyComparisonData.improvement >= 0 ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </span>
                    <span
                      className={`percentage ${
                        weeklyComparisonData.improvement >= 0 ? 'positive' : 'negative'
                      }`}
                    >
                      {weeklyComparisonData.improvement >= 0 ? '+' : ''}
                      {weeklyComparisonData.improvement}%
                    </span>
                  </div>
                  <div className="week-item">
                    <span className="week-label">Last Week</span>
                    <div className="week-stat">
                      <span className="week-number">{weeklyComparisonData.lastWeek}</span>
                      <span className="week-subtext">tasks completed</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { week: 'Last', tasks: weeklyComparisonData.lastWeek },
                      { week: 'This', tasks: weeklyComparisonData.currentWeek },
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
      </main>
    </div>
  );
}

export default AnalyticsPage;