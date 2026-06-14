import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../services/auth.service';

// Safely unwrap axios response — handles both response.data and response.data.data
const extractUser = (response) => {
  if (!response) return null;
  const data = response.data;
  // Some backends nest: { data: { user } } or { data: { email, ... } }
  if (data && typeof data === 'object') {
    // If there's a nested .data object that looks like a user, prefer it
    if (data.data && typeof data.data === 'object' && (data.data.email || data.data.id)) {
      return data.data;
    }
    // Otherwise use top-level data directly
    if (data.email || data.id || data.firstName) {
      return data;
    }
  }
  return data ?? null;
};

export const useProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCurrentUser();

        if (isMounted) {
          setUser(extractUser(response));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load profile');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentUser();
      setUser(extractUser(response));
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mutate - just calls refetch to update sidebar
  const mutate = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { user, loading, error, refetch, mutate };
};