import { useEffect, useState } from 'react';

import { getAnalytics } from '../services/analytics.service';

export const useAnalytics = (range = 7) => {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const response =
          await getAnalytics(range);

        setAnalytics(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  return {
    analytics,
    loading,
    error,
  };
};