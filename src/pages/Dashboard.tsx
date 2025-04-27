import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/shared/PageHeader';
import { DataCard } from '../components/shared/DataCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Calendar, Clock, ArrowRight } from 'lucide-react';
import { DashboardSummary, Reminder, ProjectStatus } from '../types';
import { dashboardService } from '../services/dashboardService';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDashboard = async () => {
      if (user) {
        try {
          const data = await dashboardService.getSummary(user.id);
          setDashboardData(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();
  }, [user]);

  const statusColors: Record<ProjectStatus, string> = {
    planned: '#6366F1',    // Indigo
    in_progress: '#F59E0B', // Amber
    on_hold: '#64748B',     // Slate
    completed: '#10B981',   // Emerald
    cancelled: '#F43F5E',   // Rose
  };

  const getStatusPieData = () => {
    if (!dashboardData?.projectsByStatus) return [];

    return Object.entries(dashboardData.projectsByStatus).map(([status, count]) => ({
      name: formatStatus(status as ProjectStatus),
      value: count,
    }));
  };

  const formatStatus = (status: ProjectStatus): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("uuuser", user);

  return (
    <div className="w-full">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.data?.user?.name}`}
      />

      <div className="grid gap-6 md:grid-cols-3 w-full">
        <DataCard
          title="Total Clients"
          value={dashboardData?.totalClients || 0}
          icon={<Users size={20} />}
          description="Your client base"
        />

        <DataCard
          title="Active Projects"
          value={dashboardData?.totalProjects || 0}
          icon={<Calendar size={20} />}
          description="Ongoing work"
        />

        <DataCard
          title="Upcoming Reminders"
          value={dashboardData?.upcomingReminders.length || 0}
          icon={<Clock size={20} />}
          description="Due in the next 7 days"
        />
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {getStatusPieData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* <PieChart>
                  <Pie
                    data={getStatusPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getStatusPieData().map((entry, index) => {
                      const statusKey = Object.keys(dashboardData?.projectsByStatus || {})[index] as ProjectStatus;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={statusColors[statusKey] || '#64748B'} 
                        />
                      );
                    })}
                  </Pie>
                </PieChart> */}
                <PieChart>
                  <Pie
                    data={getStatusPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getStatusPieData().map((entry, index) => {
                      const statusKey = Object.keys(dashboardData?.projectsByStatus || {})[index] as ProjectStatus;
                      console.log('Status Key:', statusKey);  // Log status for debugging
                      const color = statusColors[statusKey.toLowerCase() as ProjectStatus] || '#64748B'; // Ensure matching key (lowercase)
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={color}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>

              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No projects data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Upcoming Reminders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reminders">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboardData?.upcomingReminders && dashboardData.upcomingReminders.length > 0 ? (
              <ul className="space-y-4">
                {dashboardData.upcomingReminders.slice(0, 5).map((reminder) => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No upcoming reminders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ReminderItem: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
  const dueDate = new Date(reminder.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <li className="flex items-center gap-4 p-3 rounded-md bg-muted/30">
      <div
        className={`w-2 h-10 rounded-full ${isOverdue ? 'bg-destructive' : 'bg-primary'}`}
      ></div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{reminder.title}</p>
        <p className="text-sm text-muted-foreground truncate">{reminder.description}</p>
      </div>
      <div className={`text-xs px-2 py-1 rounded-full ${isOverdue
        ? 'bg-destructive/10 text-destructive'
        : 'bg-primary/10 text-primary'
        }`}>
        {format(dueDate, 'MMM d')}
      </div>
    </li>
  );
};

export default Dashboard;
