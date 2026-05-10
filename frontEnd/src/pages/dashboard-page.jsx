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

  console.log(
    JSON.stringify(
        tasks,
        null,
        2
      )
    );

  const selectedDate = new Date (
    state?.selectedDate ||
    new Date()
  );

  const selected =
    selectedDate.toDateString();

  /* =========================
     🔹 DAILY STATS
  ========================= */
  const todayTasks = tasks.filter(
    (task) => {
      const createdToday = 
      task.createdAt && 
      new Date(
        task.createdAt
      ).toDateString() ===
      selected;

      const completedToday = 
      task.completed && 
      task.completed_at &&
      new Date(
        task.completed_at
      ).toDateString() ===
      selected;
      
      const overdueTask =
      task.createdAt && 
      new Date(
        task.createdAt 
      ) < selectedDate && 
      !task.completed && 
      selectedDate.toDateString() ===
      new Date().toDateString();

      return (
        createdToday ||
        completedToday ||
        overdueTask
      );
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
  const weeklyData = [...Array(7)].map(
    (_, i) => {
      const d = new Date(
        selectedDate
      );

      d.setHours(0, 0, 0, 0);

      d.setDate(
        d.getDate() - (6 - i)
      );

      const count = tasks.filter(
        (t) => {
          if (
            !t.completed ||
            !t.completed_at
          ) {
            return false;
          }

          const completedDate =
            new Date(
              t.completed_at
            );

          completedDate.setHours(
            0,
            0,
            0,
            0
          );

          return (
            completedDate.toDateString() ===
            d.toDateString()
          );
        }
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
    }
  );

  /* =========================
     🔹 STREAK
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
          t.completed_at &&
          new Date(
            t.completed_at
          ).toDateString() ===
            dateStr
      );

    if (hasCompleted) {
      streak++;
    } else {
      break;
    }
  }

  /* =========================
     🔹 SCORE
  ========================= */
  const score =
    completionRate;

  return (
    <div className="app-container dashboard-page">
      {/* =========================
          HEADER
      ========================= */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p className="date">
            {selectedDate.toDateString()}
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="btn secondary"
            onClick={() =>
              navigate("/")
            }
          >
            Back
          </button>
        </div>
      </div>

      {/* =========================
          STATS
      ========================= */}
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

      {/* =========================
          PROGRESS BAR
      ========================= */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${completionRate}%`,
          }}
        />
      </div>

      {/* =========================
          WEEKLY ACTIVITY
      ========================= */}
      <h2 className="section-title">
        Weekly Activity
      </h2>

      <div className="chart-box">
        <ResponsiveContainer
          width="100%"
          height={280}
        >
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
              cursor="pointer"
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
      <div className="day-nav">
        <button
          className="btn secondary-btn"
          onClick={() => {
            const prev =
              new Date(
                selectedDate
              );

            prev.setDate(
              prev.getDate() - 1
            );

            navigate(
              "/dashboard",
              {
                state: {
                  tasks,
                  selectedDate:
                    prev,
                },
              }
            );
          }}
        >
          ← Prev
        </button>

        <button
          className="btn secondary-btn"
          onClick={() => {
            const next =
              new Date(
                selectedDate
              );

            next.setDate(
              next.getDate() + 1
            );

            navigate(
              "/dashboard",
              {
                state: {
                  tasks,
                  selectedDate:
                    next,
                },
              }
            );
          }}
        >
          Next →
        </button>
      </div>

      {/* =========================
          SCORE
      ========================= */}
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

      {/* =========================
          STREAK
      ========================= */}
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