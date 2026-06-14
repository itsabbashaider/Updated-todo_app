import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboard.service";
import { useLoading } from "./use-loading.hook";

const EMPTY_DASHBOARD = {
  peakHour: null,
  recentTasks: [],
  stats: {
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    highPriorityCount: 0,
    mediumPriorityCount: 0,
    lowPriorityCount: 0,
    completionRate: 0,
  },
};

export function useDashboard() {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading]     = useState(true);         // ← NEW
  const [error, setError]         = useState("");

  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        startLoading();
        setLoading(true);                                     // ← NEW

        const res = await getDashboard();
        if (!mounted) return;

        const data = res?.data?.data || {};

        setDashboard({
          ...EMPTY_DASHBOARD,
          ...data,
          stats: { ...EMPTY_DASHBOARD.stats, ...data.stats },
          recentTasks: data.recentTasks || [],
        });

        setError("");
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Failed to load dashboard");
        setDashboard(EMPTY_DASHBOARD);
      } finally {
        stopLoading();
        if (mounted) setLoading(false);                      // ← NEW
      }
    };

    loadDashboard();
    return () => { mounted = false; };
  }, [startLoading, stopLoading]);

  return { dashboard, loading, error };                      // ← loading added here
}