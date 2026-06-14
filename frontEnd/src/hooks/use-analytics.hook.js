import { useEffect, useState } from "react";

import { getAnalytics } from "../services/analytics.service";
import { useLoading } from "./use-loading.hook";

export const useAnalytics = (range = 7) => {
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const { startLoading, stopLoading } = useLoading();

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        startLoading();
        setLoading(true);

        const response = await getAnalytics(range);

        setAnalytics(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        stopLoading();
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range, startLoading, stopLoading]);

  return {
    analytics,
    loading,
    error,
  };
};
