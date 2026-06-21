import axiosInstance from "./axios-instance.service";

export const getAnalytics = (range = 7) => {
  const cleanRange = typeof range === "string" && range.includes(":") 
    ? range.split(":")[0] 
    : range;

  return axiosInstance.get("/analytics", {
    params: {
      range: cleanRange,
    },
  });
};