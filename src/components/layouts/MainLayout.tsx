
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarProvider } from '../ui/sidebar';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Users, Calendar, Clock, LogOut, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const MainLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full">
        <Sidebar className="hidden md:flex flex-col w-64 border-r">
          <SidebarContent className="flex flex-col h-full">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-primary">FreelanceFlow</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.data.user?.name}</p>
            </div>
            
            <nav className="flex-1 px-3">
              <div className="space-y-1 py-2">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    cn("sidebar-item", isActive && "active")
                  }
                  end
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </NavLink>
                
                <NavLink 
                  to="/clients" 
                  className={({ isActive }) => 
                    cn("sidebar-item", isActive && "active")
                  }
                >
                  <Users size={18} />
                  <span>Clients</span>
                </NavLink>
                
                <NavLink 
                  to="/projects" 
                  className={({ isActive }) => 
                    cn("sidebar-item", isActive && "active")
                  }
                >
                  <Calendar size={18} />
                  <span>Projects</span>
                </NavLink>
                
                <NavLink 
                  to="/reminders" 
                  className={({ isActive }) => 
                    cn("sidebar-item", isActive && "active")
                  }
                >
                  <Clock size={18} />
                  <span>Reminders</span>
                </NavLink>
              </div>
            </nav>
            
            <div className="p-4 mt-auto border-t flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          <header className="md:hidden flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-bold">FreeCRM</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={18} />
              </Button>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-muted/20 p-6 w-full">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
          
          <nav className="md:hidden grid grid-cols-4 border-t">
            <NavLink to="/" className={({ isActive }) => 
              cn("flex flex-col items-center justify-center py-3", 
                isActive ? "text-primary" : "text-muted-foreground")
            } end>
              <Home size={20} />
              <span className="text-xs mt-1">Dashboard</span>
            </NavLink>
            
            <NavLink to="/clients" className={({ isActive }) => 
              cn("flex flex-col items-center justify-center py-3", 
                isActive ? "text-primary" : "text-muted-foreground")
            }>
              <Users size={20} />
              <span className="text-xs mt-1">Clients</span>
            </NavLink>
            
            <NavLink to="/projects" className={({ isActive }) => 
              cn("flex flex-col items-center justify-center py-3", 
                isActive ? "text-primary" : "text-muted-foreground")
            }>
              <Calendar size={20} />
              <span className="text-xs mt-1">Projects</span>
            </NavLink>
            
            <NavLink to="/reminders" className={({ isActive }) => 
              cn("flex flex-col items-center justify-center py-3", 
                isActive ? "text-primary" : "text-muted-foreground")
            }>
              <Clock size={20} />
              <span className="text-xs mt-1">Reminders</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
};
