import { useState } from 'react';
import Sidebar from '../components/layouts/sidebar.component';
import CreateModal from '../components/modals/create-tasks-modal.component';
import EditModal from '../components/modals/edit-tasks-modal.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import ConfirmModal from '../components/modals/confirmation-modal.component';
import { TasksSkeleton } from '../components/skeletons/task.skeleton';
import { useTasksPage } from '../hooks/use-task-loading.hook';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

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

  // Utility functions for date normalization (same as CalendarPage)
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

  // Task Actions Handlers
  const handleCreateTask = async (taskData) => {
    try {
      await addTask({ ...taskData, completed: false });
      setIsCreateOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTaskData(taskId, updates);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Confirmation Modal Engine Setup
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
    setEditingTask(task);
  };

  const closeEditModal = () => setEditingTask(null);
  const closeDetailModal = () => setDetailTask(null);

  const onDelete = (task) => {
    askConfirm('Are you sure you want to delete this task?', async () => {
      await removeTask(task.task_id || task.id);
    });
  };

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

  // Early Render for Loading skeletons
  if (loading) {
    return (
      <div className="tasks-layout">
        <Sidebar />
        <TasksSkeleton />
      </div>
    );
  }

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
                onClick={() => setIsCreateOpen(true)}
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

          {/* Modals Containers Layout */}
          <CreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateTask}
          />
          
          <EditModal
            isOpen={Boolean(editingTask)}
            onClose={closeEditModal}
            task={editingTask}
            onUpdate={handleUpdateTask}
          />
          
          <TaskDetailModal
            isOpen={Boolean(detailTask)}
            onClose={closeDetailModal}
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