import axios from "axios";
import { supabase } from "./supabase";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If we have a session, add the token to the headers
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log("Auth token added to request:", {
        url: config.url,
        method: config.method,
        hasToken: !!session.access_token,
      });
    } else {
      console.warn("No auth token available for request:", {
        url: config.url,
        method: config.method,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
