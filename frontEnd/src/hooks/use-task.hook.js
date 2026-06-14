import { useEffect, useState, useCallback } from 'react';
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // ✅ Normalize filters to prevent infinite loops
  const normalizedFilters = JSON.stringify({
    page: filters?.page ?? defaultFilters.page,
    limit: filters?.limit ?? defaultFilters.limit,
    status: filters?.status ?? null,
    search: filters?.search ?? '',
    sort: filters?.sort ?? defaultFilters.sort,
  });

  // ✅ Fetch on filter change
  useEffect(() => {
    let isMounted = true;

    const performFetch = async () => {
      try {
        console.log('📡 Fetching tasks with filters:', normalizedFilters);
        setLoading(true);

        const filterObj = JSON.parse(normalizedFilters);
        const res = await getTasks(filterObj);

        if (!isMounted) {
          console.log('Component unmounted, skipping state update');
          return;
        }

        console.log('✅ Got response:', res.data);
        setTasks(res.data.data || []);
        setPagination(res.data.pagination || {});
        setError('');
      } catch (err) {
        console.error('❌ Fetch error:', err);
        if (!isMounted) return;

        setError(err.response?.data?.message || 'Failed to fetch tasks');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    performFetch();

    return () => {
      isMounted = false;
    };
  }, [normalizedFilters]);

  // ─── Add Task ──────────────────────────────────────────────────────────────
  const addTask = useCallback(
    async (taskData) => {
      console.log('➕ Adding task:', taskData);

      const validation = validateTaskInput(taskData);
      if (!validation.isValid) {
        setError(validation.errors[0]);
        return;
      }

      const optimisticTask = {
        ...taskData,
        task_id: crypto.randomUUID(),
        completed: taskData.completed ?? false,
        created_at: new Date().toISOString(),
      };

      setTasks((prev) => [optimisticTask, ...prev]);

      try {
        const res = await createTask(taskData);
        const savedTask = res.data.task || res.data.data;

        console.log('✅ Task created:', savedTask);

        setTasks((prev) =>
          prev.map((task) =>
            task.task_id === optimisticTask.task_id ? savedTask : task
          )
        );

        setError('');
      } catch (err) {
        console.error('❌ Create task error:', err);
        setTasks((prev) =>
          prev.filter((task) => task.task_id !== optimisticTask.task_id)
        );
        setError(err.response?.data?.message || 'Failed to create task');
      }
    },
    []
  );

  // ─── Update Task ──────────────────────────────────────────────────────────
  const updateTaskData = useCallback(
    async (taskId, data) => {
      console.log('✏️ Updating task:', taskId, data);

      if (data.title !== undefined) {
        const currentTask = tasks.find((t) => t.task_id === taskId);
        const validation = validateTaskInput({ ...currentTask, ...data });
        if (!validation.isValid) {
          setError(validation.errors[0]);
          return;
        }
      }

      const previousTasks = [...tasks];

      setTasks((prev) =>
        prev.map((task) =>
          task.task_id === taskId ? { ...task, ...data } : task
        )
      );

      try {
        await updateTask(taskId, data);
        console.log('✅ Task updated');
        setError('');
      } catch (err) {
        console.error('❌ Update error:', err);
        setTasks(previousTasks);
        setError(err.response?.data?.message || 'Failed to update task');
      }
    },
    [tasks]
  );

  // ─── Remove Task ──────────────────────────────────────────────────────────
  const removeTask = useCallback(
    async (taskId) => {
      console.log('🗑️ Deleting task:', taskId);

      const previousTasks = [...tasks];
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId));

      try {
        await deleteTask(taskId);
        console.log('✅ Task deleted');
        setError('');
      } catch (err) {
        console.error('❌ Delete error:', err);
        setTasks(previousTasks);
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    },
    [tasks]
  );

  // ─── Toggle Task ──────────────────────────────────────────────────────────
  const toggleTask = useCallback(
    async (task) => {
      console.log('🔄 Toggling task:', task.task_id);

      const previousTasks = [...tasks];

      setTasks((prev) =>
        prev.map((item) =>
          item.task_id === task.task_id
            ? { ...item, completed: !item.completed }
            : item
        )
      );

      try {
        await updateTask(task.task_id, { completed: !task.completed });
        console.log('✅ Task toggled');
        setError('');
      } catch (err) {
        console.error('❌ Toggle error:', err);
        setTasks(previousTasks);
        setError(err.response?.data?.message || 'Failed to toggle task');
      }
    },
    [tasks]
  );

  // ─── Clear Error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(''), []);

  // ─── Refetch ────────────────────────────────────────────────────────────────
  const refetch = useCallback(() => {
    console.log('🔄 Refetching tasks');
    setLoading(true);

    const filterObj = JSON.parse(normalizedFilters);
    getTasks(filterObj)
      .then((res) => {
        setTasks(res.data.data || []);
        setPagination(res.data.pagination || {});
        setError('');
      })
      .catch((err) => {
        console.error('❌ Refetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch tasks');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [normalizedFilters]);

  return {
    tasks,
    loading,
    error,
    pagination,
    addTask,
    updateTaskData,
    removeTask,
    toggleTask,
    clearError,
    refetch,
  };
}