/**
 * Date Utility Functions
 * Handles: formatting, timezone conversion, date calculations
 * IMPORTANT: Backend sends ISO strings, frontend handles timezone
 */

// ==========================================
// DATE FORMATTING
// ==========================================

/**
 * Format hour for display (handles UTC to local conversion)
 * @param {number} hour - Hour (0-23)
 * @returns {string} Formatted hour (e.g., "2 PM")
 */
export function formatLocalHour(hour) {
  if (hour === null || hour === undefined) {
    return 'No data';
  }

  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  const utcTimestamp = Date.UTC(utcYear, utcMonth, utcDate, Number(hour), 0, 0);
  const localDate = new Date(utcTimestamp);

  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(
    localDate,
  );
}

/**
 * Format date with day and number
 * @param {string|Date} value - Date value
 * @returns {string} Formatted day (e.g., "Mon 15")
 */
export function formatLocalDay(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

/**
 * Format short date (month and day only)
 * @param {string|Date} value - Date value
 * @returns {string} Formatted date (e.g., "Jun 15")
 */
export function formatLocalShortDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

/**
 * Format date for task creation/update display (flexible)
 * Uses user's local timezone automatically
 * @param {string|Date} dateString - ISO date string from backend
 * @param {string} format - 'short' | 'long' | 'full' (default: 'short')
 * @returns {string} Formatted date
 */
export const formatTaskDate = (dateString, format = 'short') => {
  if (!dateString) return 'No date';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    switch (format) {
      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'full':
        return date.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

      case 'short':
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
    }
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date with time
 * @param {string|Date} dateString - ISO date string
 * @returns {string} Formatted date with time
 */
export const formatTaskDateTime = (dateString) => {
  return formatTaskDate(dateString, 'full');
};

/**
 * Format date for calendar display
 * @param {string|Date} dateString - ISO date string
 * @returns {string} Day and date (e.g., "Mon 15")
 */
export const formatCalendarDate = (dateString) => {
  if (!dateString) return 'No date';

  try {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    return `${day} ${dayNum}`;
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date for time display only
 * @param {string|Date} dateString - ISO date string
 * @returns {string} Time only (e.g., "14:30")
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

/**
 * Get relative time display (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} dateString - ISO date string
 * @returns {string} Relative time description
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatTaskDate(dateString, 'short');
  } catch {
    return '';
  }
};

// ==========================================
// DATE CALCULATIONS
// ==========================================

/**
 * Check if task is scheduled for the future
 * Compares at day level (00:00:00 for both)
 * @param {Object} task - Task object with created_at field
 * @returns {boolean} True if task date is in the future
 */
export const isTaskScheduledForFuture = (task) => {
  if (!task || !task.created_at) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(task.created_at);
    taskDate.setHours(0, 0, 0, 0);

    return taskDate > today;
  } catch {
    return false;
  }
};

/**
 * Check if task was completed today
 * @param {Object} task - Task object
 * @returns {boolean} True if completed today
 */
export const wasCompletedToday = (task) => {
  if (!task || !task.completed || !task.completed_at) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedDate = new Date(task.completed_at);
    completedDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return completedDate >= today && completedDate < tomorrow;
  } catch {
    return false;
  }
};

/**
 * Check if date is today
 * @param {string|Date} dateString - ISO date string
 * @returns {boolean} True if date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;

  try {
    const today = new Date();
    const date = new Date(dateString);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};

/**
 * Check if date is yesterday
 * @param {string|Date} dateString - ISO date string
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (dateString) => {
  if (!dateString) return false;

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const date = new Date(dateString);

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  } catch {
    return false;
  }
};

/**
 * Get date range for current week
 * @returns {Object} { start: Date, end: Date }
 */
export const getCurrentWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek); // Start from Sunday
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // End at Saturday
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Get date range for current month
 * @returns {Object} { start: Date, end: Date }
 */
export const getCurrentMonthRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Get age of date in days
 * @param {string|Date} dateString - ISO date string
 * @returns {number} Age in days
 */
export const getDateAgeInDays = (dateString) => {
  if (!dateString) return 0;

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    return Math.floor(diffMs / 86400000); // 86400000 = 1 day in ms
  } catch {
    return 0;
  }
};

// ==========================================
// ISO STRING UTILITIES (For backend communication)
// ==========================================

/**
 * Get current date as ISO string for backend
 * @returns {string} ISO string (e.g., "2026-06-14T10:30:00.000Z")
 */
export const getNowAsISOString = () => {
  return new Date().toISOString();
};

/**
 * Convert date to ISO string for backend
 * @param {Date} date - JavaScript Date object
 * @returns {string} ISO string
 */
export const dateToISOString = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
};

/**
 * Parse ISO string from backend to Date object
 * @param {string} isoString - ISO string from backend
 * @returns {Date|null} JavaScript Date object
 */
export const parseISOString = (isoString) => {
  if (!isoString) return null;
  try {
    return new Date(isoString);
  } catch {
    return null;
  }
};