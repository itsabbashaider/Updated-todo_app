import { useMemo, useEffect } from 'react';
import { useTasks } from './use-task.hook';
import { useLoading } from './use-loading.hook';
import { organizeTasksByStatus } from '../utils/validation.util';

export function useTasksPage(search = '') {
  const { startLoading, stopLoading } = useLoading();

  // ✅ TanStack Query - automatic caching, deduplication, refetching
  const filters = useMemo(() => ({ search }), [search]);
  const { tasks, loading, error, addTask, removeTask, toggleTask, updateTaskData, refetch } = useTasks(filters);

  // Sync with global loading context
  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  // Organize tasks by status
  const { pendingTasks, completedTasks } = useMemo(() => {
    const { pending = [], completed = [] } = organizeTasksByStatus(tasks || []);
    return { pendingTasks: pending, completedTasks: completed };
  }, [tasks]);

  return {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
    refetch,
  };
}