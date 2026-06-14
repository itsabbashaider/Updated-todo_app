import axiosInstance from "./axios-instance.service";

export const getAnalytics = (range = 7) =>
  axiosInstance.get("/analytics", {
    params: {
      range,
    },
  });
