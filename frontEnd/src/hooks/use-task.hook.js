import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from '../services/task.service';
import { validateTaskInput } from '../utils/validation.util';

const defaultFilters = {
  page: 1,
  limit: 20,
  status: null,
  sort: 'priority',
};

export function useTasks(filters = defaultFilters) {
  const queryClient = useQueryClient();

  const normalizedFilters = {
    page: filters?.page ?? defaultFilters.page,
    limit: filters?.limit ?? defaultFilters.limit,
    status: filters?.status ?? null,
    search: filters?.search ?? '',
    sort: filters?.sort ?? defaultFilters.sort,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Invalidate all task-related queries
  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ FIXED: Now includes analytics invalidation
  const invalidateTaskRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] }); // ✅ Added: Refresh all analytics (any range)
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH QUERY
  // ═══════════════════════════════════════════════════════════════════════════

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', normalizedFilters],
    queryFn: async () => {
      const response = await getTasks(normalizedFilters);
      return {
        tasks: response.data?.data || [],
        pagination: response.data?.pagination || {},
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination ?? {};

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE MUTATION
  // ═══════════════════════════════════════════════════════════════════════════

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      const validation = validateTaskInput(taskData);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      const response = await createTask(taskData);
      return response.data?.task || response.data?.data || response;
    },
    onSuccess: () => {
      // ✅ Invalidate tasks, dashboard, and analytics
      invalidateTaskRelatedQueries();
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE MUTATION
  // ═══════════════════════════════════════════════════════════════════════════

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, data }) => {
      const response = await updateTask(taskId, data);
      return response.data?.data || response;
    },
    onSuccess: () => {
      // ✅ Invalidate tasks, dashboard, and analytics
      invalidateTaskRelatedQueries();
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE MUTATION
  // ═══════════════════════════════════════════════════════════════════════════

  const deleteMutation = useMutation({
    mutationFn: async (taskId) => {
      await deleteTask(taskId);
      return taskId;
    },
    onSuccess: () => {
      // ✅ Invalidate tasks, dashboard, and analytics
      invalidateTaskRelatedQueries();
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE MUTATION
  // ═══════════════════════════════════════════════════════════════════════════

  const toggleMutation = useMutation({
    mutationFn: async (task) => {
      const newStatus = !task.completed;
      await updateTask(task.task_id, { completed: newStatus });
      return newStatus;
    },
    onSuccess: () => {
      // ✅ Invalidate tasks, dashboard, and analytics
      // This refreshes analytics when user completes/uncompletes a task
      invalidateTaskRelatedQueries();
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WRAPPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const addTask = (taskData) => createMutation.mutate(taskData);
  const updateTaskData = (taskId, data) => updateMutation.mutate({ taskId, data });
  const removeTask = (taskId) => deleteMutation.mutate(taskId);
  const toggleTask = (task) => toggleMutation.mutate(task);

  return {
    tasks,
    loading: isLoading,
    error: error?.message || '',
    pagination,
    addTask,
    updateTaskData,
    removeTask,
    toggleTask,
    refetch,
  };
}