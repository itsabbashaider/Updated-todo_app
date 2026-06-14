import { useState, useCallback } from 'react';
import { AuthContext } from '../contexts/auth.context';
import * as userService from '../services/auth.service';

export const AuthProvider = ({ children }) => {
  // ✅ Use lazy initialization instead of effect
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  });

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Helper: Handle successful auth
  const handleAuthSuccess = useCallback((response) => {
    const { accessToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      setIsLoggedIn(true);
      setError(null);
    }
    return response;
  }, []);

  const signup = useCallback(
    async (email, password, firstName, lastName) => {
      try {
        setError(null);
        const response = await userService.signup(
          email,
          password,
          firstName,
          lastName
        );
        return handleAuthSuccess(response);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || 'Signup failed';
        setError(errorMsg);
        throw err;
      }
    },
    [handleAuthSuccess]
  );

  const login = useCallback(
    async (email, password) => {
      try {
        setError(null);
        const response = await userService.login(email, password);
        return handleAuthSuccess(response);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || 'Login failed';
        setError(errorMsg);
        throw err;
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setUser(null);
      setError(null);
    }
  }, []);

  const value = {
    isLoggedIn,
    user,
    setUser,
    error,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};