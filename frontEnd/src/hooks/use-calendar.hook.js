import { useMemo, useCallback, useEffect } from 'react';
import { useTasks } from './use-task.hook';
import { useLoading } from './use-loading.hook';

export function useCalendarPage(currentDate = new Date()) {
  const { startLoading, stopLoading } = useLoading();
  
  const filters = useMemo(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
      limit: 500,
    };
  }, [currentDate]);

  const {
    tasks,
    loading,
    error,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
  } = useTasks(filters);

  // Sync with global loading context
  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  const normalizeDate = useCallback((date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, []);

  const normalizeTaskDate = useCallback((task) => {
    const dateString = task.created_at || task.createdAt || task.updated_at || task.updatedAt;
    if (!dateString) return new Date(0);
    return normalizeDate(new Date(dateString));
  }, [normalizeDate]);

  const isSameDay = useCallback((date1, date2) => {
    return normalizeDate(date1).getTime() === normalizeDate(date2).getTime();
  }, [normalizeDate]);

  const getPriorityValue = useCallback((priority) => {
    const value = String(priority).toLowerCase();
    if (value === 'high') return 1;
    if (value === 'medium' || value === 'mid') return 2;
    return 3;
  }, []);

  const today = useMemo(() => normalizeDate(new Date()), [normalizeDate]);

  const isPastDate = useCallback((date) => {
    return normalizeDate(date).getTime() < today.getTime();
  }, [normalizeDate, today]);

  const getCurrentWeekRange = useCallback(() => {
    const todayDate = new Date();
    const day = todayDate.getDay();
    const diff = todayDate.getDate() - day;
    const weekStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), diff);
    const weekEnd = new Date(todayDate.getFullYear(), todayDate.getMonth(), diff + 6);
    return { start: normalizeDate(weekStart), end: normalizeDate(weekEnd) };
  }, [normalizeDate]);

  const currentWeek = useMemo(() => getCurrentWeekRange(), [getCurrentWeekRange]);

  const isCurrentWeekDay = useCallback((date) => {
    const normalized = normalizeDate(date);
    return (
      normalized.getTime() >= currentWeek.start.getTime() &&
      normalized.getTime() <= currentWeek.end.getTime()
    );
  }, [normalizeDate, currentWeek]);

  return {
    tasks,
    loading,
    error,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
    normalizeDate,
    normalizeTaskDate,
    isSameDay,
    getPriorityValue,
    today,
    isPastDate,
    isCurrentWeekDay,
  };
}