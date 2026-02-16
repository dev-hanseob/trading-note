import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

apiClient.interceptors.response.use(
    (response) => {
        console.log('[RESPONSE]', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error('[RESPONSE ERROR]', {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message,
            response: error.response?.data,
        });
        return Promise.reject(error);
    }
);

export default apiClient;