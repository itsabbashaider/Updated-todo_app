import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

// API
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../services/task.api";

// Components
import CreateModal from "../components/create.modal";
import EditModal from "../components/edit.modal";
import CalendarStrip from "../components/calender.modal";
import ConfirmModal from "../components/confirm.modal";
import TaskDetailModal from "../components/task.details.modal";

function Home() {
  const [tasks, setTasks] =
    useState([]);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(new Date());

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  const [
    isEditOpen,
    setIsEditOpen,
  ] = useState(false);

  const [
    selectedTask,
    setSelectedTask,
  ] = useState(null);

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);

  const [
    isDetailOpen,
    setIsDetailOpen,
  ] = useState(false);

  const [detailTask, setDetailTask] =
    useState(null);

  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res =
        await getTasks();

      setTasks(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTasks =
      async () => {
        try {
          setLoading(true);

          const res =
            await getTasks();

          if (isMounted) {
            setTasks(
              res.data.data
            );
          }
        } catch (err) {
          if (isMounted) {
            setError(
              err.response?.data
                ?.message ||
                "Failed to fetch tasks"
            );
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (
    taskData
  ) => {
    const titleMissing =
      !taskData.title?.trim();

    const descMissing =
      !taskData.description?.trim();

    if (
      titleMissing ||
      descMissing
    ) {
      alert(
        titleMissing && descMissing
          ? "Title and Description are required"
          : titleMissing
          ? "Title is required"
          : "Description is required"
      );

      return;
    }

    try {
      setLoading(true);

      await createTask(taskData);

      await fetchTasks();

      setSelectedDate(
        new Date()
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setIsCreateOpen(false);
    } catch {
      setError(
        "Create failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    id,
    data
  ) => {
    try {
      await updateTask(
        id,
        data
      );

      await fetchTasks();
    } catch {
      setError(
        "Update failed"
      );
    }
  };

  const handleDelete = async (
    id
  ) => {
    try {
      await deleteTask(id);

      await fetchTasks();
    } catch {
      setError(
        "Delete failed"
      );
    }
  };

  const handleToggle = async (
    task
  ) => {
    const updatedTask = {
      ...task,

      completed:
        !task.completed,

      completedAt:
        !task.completed
          ? new Date().toISOString()
          : null,
    };

    const previous = [...tasks];

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? updatedTask
          : t
      )
    );

    try {
      await updateTask(
        task.id,
        {
          completed:
            updatedTask.completed,

          completedAt:
            updatedTask.completedAt,
        }
      );
    } catch {
      setTasks(previous);

      setError(
        "Toggle failed"
      );
    }
  };

  const handleEdit = (task) => {
    if (
      !task ||
      task.completed
    ) {
      return;
    }

    setSelectedTask(task);

    setIsEditOpen(true);
  };

  /* =========================
     🔹 FILTER TASKS
  ========================= */
  const filteredTasks =
    tasks.filter((task) => {
      if (!task.createdAt) {
        return false;
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const selected =
        new Date(
          selectedDate
        );

      selected.setHours(
        0,
        0,
        0,
        0
      );

      const taskDate =
        new Date(
          task.createdAt
        );

      taskDate.setHours(
        0,
        0,
        0,
        0
      );

      const diffDays =
        (selected.getTime() -
          taskDate.getTime()) /
        (1000 *
          60 *
          60 *
          24);

      // created on selected day
      const createdToday =
        diffDays === 0;

      // ONLY show missed tasks on REAL current day
      const isViewingRealToday =
        selected.getTime() ===
        today.getTime();

      const missedTask =
        isViewingRealToday &&
        diffDays === 1 &&
        !task.completed;

      // completed today
      const completedToday =
        isViewingRealToday &&
        task.completed &&
        task.completedAt &&
        new Date(
          task.completedAt
        ).toDateString() ===
          selectedDate.toDateString();

      return (
        createdToday ||
        missedTask ||
        completedToday
      );
    });

  return (
    <div className="app-container">
      <h1 className="app-title">
        Todo App
      </h1>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <CalendarStrip
        selectedDate={
          selectedDate
        }
        setSelectedDate={
          setSelectedDate
        }
      />

      <div className="action-bar">
        <button
          type="button"
          className="btn primary"
          onClick={() =>
            setIsCreateOpen(true)
          }
          disabled={loading}
        >
          Create Task
        </button>

        <button
          type="button"
          className="dashboard-btn"
          onClick={() =>
            navigate(
              "/dashboard",
              {
                state: {
                  tasks,
                  selectedDate,
                },
              }
            )
          }
        >
          View Dashboard
        </button>
      </div>

      <div className="task-list">
        {loading ? (
          <p>Loading...</p>
        ) : filteredTasks.length ===
          0 ? (
          <p>
            No tasks for this day
          </p>
        ) : (
          filteredTasks.map(
            (task) => {
              const isMissed =
                new Date(
                  task.createdAt
                ).toDateString() !==
                  selectedDate.toDateString() &&
                !task.completed;

              return (
                <div
                  key={task.id}
                  className={`task-card ${
                    isMissed
                      ? "missed-task"
                      : ""
                  }`}
                  onClick={() => {
                    setDetailTask(
                      task
                    );

                    setIsDetailOpen(
                      true
                    );
                  }}
                >
                  {isMissed && (
                    <span className="missed-label">
                      MISSED
                    </span>
                  )}

                  {task.completed && (
                    <span className="completed-label">
                      COMPLETED
                    </span>
                  )}

                  <h3
                    className={
                      task.completed
                        ? "completed"
                        : ""
                    }
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p>
                      {task.description
                        .length >
                      80
                        ? `${task.description.slice(
                            0,
                            80
                          )}...`
                        : task.description}
                    </p>
                  )}

                  <div className="task-actions">
                    <button
                      type="button"
                      className="btn success"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        handleToggle(
                          task
                        );
                      }}
                    >
                      {task.completed
                        ? "↩"
                        : "✓"}
                    </button>

                    <button
                      type="button"
                      className="btn warning"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        handleEdit(
                          task
                        );
                      }}
                      disabled={
                        task.completed
                      }
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="btn danger"
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        setConfirmAction(
                          () => () =>
                            handleDelete(
                              task.id
                            )
                        );

                        setConfirmOpen(
                          true
                        );
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        onCreate={
          handleCreate
        }
      />

      <EditModal
        key={
          selectedTask?.id
        }
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);

          setSelectedTask(
            null
          );
        }}
        task={selectedTask}
        onUpdate={
          handleUpdate
        }
      />

      <ConfirmModal
        isOpen={confirmOpen}
        message="Are you sure you want to delete this task?"
        onClose={() =>
          setConfirmOpen(false)
        }
        onConfirm={() => {
          confirmAction?.();

          setConfirmOpen(false);
        }}
      />

      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);

          setDetailTask(null);
        }}
        task={detailTask}
      />
    </div>
  );
}

export default Home;