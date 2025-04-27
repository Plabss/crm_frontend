import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./components/layouts/MainLayout";
import { AuthLayout } from "./components/layouts/AuthLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import ClientsIndex from "./pages/clients/ClientsIndex";
import ClientForm from "./pages/clients/ClientForm";
import ClientDetail from "./pages/clients/ClientDetail";

import ProjectsIndex from "./pages/projects/ProjectsIndex";
import ProjectForm from "./pages/projects/ProjectForm";
import ProjectDetail from "./pages/projects/ProjectDetail";

import RemindersIndex from "./pages/reminders/RemindersIndex";
import ReminderForm from "./pages/reminders/ReminderForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Protected Routes */}
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />


                {/* Client Routes */}
                <Route path="/clients" element={<ClientsIndex />} />
                <Route path="/clients/new" element={<ClientForm />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/clients/:id/edit" element={<ClientForm />} />


                {/* Project Routes */}
                <Route path="/projects" element={<ProjectsIndex />} />
                <Route path="/projects/new" element={<ProjectForm />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/projects/:id/edit" element={<ProjectForm />} />
                
                {/* Reminder Routes */}
                <Route path="/reminders" element={<RemindersIndex />} />
                <Route path="/reminders/new" element={<ReminderForm />} />
                <Route path="/reminders/:id/edit" element={<ReminderForm />} />

              </Route>
              
              {/* Catch-all / 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
