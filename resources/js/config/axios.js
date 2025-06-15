import axios from 'axios';
import {authActions} from "@/api/actions";
import {authUrls} from "@/api/urls";
import {userUrls} from "@/api/urls/index.js";

let externalShowModal = () => {
};

export const setShowModal = (fn) => {
    externalShowModal = fn;
};

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['Accept'] = 'application/json';
        config.headers['Accept-Language'] = 'uk';
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== authUrls.refreshToken) {
            originalRequest._retry = true;

            try {
                const response = await authActions.refreshToken();

                const newAccessToken = response.data.access_token;
                localStorage.setItem('access_token', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                if (originalRequest.url !== userUrls.me) {
                    externalShowModal();
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response && error.response.status === 403 &&
            error.response.data?.message === "Your email address is not verified.") {
            externalShowModal();
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
