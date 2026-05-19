import { useState } from 'react';

import Sidebar from '../components/layouts/sidebar.component';

import { useTasks } from '../hooks/use-task.hook';
import '../styles/tasks.css';

import CreateModal from '../components/modals/create-tasks-modal.component';
import EditModal from '../components/modals/edit-tasks-modal.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import ConfirmModal from '../components/modals/confirmation-modal.component';

function TasksPage() {
  const {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
  } = useTasks();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // =========================
  // FILTER TASKS
  // =========================

  const filteredTasks = tasks.filter((task) =>
    task.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================
  // PRIORITY ORDER
  // =========================

  const getPriorityValue = (priority) => {
    const value = String(priority).toLowerCase();

    // HIGH
    if (value === 'high') {
      return 1;
    }

    // MID / MEDIUM
    if (
      value === 'mid' ||
      value === 'medium'
    ) {
      return 2;
    }

    // LOW
    if (value === 'low') {
      return 3;
    }

    // UNKNOWN
    return 99;
  };

  // =========================
  // PENDING TASKS
  // =========================

  const pendingTasks = [...filteredTasks]
    .filter((task) => !task.completed)
    .sort((a, b) => {
      return (
        getPriorityValue(a.priority) -
        getPriorityValue(b.priority)
      );
    });

  // =========================
  // COMPLETED TASKS
  // =========================

  const completedTasks = [...filteredTasks]
    .filter((task) => task.completed)
    .sort((a, b) => {
      // PRIORITY FIRST
      const priorityCompare =
        getPriorityValue(a.priority) -
        getPriorityValue(b.priority);

      if (priorityCompare !== 0) {
        return priorityCompare;
      }

      // NEWEST COMPLETED FIRST
      const dateA = new Date(
        a.updated_at ||
          a.updatedAt ||
          a.completed_at ||
          a.created_at ||
          0
      );

      const dateB = new Date(
        b.updated_at ||
          b.updatedAt ||
          b.completed_at ||
          b.created_at ||
          0
      );

      return dateB - dateA;
    });

  // =========================
  // CREATE TASK
  // =========================

  const handleCreateTask = async (taskData) => {
    await addTask({
      ...taskData,
      completed: false,
    });
  };

  // =========================
  // UPDATE TASK
  // =========================

  const handleUpdateTask = async (
    taskId,
    updates
  ) => {
    await updateTaskData(taskId, updates);
  };

  // =========================
  // CONFIRM MODAL
  // =========================

  const askConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    await confirmAction();
    closeConfirm();
  };

  // =========================
  // TOGGLE TASK
  // =========================

// =========================
// TOGGLE TASK
// =========================

  const onToggle = (task) => {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const taskDate = new Date(

      task.created_at ||

      task.createdAt ||

      task.updated_at ||

      task.updatedAt ||

      new Date()

    );

    taskDate.setHours(
      0,
      0,
      0,
      0
    );

    // UNDO COMPLETED TASK

    if (task.completed) {

      askConfirm(
        'Are you sure you want to undo this completed task?',
        () => toggleTask(task)
      );

      return;

    }

    // FUTURE TASK CONFIRMATION

    if (taskDate > today) {

      askConfirm(
        'This task is scheduled for a future date. Mark it as completed anyway?',
        () => toggleTask(task)
      );

      return;

    }

    // NORMAL COMPLETE

    toggleTask(task);

  };

  // =========================
  // EDIT TASK
  // =========================

  const onEdit = (task) => {
    if (!task || task.completed) return;

    setEditingTask(task);
  };

  const closeEditModal = () => {
    setEditingTask(null);
  };

  // =========================
  // DELETE TASK
  // =========================

  const onDelete = (task) => {
    askConfirm(
      'Are you sure you want to delete this task?',
      () => removeTask(task.task_id)
    );
  };

  // =========================
  // TASK DETAILS
  // =========================

  const onViewDetail = (task) => {
    setDetailTask(task);
  };

  const closeDetailModal = () => {
    setDetailTask(null);
  };

  // =========================
  // TASK CARD
  // =========================

  const renderTaskCard = (task) => (
    <div
      className="modern-task-card"
      key={task.task_id}
      onClick={() => onViewDetail(task)}
    >
      <div className="task-card-top">
        <h3
          className={
            task.completed ? 'completed' : ''
          }
        >
          {task.title}
        </h3>

        <span
          className={`priority ${String(
            task.priority
          ).toLowerCase()}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="task-card-body">
        <p
          className={
            task.completed ? 'completed' : ''
          }
        >
          {task.description ||
            'No description available.'}
        </p>

        <small className="task-date">
          Created:{' '}
          {new Date(
            task.created_at || task.createdAt
          ).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </small>
      </div>

      <div className="task-card-bottom">
        <button
          className="btn complete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
        >
          {task.completed ? '↩' : '✓'}
        </button>

        <button
          className="btn edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          disabled={task.completed}
        >
          ✎
        </button>

        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="tasks-layout">
      <Sidebar />

      <main className="tasks-main">
        <div className="tasks-header">
          <div>
            <h1>Tasks</h1>

            <p>
              Manage your productivity
              workflow.
            </p>
          </div>
        </div>

        <div className="tasks-controls">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            className="btn primary"
            type="button"
            onClick={() =>
              setIsCreateOpen(true)
            }
          >
            New Task
          </button>
        </div>

        <div className="kanban-board">
          {/* PENDING */}
          <div className="kanban-column">
            <div className="kanban-header">
              <h3>Pending</h3>

              <span>
                {pendingTasks.length}
              </span>
            </div>

            <div className="kanban-tasks">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) =>
                  renderTaskCard(task)
                )
              ) : (
                <div className="empty-state">
                  <p>No pending tasks.</p>
                </div>
              )}
            </div>
          </div>

          {/* COMPLETED */}
          <div className="kanban-column">
            <div className="kanban-header">
              <h3>Completed</h3>

              <span>
                {completedTasks.length}
              </span>
            </div>

            <div className="kanban-tasks">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) =>
                  renderTaskCard(task)
                )
              ) : (
                <div className="empty-state">
                  <p>No completed tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CREATE */}
        <CreateModal
          isOpen={isCreateOpen}
          onClose={() =>
            setIsCreateOpen(false)
          }
          onCreate={handleCreateTask}
        />

        {/* EDIT */}
        <EditModal
          isOpen={Boolean(editingTask)}
          onClose={closeEditModal}
          task={editingTask}
          onUpdate={handleUpdateTask}
        />

        {/* DETAILS */}
        <TaskDetailModal
          isOpen={Boolean(detailTask)}
          onClose={closeDetailModal}
          task={detailTask}
        />

        {/* CONFIRM */}
        <ConfirmModal
          isOpen={confirmOpen}
          message={confirmMessage}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
        />
      </main>
    </div>
  );
}

export default TasksPage;