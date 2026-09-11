import axios from "axios";

// Global instance of axios to call APIs in routes
export const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
});
