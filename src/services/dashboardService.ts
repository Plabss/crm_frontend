import axios from 'axios';
import { DashboardSummary } from '../types';

const API_URL = 'http://localhost:5050/api';

export const dashboardService = {
  getSummary: async (userId: string): Promise<DashboardSummary> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.token;
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  }
};