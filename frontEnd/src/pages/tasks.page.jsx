import {
  useState,
  useMemo,
} from 'react';

import Sidebar from '../components/layouts/sidebar.component';
import { useTasks } from '../hooks/use-task.hook';
import CreateModal from '../components/modals/create-tasks-modal.component';
import EditModal from '../components/modals/edit-tasks-modal.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import ConfirmModal from '../components/modals/confirmation-modal.component';

import {
  FaCheck,
  FaUndo,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';

import '../styles/tasks.css';

// ============================================================================
// TASKS PAGE COMPONENT
// ============================================================================

function TasksPage() {
  // =========================
  // STATE - SEARCH
  // =========================

  const [search, setSearch] = useState('');

  // =========================
  // STATE - MODALS
  // =========================

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // =========================
  // FILTERS
  // =========================

  const filters = useMemo(
    () => ({
      search,
    }),
    [search]
  );

  // =========================
  // TASKS HOOK
  // =========================

  const {
    tasks,
    loading,
    error,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
  } = useTasks(filters);

  // =========================
  // HELPER - PRIORITY VALUE
  // =========================

  const getPriorityValue = (priority) => {
    const value = String(priority).toLowerCase();

    if (value === 'high') {
      return 1;
    }

    if (value === 'mid' || value === 'medium') {
      return 2;
    }

    if (value === 'low') {
      return 3;
    }

    return 99;
  };

  // =========================
  // COMPUTED - PENDING TASKS
  // =========================

  const pendingTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => {
        return (
          getPriorityValue(a.priority) -
          getPriorityValue(b.priority)
        );
      });
  }, [tasks]);

  // =========================
  // COMPUTED - COMPLETED TASKS
  // =========================

  const completedTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.completed)
      .sort((a, b) => {
        const priorityCompare =
          getPriorityValue(a.priority) -
          getPriorityValue(b.priority);

        if (priorityCompare !== 0) {
          return priorityCompare;
        }

        const dateA = new Date(
          a.updated_at ||
            a.updatedAt ||
            a.completed_at ||
            a.completedAt ||
            a.created_at ||
            a.createdAt ||
            0
        );

        const dateB = new Date(
          b.updated_at ||
            b.updatedAt ||
            b.completed_at ||
            b.completedAt ||
            b.created_at ||
            b.createdAt ||
            0
        );

        return dateB - dateA;
      });
  }, [tasks]);

  // =========================
  // HANDLER - CREATE TASK
  // =========================

  const handleCreateTask = async (taskData) => {
    await addTask({
      ...taskData,
      completed: false,
    });

    setIsCreateOpen(false);
  };

  // =========================
  // HANDLER - UPDATE TASK
  // =========================

  const handleUpdateTask = async (taskId, updates) => {
    await updateTaskData(taskId, updates);
    setEditingTask(null);
  };

  // =========================
  // HANDLER - CONFIRMATION
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
    if (!confirmAction) {
      return;
    }

    await confirmAction();
    closeConfirm();
  };

  // =========================
  // HANDLER - TOGGLE TASK
  // =========================

  const onToggle = async (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(
      task.created_at ||
        task.createdAt ||
        task.updated_at ||
        task.updatedAt ||
        new Date()
    );
    taskDate.setHours(0, 0, 0, 0);

    // UNDO COMPLETED TASK
    if (task.completed) {
      askConfirm(
        'Are you sure you want to undo this completed task?',
        async () => {
          await toggleTask(task);
        }
      );
      return;
    }

    // FUTURE TASK WARNING
    if (taskDate > today) {
      askConfirm(
        'This task is scheduled for a future date. Mark it as completed anyway?',
        async () => {
          await toggleTask(task);
        }
      );
      return;
    }

    // NORMAL COMPLETE
    await toggleTask(task);
  };

  // =========================
  // HANDLER - EDIT TASK
  // =========================

  const onEdit = (task) => {
    if (!task || task.completed) {
      return;
    }

    setEditingTask(task);
  };

  const closeEditModal = () => {
    setEditingTask(null);
  };

  // =========================
  // HANDLER - DELETE TASK
  // =========================

  const onDelete = (task) => {
    askConfirm(
      'Are you sure you want to delete this task?',
      async () => {
        await removeTask(task.task_id);
      }
    );
  };

  // =========================
  // HANDLER - VIEW DETAIL
  // =========================

  const onViewDetail = (task) => {
    setDetailTask(task);
  };

  const closeDetailModal = () => {
    setDetailTask(null);
  };

  // =========================
  // RENDER - TASK CARD
  // =========================

  const renderTaskCard = (task) => (
    <div
      className="modern-task-card"
      key={task.task_id || task.id}
      onClick={() => onViewDetail(task)}
    >
      <div className="task-card-top">
        <h3 className={task.completed ? 'completed' : ''}>
          {task.title}
        </h3>

        <span
          className={`priority ${String(
            task.priority || 'low'
          ).toLowerCase()}`}
        >
          {task.priority || 'Low'}
        </span>
      </div>

      <div className="task-card-body">
        <p className={task.completed ? 'completed' : ''}>
          {task.description || 'No description available.'}
        </p>

        <small className="task-date">
          Created:{' '}
          {task.created_at || task.createdAt
            ? new Date(
                task.created_at || task.createdAt
              ).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'No date'}
        </small>
      </div>

      <div className="task-card-bottom">
        {/* COMPLETE */}
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

        {/* EDIT */}
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

        {/* DELETE */}
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

  // =========================
  // RENDER - LOADING
  // =========================

  if (loading) {
    return (
      <div className="tasks-layout">
        <Sidebar />

        <main className="tasks-main">
          <div className="tasks-container">
            <p>Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // RENDER - ERROR
  // =========================

  if (error) {
    return (
      <div className="tasks-layout">
        <Sidebar />

        <main className="tasks-main">
          <div className="tasks-container">
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // RENDER - MAIN UI
  // =========================

  return (
    <div className="tasks-layout">
      <Sidebar />

      <main className="tasks-main">
          {/* HEADER */}

          <div className="tasks-header">
            
            <div className="header-content">
              <h1>Tasks</h1>

              <p>Manage your productivity workflow.</p>
              <div className="tasks-controls">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="search-input"
                />

                <button
                  className="btn primary"
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <>
                    <FaPlus />
                    <span>New Task</span>
                  </>
                </button>
              </div>
            </div>
          </div>
        <div className="tasks-container">


          {/* BOARD */}

          <div className="kanban-board">
            {/* PENDING */}

            <div className="kanban-column">
              <div className="kanban-header">
                <h3>Pending</h3>

                <span>{pendingTasks.length}</span>
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

            {/* COMPLETED */}

            <div className="kanban-column">
              <div className="kanban-header">
                <h3>Completed</h3>

                <span>{completedTasks.length}</span>
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

          {/* CREATE MODAL */}

          <CreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateTask}
          />

          {/* EDIT MODAL */}

          <EditModal
            isOpen={Boolean(editingTask)}
            onClose={closeEditModal}
            task={editingTask}
            onUpdate={handleUpdateTask}
          />

          {/* DETAIL MODAL */}

          <TaskDetailModal
            isOpen={Boolean(detailTask)}
            onClose={closeDetailModal}
            task={detailTask}
          />

          {/* CONFIRM MODAL */}

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
