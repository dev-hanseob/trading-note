import axios from 'axios';

const TOKEN_KEY = 'auth_token';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Rewrite absolute backend URLs to relative proxy paths
function rewriteUploadUrls(data: unknown): unknown {
    if (typeof data === 'string') {
        return data.replace(/http:\/\/localhost:8080\/uploads\//g, '/uploads/');
    }
    if (Array.isArray(data)) {
        return data.map(rewriteUploadUrls);
    }
    if (data && typeof data === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = rewriteUploadUrls(value);
        }
        return result;
    }
    return data;
}

// Response interceptor: handle 401
apiClient.interceptors.response.use(
    (response) => {
        response.data = rewriteUploadUrls(response.data);
        return response;
    },
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/' && !currentPath.startsWith('/auth/')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
