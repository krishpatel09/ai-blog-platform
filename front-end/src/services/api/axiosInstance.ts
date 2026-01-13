import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Tokenservice from './Tokenservice';
import { API_PATH } from './Apipath';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Tokenservice.getLocalAccessToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalConfig = error.config as CustomAxiosRequestConfig;

        if (originalConfig.headers['X-Skip-Interceptor']) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalConfig._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalConfig.headers["Authorization"] = `Bearer ${token}`;
                        return axiosInstance(originalConfig);
                    })
                    .catch(err => Promise.reject(err));
            }
            originalConfig._retry = true;
            isRefreshing = true;
            try {
                const response = await axios.post(`${URL}${API_PATH.AUTH.REFRESH_TOKEN}`, {}, {
                    withCredentials: true,
                });
                const accessToken = response.data?.accessToken || response.data?.data?.accessToken;

                if (!accessToken) throw new Error("No access token received");

                Tokenservice.updateLocalAccessToken(accessToken);
                processQueue(null, accessToken);

                originalConfig.headers["Authorization"] = `Bearer ${accessToken}`;
                return axiosInstance(originalConfig);
            } catch (refreshError: any) {
                processQueue(refreshError, null);
                Tokenservice.removeUser();

                window.location.href = '/sign-in';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
