import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL,
    withCredentials: true, // Send secure cookies (refreshToken) with requests
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle expired access tokens via refresh token rotation
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error response is 401 (Unauthorized) and request has not been retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Request a new access token using the HttpOnly refresh token cookie
                const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
                const { token } = res.data;
                
                // Update local storage and request headers
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;
                
                // Retry the original request
                return api(originalRequest);
            } catch (refreshErr) {
                console.error("Token refresh failed. Redirecting to login...", refreshErr.message);
                // Clear user details and force re-authentication
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
