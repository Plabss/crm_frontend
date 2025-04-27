import axios from 'axios';
import { DashboardSummary } from '../types';

const API_URL = '';

export const dashboardService = {
  getSummary: async (userId: string): Promise<DashboardSummary> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    const response = await axios.get(`http://localhost:5050/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  }
};