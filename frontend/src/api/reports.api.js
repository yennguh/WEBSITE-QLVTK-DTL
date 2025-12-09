import axiosInstance from './axiosInterceptor';

export const createReport = async (data) => {
    const response = await axiosInstance.post('/reports', data);
    return response.data;
};

export const fetchReports = async (params = {}) => {
    const response = await axiosInstance.get('/reports', { params });
    return response.data;
};

export const fetchReportById = async (id) => {
    const response = await axiosInstance.get(`/reports/${id}`);
    return response.data;
};

export const updateReport = async (id, data) => {
    const response = await axiosInstance.put(`/reports/${id}`, data);
    return response.data;
};

export const deleteReport = async (id) => {
    const response = await axiosInstance.delete(`/reports/${id}`);
    return response.data;
};

export const countPendingReports = async () => {
    const response = await axiosInstance.get('/reports/count-pending');
    return response.data;
};
