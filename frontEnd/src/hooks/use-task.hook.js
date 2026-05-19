import { useEffect, useState } from "react";

import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../services/task.service";

export function useTasks() {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadTasks = async () => {
      try {
        setLoading(true);

        const res = await getTasks();

        if (!mounted) return;

        setTasks(res.data.data || []);

        setError("");
      } catch (err) {
        if (!mounted) return;

        setError(err.response?.data?.message || "Failed to fetch tasks");
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
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await getTasks();

      setTasks(res.data.data || []);

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {

    const optimisticTask = {

      ...taskData,

      task_id:
        crypto.randomUUID(),

      completed:
        taskData.completed ?? false,

    };

    // Optimistic UI
    setTasks((prev) => [
      optimisticTask,
      ...prev,
    ]);

    try {

      const res =
        await createTask(taskData);

      const savedTask =
        res.data.data;

      setTasks((prev) =>
        prev.map((task) =>

          task.task_id ===
          optimisticTask.task_id

            ? savedTask

            : task

        )
      );

      setError("");

    } catch (err) {

      // rollback
      setTasks((prev) =>
        prev.filter(
          (task) =>

            task.task_id !==
            optimisticTask.task_id
        )
      );

      setError(
        err.response?.data?.message ||
        "Create failed"
      );

    }

  };

  const updateTaskData = async (taskId, data) => {
    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === taskId ? { ...task, ...data } : task,
      ),
    );

    try {
      await updateTask(taskId, data);

      setError("");
    } catch (err) {
      setTasks(previousTasks);

      setError(err.response?.data?.message || "Update failed");
    }
  };

  const removeTask = async (taskId) => {
    const previousTasks = [...tasks];

    setTasks((prev) => prev.filter((task) => task.task_id !== taskId));

    try {
      await deleteTask(taskId);

      setError("");
    } catch (err) {
      setTasks(previousTasks);

      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleTask = async (task) => {
    const updatedTask = {
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null,
    };

    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((item) =>
        item.task_id === task.task_id
          ? {
              ...item,
              ...updatedTask,
            }
          : item,
      ),
    );

    try {
      await updateTask(task.task_id, updatedTask);

      setError("");
    } catch (err) {
      setTasks(previousTasks);

      setError(err.response?.data?.message || "Toggle failed");
    }
  };

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
