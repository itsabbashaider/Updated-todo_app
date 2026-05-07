import { useState } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function Dashboard() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const [hoverIndex, setHoverIndex] =
    useState(null);

  const tasks = state?.tasks || [];

  const selectedDate =
    state?.selectedDate ||
    new Date();

  const selected =
    selectedDate.toDateString();

  /* =========================
     🔹 DAILY STATS
  ========================= */
  const todayTasks = tasks.filter(
    (task) => {
      const created =
        task.createdAt &&
        new Date(
          task.createdAt
        ).toDateString() ===
          selected;

      const completed =
        task.completedAt &&
        new Date(
          task.completedAt
        ).toDateString() ===
          selected;

      return created || completed;
    }
  );

  const total = todayTasks.length;

  const completed =
    todayTasks.filter(
      (t) => t.completed
    ).length;

  const pending =
    total - completed;

  const completionRate =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  /* =========================
     🔹 WEEKLY DATA
  ========================= */
  const weeklyData = [...Array(7)]
    .map((_, i) => {
      const d = new Date();

      d.setDate(
        d.getDate() - i
      );

      const dateStr =
        d.toDateString();

      const count = tasks.filter(
        (t) =>
          t.completed &&
          t.completedAt &&
          new Date(
            t.completedAt
          ).toDateString() ===
            dateStr
      ).length;

      return {
        day: d.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),

        completed: count,
      };
    })
    .reverse();

  /* =========================
     🔹 STREAK + SCORE
  ========================= */
  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date();

    d.setDate(
      d.getDate() - i
    );

    const dateStr =
      d.toDateString();

    const hasCompleted =
      tasks.some(
        (t) =>
          t.completed &&
          t.completedAt &&
          new Date(
            t.completedAt
          ).toDateString() ===
            dateStr
      );

    if (hasCompleted) {
      streak++;
    } else {
      break;
    }
  }

  const score = Math.min(
    100,
    Math.round(
      completionRate * 0.7 +
        streak * 3
    )
  );

  return (
    <div className="app-container dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <button
          className="btn secondary"
          onClick={() =>
            navigate("/")
          }
        >
          ← Back
        </button>
      </div>

      <p className="date">
        {selectedDate.toDateString()}
      </p>

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
          <h3>
            {completionRate}%
          </h3>

          <p>Progress</p>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${completionRate}%`,
          }}
        />
      </div>

      <h2 className="section-title">
        Weekly Activity
      </h2>

      <div className="chart-box">
        <ResponsiveContainer>
          <BarChart data={weeklyData}>
            <XAxis
              dataKey="day"
              stroke="#9ca3af"
            />

            <Tooltip
              content={({
                active,
                payload,
              }) => {
                if (
                  active &&
                  payload &&
                  payload.length
                ) {
                  return (
                    <div className="custom-tooltip">
                      <p>
                        {
                          payload[0]
                            .payload.day
                        }
                      </p>

                      <h4>
                        {
                          payload[0]
                            .value
                        }{" "}
                        Completed
                      </h4>
                    </div>
                  );
                }

                return null;
              }}
            />

            <Bar
              dataKey="completed"
              radius={[8, 8, 0, 0]}
              barSize={24}
            >
              {weeklyData.map(
                (entry, index) => (
                  <Cell
                    key={index}
                    className="chart-bar"
                    fill={
                      hoverIndex ===
                      index
                        ? "#a78bfa"
                        : "#7c3aed"
                    }
                    onMouseEnter={() =>
                      setHoverIndex(
                        index
                      )
                    }
                    onMouseLeave={() =>
                      setHoverIndex(
                        null
                      )
                    }
                  />
                )
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="score-box compact">
        <h2>Score</h2>

        <h1>{score}</h1>

        <p>
          {score >= 75
            ? "Excellent"
            : score >= 50
            ? "Good"
            : "Focus"}
        </p>
      </div>

      <div className="streak-box compact">
        🔥{" "}
        <strong>
          {streak} day streak
        </strong>
      </div>
    </div>
  );
}

export default Dashboard;