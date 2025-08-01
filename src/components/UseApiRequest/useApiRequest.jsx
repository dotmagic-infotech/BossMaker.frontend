import axios from 'axios';

export const useApiRequest = () => {
    const apiRequest = async (endpoint, method = 'GET', body = null, isMultipart = false ) => {

        const token = localStorage.getItem("bossmaker");

        try {
            const response = await axios({
                url: `${import.meta.env.VITE_API_URL}${endpoint}`,
                method,
                data: body,
                headers: {
                    'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
            });

            return {
                status: response.status,
                data: response.data,
                error: null,
            };
        } catch (error) {
            return {
                status: error.response?.status || null,
                data: null,
                error: error.response?.data?.message || error.message,
            };
        }
    };

    return apiRequest;
};
