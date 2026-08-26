import axios from "axios";

// Global instance of axios to call APIs in routes
export const axiosIns = axios.create({
  baseURL: "http://localhost:8081",
  timeout: 5000,
  withCredentials: true,
});
