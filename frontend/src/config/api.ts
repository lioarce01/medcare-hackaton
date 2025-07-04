import axios from "axios";
import { supabase } from "./supabase";

// Get API base URL from environment or default to backend-nest
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // Increased timeout to 30 seconds for medication creation with adherence generation
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    // Get token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No authenticated session");
    }

    config.headers.Authorization = `Bearer ${session.access_token}`;
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error occurred'));
    }

    // Handle 401 errors by redirecting to login
    if (error.response.status === 401) {
      // Clear session and redirect to login
      await supabase.auth.signOut();
      window.location.href = "/login";
      return Promise.reject(new Error('Authentication required'));
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
