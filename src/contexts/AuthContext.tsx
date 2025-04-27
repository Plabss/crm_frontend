import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterCredentials, User } from '../types';
import { authService } from '../services/authService';
import { toast } from 'sonner';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('crm_user');
        if (savedUser) {
          const user = JSON.parse(savedUser) as User;
          console.log('User found in localStorage:', user);
          setState({ user, isAuthenticated: true, isLoading: false });
          console.log('User authenticated:', user);
        } else {
          setState({ ...initialState, isLoading: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('crm_user');
        setState({ ...initialState, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const user = await authService.login(credentials);
      if (!user) {
        toast.error('Invalid email or password');
        return;
      }
      localStorage.setItem('crm_user', JSON.stringify(user));

      setState({ user, isAuthenticated: true, isLoading: false });
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const newUser = await authService.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });
      
      localStorage.setItem('crm_user', JSON.stringify(newUser));
      
      setState({ user: newUser, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('crm_user');
    setState({ ...initialState, isLoading: false });
    toast.info('Logged out');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
