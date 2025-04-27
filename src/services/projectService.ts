import axios from 'axios';
import { Project } from '../types';

const API_URL = 'http://localhost:5050/api';

export const projectService = {
  getAll: async (userId: string): Promise<Project[]> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    const response = await axios.get(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getById: async (id: string, userId: string): Promise<Project> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    const response = await axios.get(`${API_URL}/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getByClient: async (clientId: string, userId: string): Promise<Project[]> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    const response = await axios.get(`${API_URL}/projects/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  create: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    const response = await axios.post(`${API_URL}/projects`, projectData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  update: async (id: string, userId: string, projectData: Omit<Project, 'id'>,): Promise<Project> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    console.log('Updating project with ID:', id, 'and data:', projectData);
    const response = await axios.patch(`${API_URL}/projects/${id}`, projectData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user'));
    const token = crmUser?.data.token;
    await axios.delete(`${API_URL}/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  }
};