import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const ticketService = {
  getTickets: async (skip = 0, limit = 100) => {
    const response = await api.get('/tickets/', { params: { skip, limit } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  },
  updateStatus: async (ticketId: string, status: string) => {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status });
    return response.data;
  },
  updateDepartment: async (ticketId: string, department: string) => {
    const response = await api.patch(`/tickets/${ticketId}/department`, { department });
    return response.data;
  },
  exportExcel: () => {
    window.open(`${API_BASE_URL}/analytics/export`, '_blank');
  }
};

export default api;
