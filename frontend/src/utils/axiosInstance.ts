import axios from "axios";
import { publishApiError } from "./apiErrors";

// Global instance of axios to call APIs in routes
export const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
});

axiosIns.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? "";

      if (!(status === 401 && url.includes("/api/auth/profile"))) {
        publishApiError({
          status,
          message:
            error.response?.data?.message ??
            (status && status >= 500
              ? "The server could not complete your request."
              : error.message === "Network Error"
                ? "Unable to reach the server. Check your connection."
                : "Please check your request and try again."),
        });
      }
    } else {
      publishApiError({ message: "An unexpected error occurred." });
    }

    return Promise.reject(error);
  },
);
