export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  title: string;
  description?: string;
  budget: number;
  deadline: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  clientId: string | null;
  projectId: string | null;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalClients: number;
  totalProjects: number;
  upcomingReminders: Reminder[];
  projectsByStatus: Record<ProjectStatus, number>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}
