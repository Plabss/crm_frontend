import axios from 'axios';
import { Project } from '../types';
import { getAuthToken } from './authService';

const API_URL = 'http://localhost:5050/api';

export const projectService = {
  getAll: async (userId: string): Promise<Project[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getById: async (id: string, userId: string): Promise<Project> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getByClient: async (clientId: string, userId: string): Promise<Project[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/projects/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  create: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/projects`, projectData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  update: async (id: string, userId: string, projectData: Omit<Project, 'id'>,): Promise<Project> => {
    const token = getAuthToken();
    console.log('Updating project with ID:', id, 'and data:', projectData);
    const response = await axios.patch(`${API_URL}/projects/${id}`, projectData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  }
};