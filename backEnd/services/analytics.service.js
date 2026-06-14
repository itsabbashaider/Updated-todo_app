const { sequelize, Sequelize } = require("../models");
const {
  buildAnalyticsResponse,
  parseAnalyticsRange,
} = require("../utils/analytics.util");
const { getRequestUserId } = require("../utils/request.util");

const ANALYTICS_QUERY = `
  WITH params AS (
    SELECT (NOW() AT TIME ZONE 'UTC')::date AS today
  ),
  user_tasks AS (
    SELECT
      task_id,
      priority,
      completed,
      created_at,
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
  completed_days AS (
    SELECT DISTINCT (completed_at AT TIME ZONE 'UTC')::date AS day
    FROM user_tasks
    WHERE completed = true AND completed_at IS NOT NULL
  ),
  streak_anchor AS (
    SELECT
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM completed_days cd, params p
          WHERE cd.day = p.today
        ) THEN (SELECT today FROM params)
        WHEN EXISTS (
          SELECT 1
          FROM completed_days cd, params p
          WHERE cd.day = p.today - 1
        ) THEN (SELECT today - 1 FROM params)
        ELSE NULL
      END AS anchor_day
  ),
  numbered_streak_days AS (
    SELECT
      cd.day,
      ROW_NUMBER() OVER (ORDER BY cd.day DESC) AS rn
    FROM completed_days cd
    CROSS JOIN streak_anchor sa
    WHERE sa.anchor_day IS NOT NULL
      AND cd.day <= sa.anchor_day
  ),
  streak_groups AS (
    SELECT
      day,
      day + (rn::int * INTERVAL '1 day') AS streak_group
    FROM numbered_streak_days
  ),
  current_streak AS (
    SELECT
      COALESCE(
        COUNT(*) FILTER (
          WHERE streak_group = (
            SELECT anchor_day + INTERVAL '1 day'
            FROM streak_anchor
          )
        ),
        0
      )::int AS streak
    FROM streak_groups
  ),
  date_range AS (
    SELECT generate_series(
      (SELECT today FROM params) - (:rangeDays * INTERVAL '1 day'),
      (SELECT today FROM params),
      '1 day'::interval
    )::date AS day
  ),
  daily_stats AS (
    SELECT
      (created_at AT TIME ZONE 'UTC')::date AS day,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE completed = true)::int AS completed
    FROM user_tasks
    WHERE created_at >= (
      ((SELECT today FROM params) - (:rangeDays * INTERVAL '1 day'))::timestamp AT TIME ZONE 'UTC'
    )
    GROUP BY (created_at AT TIME ZONE 'UTC')::date
  ),
  trend_data AS (
    SELECT
      COALESCE(
        json_agg(
          json_build_object(
            'date', dr.day::timestamp AT TIME ZONE 'UTC',
            'total', COALESCE(ds.total, 0),
            'completed', COALESCE(ds.completed, 0),
            'pending', COALESCE(ds.total, 0) - COALESCE(ds.completed, 0),
            'completionRate',
              CASE
                WHEN COALESCE(ds.total, 0) > 0
                  THEN ROUND(100.0 * COALESCE(ds.completed, 0) / ds.total)::int
                ELSE 0
              END
          )
          ORDER BY dr.day
        ),
        '[]'::json
      ) AS trend_data
    FROM date_range dr
    LEFT JOIN daily_stats ds ON ds.day = dr.day
  ),
  weekly_comparison AS (
    SELECT
      COUNT(*) FILTER (
        WHERE completed = true
          AND completed_at IS NOT NULL
          AND (completed_at AT TIME ZONE 'UTC')::date
            BETWEEN (SELECT today FROM params) - 6 AND (SELECT today FROM params)
      )::int AS current_week,
      COUNT(*) FILTER (
        WHERE completed = true
          AND completed_at IS NOT NULL
          AND (completed_at AT TIME ZONE 'UTC')::date
            BETWEEN (SELECT today FROM params) - 13 AND (SELECT today FROM params) - 7
      )::int AS last_week
    FROM user_tasks
  )
  SELECT
    stats.total_count,
    stats.completed_count,
    stats.pending_count,
    stats.high_priority_count,
    stats.medium_priority_count,
    stats.low_priority_count,
    stats.completion_rate,
    current_streak.streak,
    trend_data.trend_data,
    weekly_comparison.current_week,
    weekly_comparison.last_week
  FROM stats
  CROSS JOIN current_streak
  CROSS JOIN trend_data
  CROSS JOIN weekly_comparison;
`;

exports.getAnalytics = async (req, range = 7) => {
  const userId = getRequestUserId(req);
  const safeRange = parseAnalyticsRange(range);

  const [row] = await sequelize.query(ANALYTICS_QUERY, {
    replacements: {
      userId,
      rangeDays: safeRange - 1,
    },
    type: Sequelize.QueryTypes.SELECT,
  });

  return buildAnalyticsResponse(row);
};
