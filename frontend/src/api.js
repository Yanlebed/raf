// src/api.js

import axios from 'axios';

// Базовый URL вашего API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// Создаем экземпляр Axios с базовым URL
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Перехватчик запроса для добавления токена авторизации к каждому запросу
api.interceptors.request.use(
    (config) => {
        // Получаем токен из localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            // Если токен существует, добавляем его в заголовки запроса
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Обработка ошибок ответа
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Вы можете обработать ошибки, например, перенаправить на страницу входа при 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Действия при получении ошибки 401
            // Например, удаление токена и перенаправление на страницу входа
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export default api;

// Примеры функций для взаимодействия с API

// Получение списка услуг
export const getServices = async () => {
    try {
        const response = await api.get('/services/');
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении списка услуг:', error);
        throw error;
    }
};

// Создание новой услуги
export const createService = async (serviceData) => {
    try {
        const response = await api.post('/services/', serviceData);
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании услуги:', error);
        throw error;
    }
};

// Получение деталей услуги по ID
export const getServiceById = async (serviceId) => {
    try {
        const response = await api.get(`/services/${serviceId}/`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при получении услуги с ID ${serviceId}:`, error);
        throw error;
    }
};

// Обновление услуги
export const updateService = async (serviceId, serviceData) => {
    try {
        const response = await api.put(`/services/${serviceId}/`, serviceData);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении услуги с ID ${serviceId}:`, error);
        throw error;
    }
};

// Удаление услуги
export const deleteService = async (serviceId) => {
    try {
        const response = await api.delete(`/services/${serviceId}/`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при удалении услуги с ID ${serviceId}:`, error);
        throw error;
    }
};

// Авторизация пользователя и получение токена доступа
export const login = async (username, password) => {
    try {
        const response = await api.post('/login/access-token', {
            username,
            password,
        });
        // Сохраняем токен в localStorage
        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    } catch (error) {
        console.error('Ошибка при входе в систему:', error);
        throw error;
    }
};

// Функция для выхода
export const logout = () => {
    localStorage.removeItem('access_token');
};

// Регистрация нового пользователя
export const register = async (userData) => {
    try {
        const response = await api.post('/users/', userData);
        return response.data;
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        throw error;
    }
};

// Получение информации о текущем пользователе
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        throw error;
    }
};

export const createAppointment = async (appointmentData) => {
    try {
        const response = await api.post('/appointments/', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании записи:', error);
        throw error;
    }
};

// Получение списка записей
export const getAppointments = async () => {
    try {
        const response = await api.get('/appointments/');
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении записей:', error);
        throw error;
    }
};

// Удаление записи
export const deleteAppointment = async (id) => {
    try {
        const response = await api.delete(`/appointments/${id}/`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        throw error;
    }
};

// Calendar / Slots
export const getMasterSlots = async (masterId, dateIso, serviceId) => {
    try {
        const params = { date: dateIso };
        if (serviceId) params.service_id = serviceId;
        const response = await api.get(`/calendar/masters/${masterId}/slots`, { params });
        return response.data; // array of ISO strings
    } catch (error) {
        console.error('Ошибка при получении слотов мастера:', error);
        throw error;
    }
};

// Holds
export const placeHold = async ({ masterId, serviceId, startTime, durationMinutes }) => {
    try {
        const response = await api.post('/holds/', {
            master_id: masterId,
            service_id: serviceId,
            start_time: startTime,
            duration_minutes: durationMinutes,
        });
        return response.data; // { id, expires_at }
    } catch (error) {
        console.error('Ошибка при удержании слота:', error);
        throw error;
    }
};

export const releaseHold = async (holdId) => {
    try {
        const response = await api.delete(`/holds/${holdId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при снятии удержания слота:', error);
        throw error;
    }
};

// Files
export const presignUpload = async ({ filename, contentType, orgId }) => {
    try {
        const params = { filename, content_type: contentType };
        if (orgId) params.org_id = orgId;
        const response = await api.post('/files/presign', null, { params });
        return response.data; // { upload_url, key }
    } catch (error) {
        console.error('Ошибка при получении presigned URL:', error);
        throw error;
    }
};

export const uploadViaPresignedUrl = async (uploadUrl, file) => {
    try {
        const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });
        if (!res.ok) throw new Error('Ошибка загрузки файла');
        return true;
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        throw error;
    }
};

// Recommendations
export const getRecommendedDurations = async () => {
    try {
        const response = await api.get('/recommendations/durations');
        return response.data; // { category: minutes }
    } catch (error) {
        console.error('Ошибка при получении рекомендаций по длительности:', error);
        throw error;
    }
};
