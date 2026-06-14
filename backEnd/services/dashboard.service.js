const { sequelize, Sequelize } = require("../models");
const { buildDashboardResponse } = require("../utils/dashboard.util");
const { getRequestUserId } = require("../utils/request.util");

const DASHBOARD_QUERY = `
  WITH user_tasks AS (
    SELECT
      task_id,
      title,
      description,
      priority,
      category,
      tags,
      completed,
      created_at,
      updated_at,
      due_date,
      completed_at
    FROM tasks
    WHERE user_id = :userId
  ),
  stats AS (
    SELECT
      COUNT(*)::int AS total_count,
      COUNT(*) FILTER (WHERE completed = true)::int AS completed_count,
      COUNT(*) FILTER (WHERE completed = false)::int AS pending_count,
      COUNT(*) FILTER (WHERE LOWER(priority) = 'high')::int AS high_priority_count,
      COUNT(*) FILTER (WHERE LOWER(priority) = 'medium')::int AS medium_priority_count,
      COUNT(*) FILTER (WHERE LOWER(priority) = 'low')::int AS low_priority_count,
      COALESCE(
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE completed = true) / NULLIF(COUNT(*), 0)
        ),
        0
      )::int AS completion_rate
    FROM user_tasks
  ),
  peak_hour AS (
    SELECT
      EXTRACT(HOUR FROM (completed_at AT TIME ZONE 'UTC'))::int AS peak_hour
    FROM user_tasks
    WHERE completed = true AND completed_at IS NOT NULL
    GROUP BY peak_hour
    ORDER BY COUNT(*) DESC, peak_hour ASC
    LIMIT 1
  ),
  recent_tasks AS (
    SELECT
      COALESCE(
        json_agg(to_jsonb(recent_task) ORDER BY recent_task.created_at DESC),
        '[]'::json
      ) AS recent_tasks
    FROM (
      SELECT
        task_id,
        title,
        description,
        priority,
        category,
        tags,
        completed,
        created_at,
        updated_at,
        due_date,
        completed_at
      FROM user_tasks
      ORDER BY created_at DESC
      LIMIT 5
    ) recent_task
  )
  SELECT
    stats.total_count,
    stats.completed_count,
    stats.pending_count,
    stats.high_priority_count,
    stats.medium_priority_count,
    stats.low_priority_count,
    stats.completion_rate,
    peak_hour.peak_hour,
    recent_tasks.recent_tasks
  FROM stats
  CROSS JOIN recent_tasks
  LEFT JOIN peak_hour ON true;
`;

exports.getDashboardData = async (req) => {
  const userId = getRequestUserId(req);
  const [row] = await sequelize.query(DASHBOARD_QUERY, {
    replacements: {
      userId,
    },
    type: Sequelize.QueryTypes.SELECT,
  });

  return buildDashboardResponse(row);
};
