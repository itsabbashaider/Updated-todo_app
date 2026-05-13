import { useState, useCallback, useEffect } from 'react';
import { getTasks, createTask, deleteTask, updateTask } from '../services/task.api';

// ─── Utilities ────────────────────────────────────────────────────────────────

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── Validation ───────────────────────────────────────────────────────────────

const validateTaskData = (taskData) => {
  // Title validation
  if (!taskData.title || !taskData.title.trim()) {
    return { isValid: false, message: 'Please enter a title for your task.' };
  }

  const titleLength = taskData.title.trim().length;

  if (titleLength < 3) {
    return {
      isValid : false,
      message : `Title must be at least 3 characters. You have ${titleLength}.`,
    };
  }

  if (titleLength > 100) {
    return {
      isValid : false,
      message : `Title must not exceed 100 characters. You have ${titleLength}.`,
    };
  }

  // Description validation
  if (!taskData.description || !taskData.description.trim()) {
    return { isValid: false, message: 'Please enter a description for your task.' };
  }

  return { isValid: true, message: '' };
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export function useTasks(selectedDate) {
  
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // ─── Fetch Tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(() => {
    return getTasks()
      .then((res) => {
        setTasks(res.data.data);
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
        setLoading(false);
      });
  }, []);

  // ─── Effect: Initial Fetch ────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    getTasks()
      .then((res) => {
        if (active) {
          setTasks(res.data.data);
          setError('');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Failed to fetch tasks');
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, []);

  // ─── Create Task ──────────────────────────────────────────────────────────
  const handleCreate = async (taskData, onSuccess) => {
    const titleMissing = !taskData.title?.trim();
    const descMissing  = !taskData.description?.trim();

    if (titleMissing || descMissing) {
      alert(
        titleMissing && descMissing
          ? 'Title and Description are required'
          : titleMissing
            ? 'Title is required'
            : 'Description is required'
      );
      return;
    }

    try {
      setLoading(true);
      await createTask(taskData);
      await fetchTasks();
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
      setLoading(false);
    }
  };

  // ─── Update Task ──────────────────────────────────────────────────────────
  const handleUpdate = async (task_id, data) => {
    try {
      await updateTask(task_id, data);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  // ─── Delete Task ──────────────────────────────────────────────────────────
  const handleDelete = async (task_id) => {
    try {
      await deleteTask(task_id);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  // ─── Toggle Complete ──────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    const updatedTask = {
      ...task,
      completed     : !task.completed,
      completed_at  : !task.completed ? new Date().toISOString() : null,
    };

    const previous = [...tasks];

    setTasks((prev) =>
      prev.map((t) => (t.task_id === task.task_id ? updatedTask : t))
    );

    try {
      await updateTask(task.task_id, {
        completed    : updatedTask.completed,
        completed_at : updatedTask.completed_at,
      });
      setError('');
    } catch {
      setTasks(previous);
      setError('Toggle failed');
    }
  };

  // ─── Filter Tasks ────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((task) => {
    if (!task.createdAt) return false;

    const today         = normalizeDate(new Date());
    const selected      = normalizeDate(selectedDate);
    const taskDate      = normalizeDate(task.createdAt);
    const completedDate = task.completed_at ? normalizeDate(task.completed_at) : null;

    if (task.completed && completedDate) {
      return completedDate.getTime() === selected.getTime();
    }

    const createdToday      = taskDate.getTime() === selected.getTime();
    const isViewingRealToday = selected.getTime() === today.getTime();
    const missedTask        =
      isViewingRealToday && !task.completed && taskDate.getTime() < today.getTime();

    return createdToday || missedTask;
  });

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    tasks,
    filteredTasks,
    loading,
    error,
    fetchTasks,
    validateTaskData,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggle,
  };
}