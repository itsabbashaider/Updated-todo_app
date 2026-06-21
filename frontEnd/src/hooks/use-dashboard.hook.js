import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboard.service';

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

// ✅ Get userId from localStorage or JWT token
// ✅ FIXED: Uses userId (camelCase) - matches storage.service.js
const getUserId = () => {
  try {
    // Option 1: From localStorage (matches saveUserData format)
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.userId || user.id;
    }
    
    // Option 2: From JWT token
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub;
    }
  } catch (error) {
    console.error('Failed to get userId:', error);
  }
  return null;
};

/**
 * TanStack Query version of useDashboard
 * ✅ FIXED: Includes userId in query key for user-specific caching
 * ✅ FIXED: Uses camelCase userId consistently
 */
export function useDashboard() {
  // ✅ Get current user ID
  const userId = useMemo(() => getUserId(), []);

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', userId], // ✅ Include userId for user-specific cache
    queryFn: async () => {
      const response = await getDashboard();
      
      // ✅ Handle both cleaned service response (direct data) and nested response
      const data = Array.isArray(response) 
        ? response[0] 
        : response?.data?.data || response || {};

      return {
        ...EMPTY_DASHBOARD,
        ...data,
        stats: { ...EMPTY_DASHBOARD.stats, ...data.stats },
        recentTasks: Array.isArray(data.recentTasks) ? data.recentTasks : [],
      };
    },
    staleTime: 1000 * 60 * 5,    // 5 minutes
    gcTime: 1000 * 60 * 10,      // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!userId, // ✅ Only fetch if userId exists
  });

  return {
    dashboard: dashboard || EMPTY_DASHBOARD,
    loading: isLoading,
    error: error?.message || '',
  };
}