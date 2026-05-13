import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

// ─── Components ────────────────────────────────────────────────────────────
import TaskList from '../components/task-list.component';
import CreateModal from '../components/create-tasks-modal.component';
import EditModal from '../components/edit-tasks-modal.component';
import CalendarStrip from '../components/calendar-modal.component';
import ConfirmModal from '../components/confirmation-modal.component';
import TaskDetailModal from '../components/task-details-modal.component';
import ValidationErrorModal from '../components/validation-error-modal.component';
import ThemePresetSwitcher from '../components/theme-preset-switcher.component';

// ─── Home Page ────────────────────────────────────────────────────────────────
function Home() {
  
  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [isCreateOpen, setIsCreateOpen]   = useState(false);
  const [isEditOpen, setIsEditOpen]       = useState(false);
  const [selectedTask, setSelectedTask]   = useState(null);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isDetailOpen, setIsDetailOpen]   = useState(false);
  const [detailTask, setDetailTask]       = useState(null);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const navigate = useNavigate();

  const { tasks, filteredTasks, loading, error, handleCreate, handleUpdate, handleDelete, handleToggle, validateTaskData } =
    useTasks(selectedDate);

  // ─── Confirmation Helper ──────────────────────────────────────────────────
  const askConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  // ─── Card Handlers ────────────────────────────────────────────────────────
  const onToggle = (task) => {
    if (task.completed) {
      askConfirm('Are you sure you want to undo this completed task?', () =>
        handleToggle(task)
      );
    } else {
      handleToggle(task);
    }
  };

  const onEdit = (task) => {
    if (!task || task.completed) return;
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const onDelete = (task) => {
    askConfirm('Are you sure you want to delete this task?', () =>
      handleDelete(task.task_id)
    );
  };

  const onViewDetail = (task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      
      <div className="app-topbar">
        <div>
          <h1 className="app-title">Todo App</h1>

          <p className="current-date">
            {selectedDate.toLocaleDateString('en-US', {
              weekday : 'short',
              month   : 'short',
              day     : 'numeric',
              year    : 'numeric',
            })}
          </p>
        </div>

        <ThemePresetSwitcher />
      </div>

      {error && <div className="error-box">{error}</div>}

      <CalendarStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="action-bar">
        <button
          type="button"
          className="btn primary"
          onClick={() => setIsCreateOpen(true)}
          disabled={loading}
        >
          Create Task
        </button>

        <button
          type="button"
          className="dashboard-btn"
          onClick={() => navigate('/dashboard', { state: { tasks, selectedDate } })}
        >
          View Dashboard
        </button>
      </div>

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetail={onViewDetail}
      />

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(data) => {
          const validation = validateTaskData(data);

          if (!validation.isValid) {
            setValidationMessage(validation.message);
            setValidationOpen(true);
            return;
          }

          handleCreate(data, () => {
            setIsCreateOpen(false);
            setSelectedDate(new Date());
          });
        }}
      />

      {/* Edit Modal */}
      <EditModal
        key={selectedTask?.task_id}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onUpdate={handleUpdate}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        message={confirmMessage}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          confirmAction?.();
          setConfirmOpen(false);
        }}
      />

      {/* Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailTask(null);
        }}
        task={detailTask}
      />

      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={validationOpen}
        message={validationMessage}
        onClose={() => setValidationOpen(false)}
      />

    </div>
  );
}

export default Home;
