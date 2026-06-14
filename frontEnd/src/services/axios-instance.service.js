import axios from "axios";
import HTTP_STATUSES from "../constants/http-statuses.constant";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const getAccessToken = () => localStorage.getItem("accessToken");
const saveAccessToken = (token) => localStorage.setItem("accessToken", token);
const clearAccessToken = () => localStorage.removeItem("accessToken");

const redirectToLogin = () => {
  clearAccessToken();
  window.location.href = "/login";
};

// ==========================================
// GLOBAL LOADING STATE (Managed Here)
// ==========================================
let activeRequestsRef = 0;
let startTimeRef = null;
let loadingTimeoutRef = null;
let loadingStateCallback = null;

// Register callback from LoadingProvider
export const setLoadingStateCallback = (callback) => {
  loadingStateCallback = callback;
};

const notifyLoadingState = (isLoading) => {
  if (loadingStateCallback) {
    loadingStateCallback(isLoading);
  }
};

// Refresh logic
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, newToken = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  refreshQueue = [];
};

const tryRefreshToken = async () => {
  const response = await axios.post(
    `${baseURL}/users/refresh`,
    {},
    { withCredentials: true }
  );

  const { accessToken } = response.data.data;
  saveAccessToken(accessToken);
  return accessToken;
};

const proactiveRefresh = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) return;

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const expiresAt = payload.exp * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt - Date.now() < fiveMinutes) {
      await tryRefreshToken();
    }
  } catch {
    clearAccessToken();
  }
};

proactiveRefresh();

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
// ✅ START LOADING HERE (single source of truth)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ Increment request counter and show loading
    activeRequestsRef += 1;

    if (activeRequestsRef === 1) {
      startTimeRef = Date.now();
      notifyLoadingState(true);
    }

    // Clear any pending timeout
    if (loadingTimeoutRef) {
      clearTimeout(loadingTimeoutRef);
      loadingTimeoutRef = null;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
// ✅ STOP LOADING HERE (single source of truth)
axiosInstance.interceptors.response.use(
  (response) => {
    // ✅ Decrement request counter
    activeRequestsRef = Math.max(0, activeRequestsRef - 1);

    // Only hide loading when all requests are done
    if (activeRequestsRef === 0) {
      const elapsed = Date.now() - (startTimeRef || Date.now());
      const minTime = 250;
      const remaining = Math.max(0, minTime - elapsed);

      loadingTimeoutRef = setTimeout(() => {
        notifyLoadingState(false);
        loadingTimeoutRef = null;
      }, remaining);
    }

    return response;
  },
  async (error) => {
    // ✅ Decrement request counter on error too
    activeRequestsRef = Math.max(0, activeRequestsRef - 1);

    if (activeRequestsRef === 0) {
      const elapsed = Date.now() - (startTimeRef || Date.now());
      const minTime = 250;
      const remaining = Math.max(0, minTime - elapsed);

      loadingTimeoutRef = setTimeout(() => {
        notifyLoadingState(false);
        loadingTimeoutRef = null;
      }, remaining);
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    const isAuthEndpoint =
      url.includes("/users/login") ||
      url.includes("/users/signup") ||
      url.includes("/users/refresh");

    if (status === HTTP_STATUSES.UNAUTHORIZED && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch(() => redirectToLogin());
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await tryRefreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;