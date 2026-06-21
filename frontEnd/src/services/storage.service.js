// ==========================================================================
// CORE AUTHENTICATION STORAGE (Added to centralize loose localStorage calls)
// ==========================================================================
export const authStorage = {
  saveToken: (token) => {
    localStorage.setItem('accessToken', token);
  },

  getToken: () => {
    return localStorage.getItem('accessToken') || null;
  },

  clearToken: () => {
    localStorage.removeItem('accessToken');
  },

  saveUserData: (user) => {
    const normalizedUser = {
      userId: user?.user_id || user?.id,
      email: user?.email,
      firstName: user?.first_name || user?.firstName,
      lastName: user?.last_name || user?.lastName,
    };
    localStorage.setItem('userData', JSON.stringify(normalizedUser));
  },

  getUserData: () => {
    const data = localStorage.getItem('userData');
    try {
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Failed to parse userData from storage:', err);
      return null;
    }
  },

  clearUserData: () => {
    localStorage.removeItem('userData');
  }
};

// ==========================================================================
// PASSWORD RESET FLOW STORAGE (Session Scoped)
// ==========================================================================
export const passwordResetStorage = {
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

// ==========================================================================
// USER PREFERENCES (Local Scoped)
// ==========================================================================
export const userPreferencesStorage = {
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
    try {
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  },
};

// ==========================================================================
// GLOBAL APP STATE HELPERS
// ==========================================================================
export const isPasswordResetFlowActive = () => {
  return !!sessionStorage.getItem('forgotPasswordEmail') || 
         !!sessionStorage.getItem('resetToken');
};

export const clearAllSessionData = () => {
  passwordResetStorage.clearPasswordResetFlow();
};

/**
 * Total clean wipe for user logout operations
 */
export const purgeAllStorage = () => {
  authStorage.clearToken();
  authStorage.clearUserData();
  passwordResetStorage.clearPasswordResetFlow();
  // We explicitly leave userPreferences intact so theme choice isn't lost on logout
};