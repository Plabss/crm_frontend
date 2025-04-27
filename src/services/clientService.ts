import axios from 'axios';
import { Client } from '../types';
import { getAuthToken } from './authService';

const API_URL = 'http://localhost:5050/api';

export const clientService = {
  getAll: async (userId: string): Promise<Client[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/clients`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getById: async (id: string, userId: string): Promise<Client> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/clients`, clientData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  update: async (id: string, userId: string, clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>): Promise<Client> => {
    const token = getAuthToken();
    const response = await axios.patch(`${API_URL}/clients/${id}`, clientData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  }
};