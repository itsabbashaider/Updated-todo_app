// ─── src/pages/calendar.page.jsx ────────────────────────────────────────────

import { useState } from 'react';

import Sidebar from '../components/layouts/sidebar.component';

import { useTasks } from '../hooks/use-task.hook';

import CreateModal from '../components/modals/create-tasks-modal.component';
import EditModal from '../components/modals/edit-tasks-modal.component';
import TaskDetailModal from '../components/modals/task-details-modal.component';
import ConfirmModal from '../components/modals/confirmation-modal.component';

import '../styles/calendar.css';

function CalendarPage() {

  const {
    tasks,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
  } = useTasks();

  // ─── STATES ───────────────────────────────────────────────────────────────

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [detailTask, setDetailTask] =
    useState(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [confirmMessage, setConfirmMessage] =
    useState('');

  const [confirmAction, setConfirmAction] =
    useState(null);

  // ─── DATE HELPERS ─────────────────────────────────────────────────────────

  const normalizeDate = (date) => {

    const normalized =
      new Date(date);

    normalized.setHours(
      0,
      0,
      0,
      0
    );

    return normalized;

  };

  const normalizeTaskDate = (
    task
  ) => {

    const dateString =

      task.created_at ||

      task.createdAt ||

      task.updated_at ||

      task.updatedAt ||

      '1970-01-01';

    return normalizeDate(
      new Date(dateString)
    );

  };

  const isSameDay = (
    date1,
    date2
  ) => {

    return (

      normalizeDate(date1).getTime() ===

      normalizeDate(date2).getTime()

    );

  };

  // ─── PRIORITY ─────────────────────────────────────────────────────────────

  const getPriorityValue = (
    priority
  ) => {

    const value =
      String(priority)
        .toLowerCase();

    if (value === 'high') {
      return 1;
    }

    if (value === 'medium') {
      return 2;
    }

    return 3;

  };

  // ─── TODAY ────────────────────────────────────────────────────────────────

  const today =
    normalizeDate(new Date());

  const isPastDate = (
    date
  ) => {

    const compareDate =
      normalizeDate(date);

    return (

      compareDate.getTime() <

      today.getTime()

    );

  };

  // ─── CALENDAR VALUES ──────────────────────────────────────────────────────

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

  const firstDayOfMonth =
    new Date(
      currentYear,
      currentMonth,
      1
    );

  const lastDayOfMonth =
    new Date(
      currentYear,
      currentMonth + 1,
      0
    );

  const startDay =
    firstDayOfMonth.getDay();

  const totalDays =
    lastDayOfMonth.getDate();

  const monthName =
    currentDate.toLocaleString(
      'default',
      {
        month: 'long',
      }
    );

  // ─── CALENDAR DAYS ────────────────────────────────────────────────────────

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    calendarDays.push(

      new Date(
        currentYear,
        currentMonth,
        day
      )

    );

  }

  // ─── SELECTED TASKS ───────────────────────────────────────────────────────

  const selectedTasks =

    tasks

      .filter((task) => {

        const taskDate =
          normalizeTaskDate(task);

        return isSameDay(
          taskDate,
          selectedDate
        );

      })

      .sort((a, b) => {

        const priorityCompare =

          getPriorityValue(
            a.priority
          ) -

          getPriorityValue(
            b.priority
          );

        if (
          priorityCompare !== 0
        ) {

          return priorityCompare;

        }

        return (

          normalizeTaskDate(b) -

          normalizeTaskDate(a)

        );

      });

  // ─── UPCOMING TASKS ───────────────────────────────────────────────────────

  const upcomingTasks =

    tasks

      .filter((task) => {

        const taskDate =
          normalizeTaskDate(task);

        return (
          taskDate > today &&
          !task.completed
        );

      })

      .sort((a, b) => (

        normalizeTaskDate(a) -

        normalizeTaskDate(b)

      ));

  // ─── CONFIRM ──────────────────────────────────────────────────────────────

  const askConfirm = (
    message,
    action
  ) => {

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

  // ─── TASK ACTIONS ─────────────────────────────────────────────────────────

  const handleCreateTask = async (
    taskData
  ) => {

    const taskDate =
      normalizeDate(selectedDate);

    // noon avoids timezone rollback
    const safeDate = new Date(

      taskDate.getFullYear(),

      taskDate.getMonth(),

      taskDate.getDate(),

      12,
      0,
      0

    );

    await addTask({

      title:
        taskData.title?.trim(),

      description:
        taskData.description?.trim(),

      priority:
        String(
          taskData.priority
        ).toLowerCase(),

      completed:
        false,

      created_at:
        safeDate.toISOString(),

    });

    setIsCreateOpen(false);

  };

  const handleUpdateTask = async (
    taskId,
    updates
  ) => {

    await updateTaskData(
      taskId,
      updates
    );

  };

  const onToggle = (task) => {

    const taskDate = normalizeTaskDate(task);

    // Undo confirmation
    if (task.completed) {

      askConfirm(
        'Undo completed task?',
        () => toggleTask(task)
      );

      return;

    }

    // Future task confirmation
    if (taskDate > today) {

      askConfirm(
        'This task is scheduled for a future date. Mark it as completed anyway?',
        () => toggleTask(task)
      );

      return;

    }

    // Normal completion
    toggleTask(task);

  };

  const onDelete = (task) => {

    askConfirm(
      'Delete this task?',
      () => removeTask(task.task_id)
    );

  };

  const onEdit = (task) => {

    if (task.completed) return;

    setEditingTask(task);

  };

  // ─── MONTH NAVIGATION ─────────────────────────────────────────────────────

  const prevMonth = () => {

    setCurrentDate(

      new Date(
        currentYear,
        currentMonth - 1,
        1
      )

    );

  };

  const nextMonth = () => {

    setCurrentDate(

      new Date(
        currentYear,
        currentMonth + 1,
        1
      )

    );

  };

  // ─── TASK CARD ────────────────────────────────────────────────────────────

  const renderTaskCard = (task) => (

    <div
      key={task.task_id}
      className="calendar-task-card"
      onClick={() =>
        setDetailTask(task)
      }
    >

      <div className="task-card-top">

        <h4
          className={
            task.completed
              ? 'completed'
              : ''
          }
        >
          {task.title}
        </h4>

        <span
          className={`priority ${String(
            task.priority
          ).toLowerCase()}`}
        >
          {task.priority}
        </span>

      </div>

      <p
        className={
          task.completed
            ? 'completed'
            : ''
        }
      >
        {task.description ||
          'No description'}
      </p>

      <small className="task-date">

        <strong>Created:</strong>{' '}

        {normalizeTaskDate(task)
          .toLocaleDateString(
            'en-US',
            {
              month : 'short',
              day   : 'numeric',
              year  : 'numeric',
            }
          )}

      </small>

      <div className="task-actions">

        <button
          className="btn success"
          onClick={(e) => {

            e.stopPropagation();

            onToggle(task);

          }}
        >
          {task.completed ? '↩' : '✓'}
        </button>

        <button
          className="btn warning"
          disabled={task.completed}
          onClick={(e) => {

            e.stopPropagation();

            onEdit(task);

          }}
        >
          ✎
        </button>

        <button
          className="btn danger"
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

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (

    <div className="calendar-layout">

      <Sidebar />

      <main className="calendar-main">

        {/* HEADER */}

        <div className="calendar-header">

          <div>

            <h1>
              Calendar
            </h1>

            <p>
              Organize tasks by date.
            </p>

          </div>

        </div>

        {/* CONTROLS */}

        <div className="calendar-controls">

          <button
            className="btn secondary"
            onClick={prevMonth}
          >
            ←
          </button>

          <h2>
            {monthName} {currentYear}
          </h2>

          <button
            className="btn secondary"
            onClick={nextMonth}
          >
            →
          </button>

        </div>

        {/* WEEKDAYS */}

        <div className="calendar-weekdays">

          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>

        </div>

        {/* GRID */}

        <div className="calendar-grid">

          {calendarDays.map(
            (date, index) => {

              if (!date) {

                return (

                  <div
                    key={index}
                    className="calendar-empty"
                  />

                );

              }

              const tasksForDay =

                tasks.filter((task) => {

                  const taskDate =
                    normalizeTaskDate(task);

                  return isSameDay(
                    taskDate,
                    date
                  );

                });

              const taskCount =
                tasksForDay.length;

              const isSelected =
                isSameDay(
                  date,
                  selectedDate
                );

              const isToday =
                isSameDay(
                  date,
                  new Date()
                );

              const isDisabled =
                isPastDate(date);

              return (

                <div
                  key={index}
                  className={`calendar-day
                    ${
                      isSelected
                        ? 'selected'
                        : ''
                    }
                    ${
                      isToday
                        ? 'today'
                        : ''
                    }
                    ${
                      isDisabled
                        ? 'disabled'
                        : ''
                    }
                  `}
                  onClick={() => {

                    if (isDisabled) {
                      return;
                    }

                    setSelectedDate(
                      new Date(date)
                    );

                  }}
                >

                  <div className="calendar-day-top">

                    <span>
                      {date.getDate()}
                    </span>

                    {taskCount > 0 && (

                      <div className="task-count">

                        {taskCount}

                      </div>

                    )}

                  </div>

                  <div className="calendar-task-preview">

                    {tasksForDay
                      .slice(0, 3)
                      .map((task) => (

                        <div
                          key={task.task_id}
                          className={`mini-task ${String(
                            task.priority
                          ).toLowerCase()}`}
                          title={task.title}
                        >

                          {task.title}

                        </div>

                      ))}

                    {taskCount > 3 && (

                      <div className="more-tasks">

                        +{taskCount - 3} more

                      </div>

                    )}

                  </div>

                  {!isDisabled && (

                    <button
                      className="calendar-add-btn"
                      onClick={(e) => {

                        e.stopPropagation();

                        setSelectedDate(
                          new Date(date)
                        );

                        setTimeout(() => {

                          setIsCreateOpen(true);

                        }, 0);

                      }}
                    >
                      +
                    </button>

                  )}

                </div>

              );

            }
          )}

        </div>

        <div className="tasks-sections-grid">

          {/* SELECTED TASKS */}

          <div className="selected-date-section">

            <div className="selected-date-header">

              <h3>

                Tasks for{' '}

                {normalizeDate(selectedDate)
                  .toLocaleDateString(
                    'en-US',
                    {
                      month : 'long',
                      day   : 'numeric',
                      year  : 'numeric',
                    }
                  )}

              </h3>

              <span>
                {selectedTasks.length} Tasks
              </span>

            </div>

            <div className="selected-tasks-list">

              {selectedTasks.length > 0 ? (

                selectedTasks.map((task) =>
                  renderTaskCard(task)
                )

              ) : (

                <div className="empty-state">

                  <p>
                    No tasks for this day.
                  </p>

                </div>

              )}

            </div>

          </div>

          {/* UPCOMING */}

          <div className="upcoming-section">

            <div className="selected-date-header">

              <h3>
                Upcoming Tasks
              </h3>

              <span>
                {upcomingTasks.length} Tasks
              </span>

            </div>

            <div className="selected-tasks-list">

              {upcomingTasks.length > 0 ? (

                upcomingTasks.map((task) =>
                  renderTaskCard(task)
                )

              ) : (

                <div className="empty-state">

                  <p>
                    No upcoming tasks.
                  </p>

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
          onClose={() =>
            setEditingTask(null)
          }
          task={editingTask}
          onUpdate={handleUpdateTask}
        />

        {/* DETAILS */}

        <TaskDetailModal
          isOpen={Boolean(detailTask)}
          onClose={() =>
            setDetailTask(null)
          }
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

export default CalendarPage;