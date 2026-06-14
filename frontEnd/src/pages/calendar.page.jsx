import { useState } from 'react';
import Sidebar from '../components/layouts/sidebar.component';
import { useCalendarPage } from '../hooks/use-calendar.hook';
import CreateModal from '../components/modals/create-tasks-modal.component';
import EditModal from '../components/modals/edit-tasks-modal.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import ConfirmModal from '../components/modals/confirmation-modal.component';
import { CalendarSkeleton } from '../components/skeletons/calendar.skeleton';

import {
  FaCheck, FaUndo, FaEdit, FaTrash,
  FaChevronLeft, FaChevronRight, FaPlus, FaTasks,
} from 'react-icons/fa';

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    tasks,
    loading,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
    normalizeDate,
    normalizeTaskDate,
    isSameDay,
    getPriorityValue,
    today,
    isPastDate,
    isCurrentWeekDay,
  } = useCalendarPage(currentDate);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const calendarDays = Array.from({ length: startDay }, () => null).concat(
    Array.from({ length: totalDays }, (_, i) => new Date(currentYear, currentMonth, i + 1))
  );

  const selectedTasks = tasks
    .filter((task) => isSameDay(normalizeTaskDate(task), selectedDate))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityCompare = getPriorityValue(a.priority) - getPriorityValue(b.priority);
      if (priorityCompare !== 0) return priorityCompare;
      return normalizeTaskDate(b) - normalizeTaskDate(a);
    });

  const upcomingTasks = tasks
    .filter((task) => normalizeTaskDate(task) > today && !task.completed)
    .sort((a, b) => normalizeTaskDate(a) - normalizeTaskDate(b));

  if (loading) {
    return (
      <div className="calendar-layout">
        <Sidebar />
        <CalendarSkeleton />
      </div>
    );
  }

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

  const handleCreateTask = async (taskData) => {
    const taskDate = normalizeDate(selectedDate);
    const safeDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate(), 12, 0, 0);
    await addTask({
      title: taskData.title?.trim(),
      description: taskData.description?.trim(),
      priority: String(taskData.priority).toLowerCase(),
      completed: false,
      created_at: safeDate.toISOString(),
    });
    setIsCreateOpen(false);
  };

  const handleUpdateTask = async (taskId, updates) => {
    await updateTaskData(taskId, updates);
    setEditingTask(null);
  };

  const onToggle = async (task) => {
    const taskDate = normalizeTaskDate(task);
    if (task.completed) {
      askConfirm('Are you sure you want to undo this completed task?', async () => {
        await toggleTask(task);
      });
      return;
    }
    if (taskDate > today) {
      askConfirm('This task is scheduled for a future date. Mark it as completed anyway?', async () => {
        await toggleTask(task);
      });
      return;
    }
    await toggleTask(task);
  };

  const onDelete = (task) => {
    askConfirm('Are you sure you want to delete this task?', async () => {
      await removeTask(task.task_id);
    });
  };

  const onEdit = (task) => {
    if (task.completed) return;
    setEditingTask(task);
  };

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const scrollToTasks = () => {
    const element = document.getElementById('tasks-section');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderTaskCard = (task) => (
    <div key={task.task_id || task.id} className="calendar-task-card" onClick={() => setDetailTask(task)}>
      <div className="task-card-top">
        <h4 className={task.completed ? 'completed' : ''}>{task.title}</h4>
        <span className={`priority ${String(task.priority || 'low').toLowerCase()}`}>{task.priority || 'Low'}</span>
      </div>
      <p className={task.completed ? 'completed' : ''}>{task.description || 'No description'}</p>
      <small className="task-date">
        <strong>Created:</strong>{' '}
        {normalizeTaskDate(task).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </small>
      <div className="task-actions">
        <button type="button" className="btn complete-btn" onClick={(e) => { e.stopPropagation(); onToggle(task); }}>
          {task.completed ? <FaUndo /> : <FaCheck />}
        </button>
        <button type="button" className="btn edit-btn" disabled={task.completed} onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
          <FaEdit />
        </button>
        <button type="button" className="btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(task); }}>
          <FaTrash />
        </button>
      </div>
    </div>
  );

  return (
    <div className="calendar-layout">
      <Sidebar />
      <main className="calendar-main">
        <div className="calendar-header">
          <div>
            <h1>Calendar</h1>
            <p>Organize tasks by date.</p>
          </div>
        </div>

        <div className="calendar-container">
          <button type="button" className="floating-scroll-btn" onClick={scrollToTasks} title="Scroll to tasks">
            <FaTasks /><span>View Tasks</span>
          </button>

          <div className="calendar-controls">
            <button type="button" className="btn secondary" onClick={prevMonth}><FaChevronLeft /></button>
            <h2>{monthName} {currentYear}</h2>
            <button type="button" className="btn secondary" onClick={nextMonth}><FaChevronRight /></button>
          </div>

          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} className="calendar-empty" />;

              const tasksForDay = tasks.filter((task) => isSameDay(normalizeTaskDate(task), date));
              const taskCount = tasksForDay.length;
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const isPastDay = isPastDate(date);
              const isCurrentWeek = isCurrentWeekDay(date);

              return (
                <div
                  key={index}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPastDay ? 'past-day' : ''} ${isCurrentWeek ? 'current-week' : ''}`}
                  onClick={() => setSelectedDate(new Date(date))}
                >
                  <div className="calendar-day-top">
                    <span>{date.getDate()}</span>
                    {taskCount > 0 && <div className="task-count">{taskCount}</div>}
                  </div>

                  <div className="calendar-task-preview">
                    {tasksForDay.slice(0, 3).map((task) => (
                      <div key={task.task_id} className={`mini-task ${String(task.priority || 'low').toLowerCase()}`} title={task.title}>
                        {task.title}
                      </div>
                    ))}
                    {taskCount > 3 && <div className="more-tasks"><FaPlus />{taskCount - 3} more</div>}
                  </div>

                  {!isPastDay && (
                    <button
                      type="button"
                      className="calendar-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(new Date(date));
                        setTimeout(() => setIsCreateOpen(true), 0);
                      }}
                    >
                      <FaPlus />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div id="tasks-section" className="tasks-sections-grid">
            <div className="selected-date-section">
              <div className="selected-date-header">
                <h3>Tasks for {normalizeDate(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <span>{selectedTasks.length}</span>
              </div>
              <div className="selected-tasks-list">
                {selectedTasks.length > 0
                  ? selectedTasks.map((task) => renderTaskCard(task))
                  : <div className="empty-state"><p>No tasks for this day.</p></div>}
              </div>
            </div>

            <div className="upcoming-section">
              <div className="selected-date-header">
                <h3>Upcoming Tasks</h3>
                <span>{upcomingTasks.length}</span>
              </div>
              <div className="selected-tasks-list">
                {upcomingTasks.length > 0
                  ? upcomingTasks.map((task) => renderTaskCard(task))
                  : <div className="empty-state"><p>No upcoming tasks.</p></div>}
              </div>
            </div>
          </div>

          <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateTask} />
          <EditModal isOpen={Boolean(editingTask)} onClose={() => setEditingTask(null)} task={editingTask} onUpdate={handleUpdateTask} />
          <TaskDetailModal isOpen={Boolean(detailTask)} onClose={() => setDetailTask(null)} task={detailTask} />
          <ConfirmModal isOpen={confirmOpen} message={confirmMessage} onClose={closeConfirm} onConfirm={handleConfirm} />
        </div>
      </main>
    </div>
  );
}

export default CalendarPage;