
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Moon, Sun } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">FreelanceFlow</h1>
            <p className="text-muted-foreground">Clients Organized, Freelance Optimized</p>
          </div>
          <div className="bg-card border shadow-sm rounded-lg p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
