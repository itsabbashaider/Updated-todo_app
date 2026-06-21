import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../services/analytics.service';

export const useAnalytics = (range = 7) => {

  const userId = useMemo(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      return user.userId || user.id || null;
    } catch (err) {
      console.error('Failed to extract userId:', err);
      return null;
    }
  }, []);

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', userId, range], 
    queryFn: async () => {
      const response = await getAnalytics(range);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!userId, 
  });

  return {
    analytics: analytics || null,
    loading: isLoading,
    error: error?.message || null,
  };
};