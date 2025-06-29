import axios from "axios";
import { supabase } from "./supabase";

// Get API base URL from environment or default to backend-nest
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  // Get token from Supabase session
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors by redirecting to login
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      supabase.auth.signOut();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
