// ─── src/pages/calendar.page.jsx ────────────────────────────────────────────

import {
  useState,
  useMemo,
  useCallback,
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
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaTasks, // Imported for the new button icon
} from 'react-icons/fa';

function CalendarPage() {
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

  // ─── MONTH RANGE FILTERS ──────────────────────────────────────────────────

  const filters = useMemo(() => {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return {
      startDate:
        monthStart.toISOString(),

      endDate:
        monthEnd.toISOString(),

      limit: 500,
    };
  }, [currentDate]);

  // ─── TASKS ────────────────────────────────────────────────────────────────

  const {
    tasks,
    loading,
    error,
    addTask,
    removeTask,
    toggleTask,
    updateTaskData,
  } = useTasks(filters);

  // ─── DATE HELPERS ─────────────────────────────────────────────────────────

  const normalizeDate =
    useCallback((date) => {
      const normalized =
        new Date(date);

      normalized.setHours(
        0,
        0,
        0,
        0
      );

      return normalized;
    }, []);

  const normalizeTaskDate =
    useCallback(
      (task) => {
        const dateString =
          task.created_at ||
          task.createdAt ||
          task.updated_at ||
          task.updatedAt;

        if (!dateString) {
          return new Date(0);
        }

        return normalizeDate(
          new Date(dateString)
        );
      },
      [normalizeDate]
    );

  const isSameDay =
    useCallback(
      (date1, date2) => {
        return (
          normalizeDate(
            date1
          ).getTime() ===
          normalizeDate(
            date2
          ).getTime()
        );
      },
      [normalizeDate]
    );

  // ─── PRIORITY ─────────────────────────────────────────────────────────────

  const getPriorityValue =
    useCallback((priority) => {
      const value = String(
        priority
      ).toLowerCase();

      if (value === 'high') {
        return 1;
      }

      if (
        value === 'medium' ||
        value === 'mid'
      ) {
        return 2;
      }

      return 3;
    }, []);

  // ─── TODAY ────────────────────────────────────────────────────────────────

  const today = useMemo(() => {
    return normalizeDate(
      new Date()
    );
  }, [normalizeDate]);

  const isPastDate =
    useCallback(
      (date) => {
        const compareDate =
          normalizeDate(date);

        return (
          compareDate.getTime() <
          today.getTime()
        );
      },
      [
        normalizeDate,
        today,
      ]
    );

  // ─── CURRENT WEEK ─────────────────────────────────────────────────────────

  const getCurrentWeekRange =
    useCallback(() => {
      const todayDate = new Date();
      const day = todayDate.getDay();
      
      // Calculate Sunday of current week
      const diff = todayDate.getDate() - day;
      const weekStart = new Date(
        todayDate.setDate(diff)
      );
      
      // Calculate Saturday of current week
      const weekEnd = new Date(
        todayDate.setDate(
          todayDate.getDate() + 6
        )
      );
      
      return {
        start: normalizeDate(weekStart),
        end: normalizeDate(weekEnd),
      };
    }, [normalizeDate]);

  const currentWeek = useMemo(() => {
    return getCurrentWeekRange();
  }, [getCurrentWeekRange]);

  const isCurrentWeekDay =
    useCallback(
      (date) => {
        const normalized =
          normalizeDate(date);

        return (
          normalized.getTime() >=
            currentWeek.start.getTime() &&
          normalized.getTime() <=
            currentWeek.end.getTime()
        );
      },
      [
        normalizeDate,
        currentWeek,
      ]
    );

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

  const calendarDays =
    useMemo(() => {
      const days = [];

      for (
        let i = 0;
        i < startDay;
        i++
      ) {
        days.push(null);
      }

      for (
        let day = 1;
        day <= totalDays;
        day++
      ) {
        days.push(
          new Date(
            currentYear,
            currentMonth,
            day
          )
        );
      }

      return days;
    }, [
      startDay,
      totalDays,
      currentMonth,
      currentYear,
    ]);

// ─── SELECTED TASKS ───────────────────────────────────────────────────────

const selectedTasks =
  useMemo(() => {
    return tasks
      .filter((task) => {
        const taskDate =
          normalizeTaskDate(
            task
          );

        return isSameDay(
          taskDate,
          selectedDate
        );
      })
      .sort((a, b) => {
        // 1. Separate by completion state (Pending first, Completed last)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        // 2. If both are pending or both are completed, sort by priority
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

        // 3. If priority is identical, fall back to newest creation date first
        return (
          normalizeTaskDate(
            b
          ) -
          normalizeTaskDate(
            a
          )
        );
      });
  }, [
    tasks,
    selectedDate,
    isSameDay,
    normalizeTaskDate,
    getPriorityValue,
  ]);
  // ─── UPCOMING TASKS ───────────────────────────────────────────────────────

  const upcomingTasks =
    useMemo(() => {
      return tasks
        .filter((task) => {
          const taskDate =
            normalizeTaskDate(
              task
            );

          return (
            taskDate > today &&
            !task.completed
          );
        })
        .sort((a, b) => {
          return (
            normalizeTaskDate(
              a
            ) -
            normalizeTaskDate(
              b
            )
          );
        });
    }, [
      tasks,
      normalizeTaskDate,
      today,
    ]);

  // ─── CONFIRM ──────────────────────────────────────────────────────────────

  const askConfirm = (
    message,
    action
  ) => {
    setConfirmMessage(
      message
    );

    setConfirmAction(
      () => action
    );

    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);

    setConfirmAction(null);

    setConfirmMessage('');
  };

  const handleConfirm =
    async () => {
      if (!confirmAction) {
        return;
      }

      await confirmAction();

      closeConfirm();
    };

  // ─── TASK ACTIONS ─────────────────────────────────────────────────────────

  const handleCreateTask =
    async (taskData) => {
      const taskDate =
        normalizeDate(
          selectedDate
        );

      const safeDate =
        new Date(
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

        priority: String(
          taskData.priority
        ).toLowerCase(),

        completed: false,

        created_at:
          safeDate.toISOString(),
      });

      setIsCreateOpen(false);
    };

  const handleUpdateTask =
    async (
      taskId,
      updates
    ) => {
      await updateTaskData(
        taskId,
        updates
      );

      setEditingTask(null);
    };

  const onToggle =
    async (task) => {
      const taskDate =
        normalizeTaskDate(
          task
        );

      if (task.completed) {
        askConfirm(
          'Are you sure you want to undo this completed task?',
          async () => {
            await toggleTask(
              task
            );
          }
        );

        return;
      }

      if (taskDate > today) {
        askConfirm(
          'This task is scheduled for a future date. Mark it as completed anyway?',
          async () => {
            await toggleTask(
              task
            );
          }
        );

        return;
      }

      await toggleTask(task);
    };

  const onDelete = (task) => {
    askConfirm(
      'Are you sure you want to delete this task?',
      async () => {
        await removeTask(
          task.task_id
        );
      }
    );
  };

  const onEdit = (task) => {
    if (task.completed) {
      return;
    }

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

  // ─── SCROLL HELPER ────────────────────────────────────────────────────────

  const scrollToTasks = () => {
    const element = document.getElementById('tasks-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ─── TASK CARD ────────────────────────────────────────────────────────────

  const renderTaskCard = (
    task
  ) => (
    <div
      key={
        task.task_id ||
        task.id
      }
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
            task.priority ||
              'low'
          ).toLowerCase()}`}
        >
          {task.priority ||
            'Low'}
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
        <strong>
          Created:
        </strong>{' '}
        {normalizeTaskDate(
          task
        ).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }
        )}
      </small>

      <div className="task-actions">
        <button
          type="button"
          className="btn complete-btn"
          onClick={(e) => {
            e.stopPropagation();

            onToggle(task);
          }}
        >
          {task.completed ? (
            <FaUndo />
          ) : (
            <FaCheck />
          )}
        </button>

        <button
          type="button"
          className="btn edit-btn"
          disabled={
            task.completed
          }
          onClick={(e) => {
            e.stopPropagation();

            onEdit(task);
          }}
        >
          <FaEdit />
        </button>

        <button
          type="button"
          className="btn delete-btn"
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

  // ─── LOADING ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="calendar-layout">
        <Sidebar />

        <main className="calendar-main">
          <p>
            Loading
            calendar...
          </p>
        </main>
      </div>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="calendar-layout">
        <Sidebar />

        <main className="calendar-main">
          <p>{error}</p>
        </main>
      </div>
    );
  }

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
                Organize tasks by
                date.
              </p>
            </div>
          </div>
          
        <div className="calendar-container">
          
          {/* FLOATING ACTION BUTTON TO SCROLL DOWN */}
          <button 
            type="button" 
            className="floating-scroll-btn" 
            onClick={scrollToTasks}
            title="Scroll to tasks"
          >
            <FaTasks />
            <span>View Tasks</span>
          </button>

          {/* CONTROLS */}

          <div className="calendar-controls">
            <button
              type="button"
              className="btn secondary"
              onClick={prevMonth}
            >
              <FaChevronLeft />
            </button>

            <h2>
              {monthName}{' '}
              {currentYear}
            </h2>

            <button
              type="button"
              className="btn secondary"
              onClick={nextMonth}
            >
              <FaChevronRight />
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
              (
                date,
                index
              ) => {
                if (!date) {
                  return (
                    <div
                      key={index}
                      className="calendar-empty"
                    />
                  );
                }

                const tasksForDay =
                  tasks.filter(
                    (task) => {
                      const taskDate =
                        normalizeTaskDate(
                          task
                        );

                      return isSameDay(
                        taskDate,
                        date
                      );
                    }
                  );

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

                const isPastDay =
                  isPastDate(
                    date
                  );

                const isCurrentWeek =
                  isCurrentWeekDay(
                    date
                  );

                return (
                  <div
                    key={index}
                    className={`calendar-day ${
                      isSelected
                        ? 'selected'
                        : ''
                    } ${
                      isToday
                        ? 'today'
                        : ''
                    } ${
                      isPastDay
                        ? 'past-day'
                        : ''
                    } ${
                      isCurrentWeek
                        ? 'current-week'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedDate(
                        new Date(date)
                      );
                    }}
                  >
                    <div className="calendar-day-top">
                      <span>
                        {date.getDate()}
                      </span>

                      {taskCount >
                        0 && (
                        <div className="task-count">
                          {
                            taskCount
                          }
                        </div>
                      )}
                    </div>

                    <div className="calendar-task-preview">
                      {tasksForDay
                        .slice(
                          0,
                          3
                        )
                        .map(
                          (
                            task
                          ) => (
                            <div
                              key={
                                task.task_id
                              }
                              className={`mini-task ${String(
                                task.priority ||
                                  'low'
                              ).toLowerCase()}`}
                              title={
                                task.title
                              }
                            >
                              {
                                task.title
                              }
                            </div>
                          )
                        )}

                      {taskCount >
                        3 && (
                        <div className="more-tasks">
                          <FaPlus />
                          {taskCount -
                            3}{' '}
                          more
                        </div>
                      )}
                    </div>

                    {!isPastDay && (
                      <button
                        type="button"
                        className="calendar-add-btn"
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation();

                          setSelectedDate(
                            new Date(
                              date
                            )
                          );

                          setTimeout(
                            () => {
                              setIsCreateOpen(
                                true
                              );
                            },
                            0
                          );
                        }}
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* TASK SECTIONS */}

          {/* Added id="tasks-section" here for target reference */}
          <div id="tasks-section" className="tasks-sections-grid">
            {/* SELECTED TASKS */}

            <div className="selected-date-section">
              <div className="selected-date-header">
                <h3>
                  Tasks for{' '}
                  {normalizeDate(
                    selectedDate
                  ).toLocaleDateString(
                    'en-US',
                    {
                      month:
                        'long',
                      day: 'numeric',
                      year:
                        'numeric',
                    }
                  )}
                </h3>

                <span>
                  {
                    selectedTasks.length
                  }{' '}
                </span>
              </div>

              <div className="selected-tasks-list">
                {selectedTasks.length >
                0 ? (
                  selectedTasks.map(
                    (task) =>
                      renderTaskCard(
                        task
                      )
                  )
                ) : (
                  <div className="empty-state">
                    <p>
                      No tasks
                      for this
                      day.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* UPCOMING */}

            <div className="upcoming-section">
              <div className="selected-date-header">
                <h3>
                  Upcoming
                  Tasks
                </h3>

                <span>
                  {
                    upcomingTasks.length
                  }{' '}
                </span>
              </div>

              <div className="selected-tasks-list">
                {upcomingTasks.length >
                0 ? (
                  upcomingTasks.map(
                    (task) =>
                      renderTaskCard(
                        task
                      )
                  )
                ) : (
                  <div className="empty-state">
                    <p>
                      No upcoming
                      tasks.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CREATE MODAL */}

          <CreateModal
            isOpen={
              isCreateOpen
            }
            onClose={() =>
              setIsCreateOpen(
                false
              )
            }
            onCreate={
              handleCreateTask
            }
          />

          {/* EDIT MODAL */}

          <EditModal
            isOpen={Boolean(
              editingTask
            )}
            onClose={() =>
              setEditingTask(
                null
              )
            }
            task={editingTask}
            onUpdate={
              handleUpdateTask
            }
          />

          {/* DETAIL MODAL */}

          <TaskDetailModal
            isOpen={Boolean(
              detailTask
            )}
            onClose={() =>
              setDetailTask(
                null
              )
            }
            task={detailTask}
          />

          {/* CONFIRM MODAL */}

          <ConfirmModal
            isOpen={
              confirmOpen
            }
            message={
              confirmMessage
            }
            onClose={
              closeConfirm
            }
            onConfirm={
              handleConfirm
            }
          />
        </div>
      </main>
    </div>
  );
}

export default CalendarPage;