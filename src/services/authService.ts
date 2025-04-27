import axios from 'axios';

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const authService = {
    login: async (credentials: { email: string; password: string }) => {
      try {
        const response = await axios.post('http://localhost:5050/api/auth/login', credentials);
        return response.data;
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          throw new Error('Invalid credentials');
        } else {
          throw new Error('Login failed. Please try again.');
        }
      }
    },
    
    register: async (userData: { name: string; email: string; password: string }) => {
      try {
        const response = await axios.post('http://localhost:5050/api/auth/signup', userData);
        return response.data
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          throw new Error(error.response.data.error || 'Registration failed. Please try again.');
        } else {
          throw new Error('Registration failed. Please try again.');
        }
      }
    },
    
    logout: async () => {
      await mockDelay();
      return true;
    }
  };

export const getAuthToken = (): string | null => {
    const crmUser = JSON.parse(localStorage.getItem('crm_user') || '{}');
    return crmUser?.data?.token || null;
};
  