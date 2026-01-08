import axios, { InternalAxiosRequestConfig } from 'axios';
import Tokenservice from './Tokenservice';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Tokenservice.getLocalAccessToken();
        if (token) {
            config.headers["x-access-token"] = token;
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
    async (error: any) => {
        const originalConfig = error.config as CustomAxiosRequestConfig;
        if (error.response && error.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            const refreshToken = Tokenservice.getLocalRefreshToken();
            if (refreshToken) {
                try {
                    const response = await axios.post(`${URL}/api/auth/refresh-token`, {
                        refreshToken,
                    });
                    const token = response.data.token;
                    Tokenservice.updateLocalAccessToken(token);
                    axiosInstance.defaults.headers.common["x-access-token"] = token;
                    return axiosInstance(originalConfig);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
