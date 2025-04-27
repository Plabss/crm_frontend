import axios from 'axios';
import { DashboardSummary } from '../types';

import { getAuthToken } from './authService';

export const dashboardService = {
  getSummary: async (userId: string): Promise<DashboardSummary> => {
    const token = getAuthToken();
    const response = await axios.get(`http://localhost:5050/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  }
};