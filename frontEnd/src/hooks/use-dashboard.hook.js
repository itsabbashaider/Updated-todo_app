import {
  useEffect,
  useState,
} from 'react';

import { getDashboard } from '../services/dashboard.service';

export function useDashboard() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard =
      async () => {
        try {
          setLoading(true);

          const res =
            await getDashboard();

          if (!mounted) return;

          setDashboard(
            res.data.data
          );

          setError('');
        } catch (err) {
          if (!mounted) return;

          setError(
            err.response?.data
              ?.message ||
              'Failed to load dashboard'
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    dashboard,
    loading,
    error,
  };
}