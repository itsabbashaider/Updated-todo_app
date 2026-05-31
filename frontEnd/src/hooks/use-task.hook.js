import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from '../services/task.service';

// ─── Stable Default Filters ──────────────────────────────────────────────────
const defaultFilters = {};

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useTasks(
  filters = defaultFilters
) {
  // ─── State ────────────────────────────────────────────────────────────────
  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // ─── Fetch Tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(
    async (
      customFilters = filters
    ) => {
      try {
        setLoading(true);

        const res = await getTasks(
          customFilters
        );

        setTasks(
          res.data.data || []
        );

        setError('');
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            'Failed to fetch tasks'
        );
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // ─── Load Tasks ───────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadTasks =
      async () => {
        try {
          setLoading(true);

          const res =
            await getTasks(
              filters
            );

          if (!mounted) {
            return;
          }

          setTasks(
            res.data.data || []
          );

          setError('');
        } catch (err) {
          if (!mounted) {
            return;
          }

          setError(
            err.response?.data
              ?.message ||
              'Failed to fetch tasks'
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadTasks();

    return () => {
      mounted = false;
    };
  }, [filters]);

  // ─── Add Task ─────────────────────────────────────────────────────────────
  const addTask = async (
    taskData
  ) => {
    const optimisticTask = {
      ...taskData,

      task_id:
        crypto.randomUUID(),

      completed:
        taskData.completed ??
        false,

      created_at:
        new Date().toISOString(),
    };

    // ─── Optimistic Update ──────────────────────────────────────────────────
    setTasks((prev) => [
      optimisticTask,
      ...prev,
    ]);

    try {
      const res =
        await createTask(
          taskData
        );

      const savedTask =
        res.data.task ||
        res.data.data;

      setTasks((prev) =>
        prev.map((task) =>
          task.task_id ===
          optimisticTask.task_id
            ? savedTask
            : task
        )
      );

      setError('');
    } catch (err) {
      // ─── Rollback ─────────────────────────────────────────────────────────
      setTasks((prev) =>
        prev.filter(
          (task) =>
            task.task_id !==
            optimisticTask.task_id
        )
      );

      setError(
        err.response?.data
          ?.message ||
          'Create failed'
      );
    }
  };

  // ─── Update Task ──────────────────────────────────────────────────────────
  const updateTaskData =
    async (taskId, data) => {
      const previousTasks = [
        ...tasks,
      ];

      // ─── Optimistic Update ───────────────────────────────────────────────
      setTasks((prev) =>
        prev.map((task) =>
          task.task_id ===
          taskId
            ? {
                ...task,
                ...data,
              }
            : task
        )
      );

      try {
        await updateTask(
          taskId,
          data
        );

        setError('');
      } catch (err) {
        // ─── Rollback ──────────────────────────────────────────────────────
        setTasks(
          previousTasks
        );

        setError(
          err.response?.data
            ?.message ||
            'Update failed'
        );
      }
    };

  // ─── Remove Task ──────────────────────────────────────────────────────────
  const removeTask = async (
    taskId
  ) => {
    const previousTasks = [
      ...tasks,
    ];

    // ─── Optimistic Update ────────────────────────────────────────────────
    setTasks((prev) =>
      prev.filter(
        (task) =>
          task.task_id !==
          taskId
      )
    );

    try {
      await deleteTask(
        taskId
      );

      setError('');
    } catch (err) {
      // ─── Rollback ───────────────────────────────────────────────────────
      setTasks(
        previousTasks
      );

      setError(
        err.response?.data
          ?.message ||
          'Delete failed'
      );
    }
  };

  // ─── Toggle Task ──────────────────────────────────────────────────────────
  const toggleTask = async (
    task
  ) => {
    const updatedTask = {
      completed:
        !task.completed,

      completed_at:
        !task.completed
          ? new Date().toISOString()
          : null,
    };

    const previousTasks = [
      ...tasks,
    ];

    // ─── Optimistic Update ────────────────────────────────────────────────
    setTasks((prev) =>
      prev.map((item) =>
        item.task_id ===
        task.task_id
          ? {
              ...item,
              ...updatedTask,
            }
          : item
      )
    );

    try {
      await updateTask(
        task.task_id,
        updatedTask
      );

      setError('');
    } catch (err) {
      // ─── Rollback ───────────────────────────────────────────────────────
      setTasks(
        previousTasks
      );

      setError(
        err.response?.data
          ?.message ||
          'Toggle failed'
      );
    }
  };

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    tasks,

    loading,

    error,

    fetchTasks,

    addTask,

    updateTaskData,

    removeTask,

    toggleTask,
  };
}