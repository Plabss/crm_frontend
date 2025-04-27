import axios from 'axios';
import { Reminder } from '../types';
import { getAuthToken } from './authService';

const API_URL = 'http://localhost:5050/api';

export const reminderService = {
  getAll: async (userId: string): Promise<Reminder[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/reminders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getUpcoming: async (userId: string): Promise<Reminder[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/reminders/upcoming`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getByClient: async (clientId: string, userId: string): Promise<Reminder[]> => {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    queryParams.append("clientId", clientId); 
    queryParams.append("userId", userId);  

    const response = await axios.get(`${API_URL}/reminders?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getByProject: async (projectId: string, userId: string): Promise<Reminder[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/projects/${projectId}/reminders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getById: async (id: string, userId: string): Promise<Reminder> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/reminders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  create: async (reminderData: Omit<Reminder, 'id'>): Promise<Reminder> => {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/reminders`, reminderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  update: async (id: string, userId: string, reminderData: Omit<Reminder, 'id'>): Promise<Reminder> => {
    const token = getAuthToken();
    const response = await axios.patch(`${API_URL}/reminders/${id}`, reminderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/reminders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  },

  toggleComplete: async (id: string, userId: string): Promise<Reminder> => {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/reminders/toggle/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
};