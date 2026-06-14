/**
 * Storage Service
 * Centralized management of localStorage and sessionStorage
 * Prevents scattered localStorage access throughout the app
 */

// ==========================================
// PASSWORD RESET FLOW STORAGE
// ==========================================

export const password_reset = {
  // Email during forgot password flow
  saveForgotPasswordEmail: (email) => {
    sessionStorage.setItem('forgotPasswordEmail', email);
  },
  
  getForgotPasswordEmail: () => {
    return sessionStorage.getItem('forgotPasswordEmail') || '';
  },
  
  clearForgotPasswordEmail: () => {
    sessionStorage.removeItem('forgotPasswordEmail');
  },

  // Token after security verification
  saveResetToken: (token) => {
    sessionStorage.setItem('resetToken', token);
  },
  
  getResetToken: () => {
    return sessionStorage.getItem('resetToken') || '';
  },
  
  clearResetToken: () => {
    sessionStorage.removeItem('resetToken');
  },

  // Clear entire password reset flow
  clearPasswordResetFlow: () => {
    sessionStorage.removeItem('forgotPasswordEmail');
    sessionStorage.removeItem('resetToken');
  },
};

// ==========================================
// USER PREFERENCES (Optional - for future use)
// ==========================================

export const user_preferences = {
  saveTheme: (theme) => {
    localStorage.setItem('userTheme', theme);
  },
  
  getTheme: () => {
    return localStorage.getItem('userTheme') || 'light';
  },

  saveSidebarState: (isOpen) => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  },
  
  getSidebarState: () => {
    const stored = localStorage.getItem('sidebarOpen');
    return stored ? JSON.parse(stored) : true;
  },
};

// ==========================================
// APP STATE HELPERS
// ==========================================

export const isPasswordResetFlowActive = () => {
  return !!sessionStorage.getItem('forgotPasswordEmail') || 
         !!sessionStorage.getItem('resetToken');
};

export const clearAllSessionData = () => {
  password_reset.clearPasswordResetFlow();
};