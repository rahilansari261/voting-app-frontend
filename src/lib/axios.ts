// import { useUserStore } from "@/store/userStore";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "x-app-type": "web",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if user is logged in -> needed to use the zustand state this way coz it's class component.. not function component
    // const user = useUserStore.getState().user;
    // Handle response errors globally -> if there is no user or unauthorized error get pops up
    if (
      error.response.status === 401
      // || user === null
    ) {
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/";
        return;
      }
      window.location.href = `${window.location.pathname}/${window.location.search}`;
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default axiosInstance;
