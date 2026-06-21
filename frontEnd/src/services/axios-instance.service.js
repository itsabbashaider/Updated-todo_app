import axios from "axios";
import { authStorage, purgeAllStorage } from "./storage.service";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const redirectToLogin = () => {
  purgeAllStorage();
  window.location.href = "/login";
};

let activeRequestsRef = 0;
let startTimeRef = null;
let loadingTimeoutRef = null;
let loadingStateCallback = null;

export const setLoadingStateCallback = (callback) => {
  loadingStateCallback = callback;
};

const notifyLoadingState = (isLoading) => {
  if (loadingStateCallback) {
    loadingStateCallback(isLoading);
  }
};

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

  const nestedPayload = response?.data?.data || response?.data || response;
  const accessToken = nestedPayload?.accessToken || nestedPayload?.token;

  if (!accessToken) {
    throw new Error("Refresh token failed");
  }

  authStorage.saveToken(accessToken);
  return accessToken;
};

const proactiveRefresh = async () => {
  const accessToken = authStorage.getToken();
  if (!accessToken) return;

  try {
    const base64Url = accessToken.split(".")[1];
    if (!base64Url) return;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    const expiresAt = payload.exp * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt - Date.now() < fiveMinutes) {
      await tryRefreshToken();
    }
  } catch (error) {
    console.error("Proactive token refresh decoding error:", error);
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const url = config.url || "";
    if (!url.includes("/users/login") && !url.includes("/users/refresh")) {
      await proactiveRefresh();
    }

    const token = authStorage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    activeRequestsRef += 1;

    if (activeRequestsRef === 1) {
      startTimeRef = Date.now();
      notifyLoadingState(true);
    }

    if (loadingTimeoutRef) {
      clearTimeout(loadingTimeoutRef);
      loadingTimeoutRef = null;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
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

    return response;
  },
  async (error) => {
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

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
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