import { useState } from 'react';
import Sidebar from '../components/layouts/sidebar.component';
import TaskModal from '../components/modals/tasks-modal.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import ConfirmModal from '../components/modals/confirmation-modal.component';
import { TasksSkeleton } from '../components/skeletons/task.skeleton';
import { useTasksPage } from '../hooks/use-task-loading.hook';
import { getErrorMessage } from '../utils/error-handler.util';

import {
  PRIORITY_COLORS,
  getPriorityLabel,
} from '../utils/validation.util';

import { 
  formatTaskDate,
} from '../utils/date.util.js';

import {
  FaCheck,
  FaUndo,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';

import '../styles/tasks.css';

function TasksPage() {
  const [search, setSearch] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [taskError, setTaskError] = useState(''); 

  const {
    pendingTasks,
    completedTasks,
    loading,
    error,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
    refetch,
  } = useTasksPage(search);

  // ─── Utility Functions ───────────────────────────────────────────────────

  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const normalizeTaskDate = (task) => {
    const dateString = task.created_at || task.createdAt || task.updated_at || task.updatedAt;
    if (!dateString) return new Date(0);
    return normalizeDate(new Date(dateString));
  };

  const today = normalizeDate(new Date());

  // ─── Modal Handlers ──────────────────────────────────────────────────────

  const openTaskModal = (task = null) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
    setTaskError(''); // ✅ Clear any previous errors
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setSelectedTask(null);
    setTaskError(''); // ✅ Clear errors on close
  };

  // ─── Task Action Handlers ────────────────────────────────────────────────

  const handleCreateTask = async (taskData) => {
    setTaskError(''); // ✅ Clear previous errors
    try {
      await addTask({ ...taskData, completed: false });
      closeTaskModal();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setTaskError(errorMsg); // ✅ Show error to user
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    setTaskError(''); // ✅ Clear previous errors
    try {
      await updateTaskData(taskId, updates);
      closeTaskModal();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setTaskError(errorMsg); // ✅ Show error to user
    }
  };

  // ─── Confirmation Modal Engine ───────────────────────────────────────────

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

  // ─── Task Status Handlers ────────────────────────────────────────────────

  const onToggle = async (task) => {
    if (task.completed) {
      askConfirm('Are you sure you want to undo this completed task?', async () => {
        await toggleTask(task);
      });
      return;
    }

    const taskDate = normalizeTaskDate(task);
    if (taskDate > today) {
      askConfirm('This task is scheduled for a future date. Mark it as completed anyway?', async () => {
        await toggleTask(task);
      });
      return;
    }

    await toggleTask(task);
  };

  const onEdit = (task) => {
    if (!task || task.completed) return;
    openTaskModal(task);
  };

  const onDelete = (task) => {
    askConfirm('Are you sure you want to delete this task?', async () => {
      await removeTask(task.task_id || task.id);
    });
  };

  // ─── Render Task Card ────────────────────────────────────────────────────

  const renderTaskCard = (task) => {
    const taskId = task.task_id || task.id;
    const priorityKey = String(task.priority || 'low').toLowerCase();

    return (
      <div
        className="modern-task-card"
        key={taskId}
        onClick={() => setDetailTask(task)}
      >
        <div className="task-card-top">
          <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
          
          <span
            className={`priority ${priorityKey}`}
            style={{ color: PRIORITY_COLORS[priorityKey] || PRIORITY_COLORS.low }}
          >
            {getPriorityLabel(task.priority)}
          </span>
        </div>

        <div className="task-card-body">
          <p className={task.completed ? 'completed' : ''}>
            {task.description || 'No description available.'}
          </p>
          
          <small className="task-date">
            Created: {formatTaskDate(task.created_at || task.createdAt || new Date(), 'short')}
          </small>
        </div>

        <div className="task-card-bottom">
          <button
            className="btn complete-btn"
            type="button"
            title={task.completed ? 'Undo' : 'Complete'}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task);
            }}
          >
            {task.completed ? <FaUndo /> : <FaCheck />}
          </button>
          
          <button
            className="btn edit-btn"
            type="button"
            title="Edit Task"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            disabled={task.completed}
          >
            <FaEdit />
          </button>
          
          <button
            className="btn delete-btn"
            type="button"
            title="Delete Task"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  // ─── Early Render for Loading skeletons ──────────────────────────────────

  if (loading) {
    return (
      <div className="tasks-layout">
        <Sidebar />
        <TasksSkeleton />
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────────

  return (
    <div className="tasks-layout">
      <Sidebar />
      <main className="tasks-main">
        
        {error && (
          <div className="error-banner" role="alert">
            <div className="error-content">
              <p>{error}</p>
              <button
                className="btn secondary"
                type="button"
                onClick={refetch}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="tasks-header">
          <div className="header-content">
            <h1>Tasks</h1>
            <p>Manage your productivity workflow.</p>
            
            <div className="tasks-controls">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button
                className="btn primary"
                type="button"
                onClick={() => openTaskModal(null)}
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>

        <div className="tasks-container">
          <div className="kanban-board">
            
            {/* Pending Tasks Column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <h3>Pending</h3>
                <span className="count-badge">{pendingTasks.length}</span>
              </div>
              <div className="kanban-tasks">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => renderTaskCard(task))
                ) : (
                  <div className="empty-state">
                    <p>No pending tasks.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Tasks Column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <h3>Completed</h3>
                <span className="count-badge">{completedTasks.length}</span>
              </div>
              <div className="kanban-tasks">
                {completedTasks.length > 0 ? (
                  completedTasks.map((task) => renderTaskCard(task))
                ) : (
                  <div className="empty-state">
                    <p>No completed tasks.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ✅ Single Unified Task Modal with Error Display */}
          <TaskModal
            isOpen={taskModalOpen}
            onClose={closeTaskModal}
            task={selectedTask}
            onCreate={handleCreateTask}
            onUpdate={handleUpdateTask}
            error={taskError} // ✅ Pass error to modal
          />
          
          <TaskDetailModal
            isOpen={Boolean(detailTask)}
            onClose={() => setDetailTask(null)}
            task={detailTask}
          />
          
          <ConfirmModal
            isOpen={confirmOpen}
            message={confirmMessage}
            onClose={closeConfirm}
            onConfirm={handleConfirm}
          />
        </div>
      </main>
    </div>
  );
}

export default TasksPage;