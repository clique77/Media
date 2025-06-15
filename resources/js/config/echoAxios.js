import axios from 'axios';
import { authActions } from '@/api/actions';

const echoAxios = axios.create({
    timeout: 10000,
});

echoAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['Accept'] = 'application/json';
        return config;
    },
    (error) => Promise.reject(error)
);

echoAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 403 &&
            originalRequest.url === '/broadcasting/auth' &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const response = await authActions.refreshToken();
                const newAccessToken = response.data.access_token;
                localStorage.setItem('access_token', newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return echoAxios(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default echoAxios;
