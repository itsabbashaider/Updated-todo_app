/**
 * Task Utility Functions
 * ✅ UNIFIED: Single source of truth for all task-related logic
 */

// ==========================================
// VALIDATION RULES (Single Source of Truth)
// ==========================================

export const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  description: {
    required: false,
    maxLength: 500,
  },
  priority: {
    required: false,
    allowed: ['low', 'medium', 'high'],
  },
  dueDate: {
    required: false,
    type: 'date',
  },
  tags: {
    required: false,
    maxCount: 10,
    maxLength: 50,
  },
};

// ==========================================
// PRIORITY MAPPING
// ==========================================

export const PRIORITY_ORDER = {
  high: 1,
  medium: 2,
  mid: 2,
  low: 3,
};

export const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  mid: 'Medium',
  low: 'Low',
};

export const PRIORITY_COLORS = {
  high: '#dc2626',      // red
  medium: '#f59e0b',    // amber
  mid: '#f59e0b',       // amber
  low: '#10b981',       // green
};

// ==========================================
// PRIORITY OPERATIONS
// ==========================================

/**
 * Get numeric value for priority (used for sorting)
 * @param {string} priority - Priority level
 * @returns {number} Numeric value for sorting
 */
export const getPriorityValue = (priority) => {
  const normalized = String(priority || 'low').toLowerCase();
  return PRIORITY_ORDER[normalized] || 99;
};

/**
 * Get display label for priority
 * @param {string} priority - Priority level
 * @returns {string} Display label
 */
export const getPriorityLabel = (priority) => {
  const normalized = String(priority || 'low').toLowerCase();
  return PRIORITY_LABELS[normalized] || 'Low';
};

/**
 * Get color for priority badge
 * @param {string} priority - Priority level
 * @returns {string} CSS color value
 */
export const getPriorityColor = (priority) => {
  const normalized = String(priority || 'low').toLowerCase();
  return PRIORITY_COLORS[normalized] || PRIORITY_COLORS.low;
};

// ==========================================
// TASK STATUS OPERATIONS
// ==========================================

export const STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Completed',
};

/**
 * Get display label for status
 * @param {boolean} completed - Task completion status
 * @returns {string} Display label
 */
export const getStatusLabel = (completed) => {
  return completed ? STATUS_LABELS.completed : STATUS_LABELS.pending;
};

// ==========================================
// TASK FILTERING
// ==========================================

/**
 * Filter pending (incomplete) tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Filtered pending tasks
 */
export const filterPendingTasks = (tasks) => {
  return tasks.filter(task => !task.completed);
};

/**
 * Filter completed tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Filtered completed tasks
 */
export const filterCompletedTasks = (tasks) => {
  return tasks.filter(task => task.completed);
};

/**
 * Filter tasks by priority
 * @param {Array} tasks - Array of tasks
 * @param {string} priority - Priority level
 * @returns {Array} Filtered tasks
 */
export const filterByPriority = (tasks, priority) => {
  return tasks.filter(task =>
    String(task.priority || 'low').toLowerCase() === String(priority).toLowerCase()
  );
};

/**
 * Search tasks by title or description
 * @param {Array} tasks - Array of tasks
 * @param {string} query - Search query
 * @returns {Array} Filtered tasks
 */
export const searchTasks = (tasks, query) => {
  const sanitized = validateSearch(query);
  if (!sanitized) return tasks;

  const lowerQuery = sanitized.toLowerCase();
  return tasks.filter(task =>
    task.title?.toLowerCase().includes(lowerQuery) ||
    task.description?.toLowerCase().includes(lowerQuery)
  );
};

// ==========================================
// TASK SORTING
// ==========================================

/**
 * Sort tasks by priority (high to low)
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Sorted tasks (new array, doesn't mutate)
 */
export const sortByPriority = (tasks) => {
  return [...tasks].sort((a, b) =>
    getPriorityValue(a.priority) - getPriorityValue(b.priority)
  );
};

/**
 * Sort tasks by date (newest to oldest)
 * @param {Array} tasks - Array of tasks
 * @param {string} dateField - Field to sort by (created_at, updated_at, completed_at)
 * @returns {Array} Sorted tasks (new array, doesn't mutate)
 */
export const sortByDate = (tasks, dateField = 'created_at') => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a[dateField] || 0);
    const dateB = new Date(b[dateField] || 0);
    return dateB - dateA;
  });
};

/**
 * Sort tasks by priority, then by date
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Sorted tasks
 */
export const sortByPriorityThenDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    const priorityDiff = getPriorityValue(a.priority) - getPriorityValue(b.priority);
    if (priorityDiff !== 0) return priorityDiff;

    const dateA = new Date(a.updated_at || a.created_at || 0);
    const dateB = new Date(b.updated_at || b.created_at || 0);
    return dateB - dateA;
  });
};

// ==========================================
// TASK ORGANIZATION
// ==========================================

/**
 * Organize tasks into pending and completed
 * @param {Array} tasks - Array of tasks
 * @returns {Object} { pending: [], completed: [] }
 */
export const organizeTasksByStatus = (tasks) => {
  return {
    pending: sortByPriority(filterPendingTasks(tasks)),
    completed: sortByPriorityThenDate(filterCompletedTasks(tasks)),
  };
};

/**
 * Group tasks by priority
 * @param {Array} tasks - Array of tasks
 * @returns {Object} { high: [], medium: [], low: [] }
 */
export const groupTasksByPriority = (tasks) => {
  return {
    high: filterByPriority(tasks, 'high'),
    medium: filterByPriority(tasks, 'medium'),
    low: filterByPriority(tasks, 'low'),
  };
};

// ==========================================
// TASK VALIDATION (Single Source of Truth)
// ==========================================

/**
 * ✅ UNIFIED: Validate task input before sending to backend
 * Used by: Hook, Components, Tests
 * @param {object} taskData - Task data from form
 * @returns {object} { isValid: boolean, errors: array }
 */
export function validateTaskInput(taskData) {
  const errors = [];

  // Title validation
  if (!taskData.title || taskData.title.trim() === '') {
    errors.push(`Title is required`);
  } else if (taskData.title.length < VALIDATION_RULES.title.minLength) {
    errors.push(
      `Title must be at least ${VALIDATION_RULES.title.minLength} characters`
    );
  } else if (taskData.title.length > VALIDATION_RULES.title.maxLength) {
    errors.push(
      `Title must be less than ${VALIDATION_RULES.title.maxLength} characters`
    );
  }

  // Description validation (optional but has limits)
  if (taskData.description && taskData.description.length > VALIDATION_RULES.description.maxLength) {
    errors.push(
      `Description must be less than ${VALIDATION_RULES.description.maxLength} characters`
    );
  }

  // Priority validation
  if (
    taskData.priority &&
    !VALIDATION_RULES.priority.allowed.includes(
      String(taskData.priority).toLowerCase()
    )
  ) {
    errors.push('Priority must be low, medium, or high');
  }

  // Due date validation
  if (taskData.due_date) {
    if (isNaN(new Date(taskData.due_date).getTime())) {
      errors.push('Due date must be a valid date');
    }
  }

  // Tags validation
  if (taskData.tags && Array.isArray(taskData.tags)) {
    if (taskData.tags.length > VALIDATION_RULES.tags.maxCount) {
      errors.push(`Maximum ${VALIDATION_RULES.tags.maxCount} tags allowed`);
    }
    if (taskData.tags.some((tag) => tag.length > VALIDATION_RULES.tags.maxLength)) {
      errors.push(
        `Each tag must be less than ${VALIDATION_RULES.tags.maxLength} characters`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize task data before sending to backend
 * ✅ Uses snake_case for backend
 * @param {object} taskData - Raw task data
 * @returns {object} Sanitized task data
 */
export function sanitizeTaskInput(taskData) {
  return {
    title: taskData.title ? taskData.title.trim() : '',
    description: taskData.description ? taskData.description.trim() : '',
    priority: taskData.priority
      ? String(taskData.priority).toLowerCase()
      : 'low',
    due_date: taskData.due_date || null,  // snake_case ✓
    completed: Boolean(taskData.completed),
  };
}

// ==========================================
// PAGINATION VALIDATION
// ==========================================

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} { page: number, limit: number }
 */
export function validatePagination(page = 1, limit = 20) {
  const validPage = Math.max(1, Number(page) || 1);
  const validLimit = Math.min(Math.max(1, Number(limit) || 20), 100); // Max 100 per page

  return {
    page: validPage,
    limit: validLimit,
  };
}

// ==========================================
// SEARCH VALIDATION
// ==========================================

/**
 * Validate and sanitize search query
 * @param {string} search - Search string
 * @returns {string} Sanitized search
 */
export function validateSearch(search = '') {
  if (!search || typeof search !== 'string') {
    return '';
  }

  return search.trim().slice(0, 100); // Max 100 chars
}

// ==========================================
// TASK STATS
// ==========================================

/**
 * Get task statistics
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Statistics object
 */
export const getTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const byPriority = {
    high: tasks.filter(t => getPriorityValue(t.priority) === 1).length,
    medium: tasks.filter(t => getPriorityValue(t.priority) === 2).length,
    low: tasks.filter(t => getPriorityValue(t.priority) === 3).length,
  };

  return {
    total,
    completed,
    pending,
    completionRate,
    byPriority,
  };
};