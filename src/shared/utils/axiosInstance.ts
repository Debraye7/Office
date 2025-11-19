import axios from "axios";
const { BASE_URL } =  process.env;

const axiosInstance = axios.create({
  baseURL:BASE_URL,
  timeout:20000,
  withCredentials:true, // Importante para que el navegador envíe las cookies en las peticiones
  headers:{
    "Content-Type":"application/json",
    Accept:"application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if(accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    const deskId = sessionStorage.getItem("desk");
    if(deskId) config.headers.desk = deskId;
    return config;
  },
  (error) => { return Promise.reject(error) },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => { return response; },
  (error) => {
    if(error.response) {
      // Redirect to login page
      if(error.response.status === 401 && window.location.pathname !== "/auth/login" && window.location.pathname !== "/auth/signup") window.location.href = "/auth/login";
      // Auth error
      if(error.response.status === 403 && window.location.pathname !== "/") window.location.href = "/";
      // Timeout error
    } else if(error.code === "ECONNABORTED") console.error("Request timeout. Please try again.");
    return Promise.reject(error);
  },
);

export default axiosInstance;