
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Clock, Search, Check, Edit, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { clientService } from '../../services/clientService';
import { reminderService } from '../../services/reminderService';
import { Reminder, Client, Project } from '../../types';
import { format, isBefore } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const RemindersIndex: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch all reminders
          const remindersData = await reminderService.getAll(user.id);
          setReminders(remindersData);

          // Fetch all clients to get their names
          const clientsData = await clientService.getAll(user.id);
          const clientsMap = clientsData.reduce((acc, client) => {
            acc[client.id] = client;
            return acc;
          }, {} as Record<string, Client>);
          setClients(clientsMap);

          // Fetch all projects to get their titles
          const projectsData = await projectService.getAll(user.id);
          const projectsMap = projectsData.reduce((acc, project) => {
            acc[project.id] = project;
            return acc;
          }, {} as Record<string, Project>);
          setProjects(projectsMap);
        } catch (error) {
          console.error('Error fetching reminders:', error);
          toast.error('Failed to load reminders');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = [...reminders];

    // Apply tab filter
    if (tabValue === 'upcoming') {
      filtered = filtered.filter(reminder =>
        !reminder.completed &&
        isBefore(new Date(), new Date(reminder.dueDate))
      );
    } else if (tabValue === 'completed') {
      filtered = filtered.filter(reminder => reminder.completed);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reminder =>
        reminder.title.toLowerCase().includes(query) ||
        (reminder.description?.toLowerCase().includes(query)) ||
        (reminder.clientId && clients[reminder.clientId]?.name.toLowerCase().includes(query)) ||
        (reminder.projectId && projects[reminder.projectId]?.title.toLowerCase().includes(query))
      );
    }

    // Sort by due date
    filtered.sort((a, b) => {
      // Sort completed items to the end
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      // Sort by due date (oldest first for non-completed)
      if (!a.completed) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // Sort completed by due date (newest completed first)
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });

    setFilteredReminders(filtered);
  }, [searchQuery, reminders, clients, projects, tabValue]);

  const formatDateString = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      const updatedReminder = await reminderService.toggleComplete(id, user.id);
      if (updatedReminder) {
        setReminders(prevReminders =>
          prevReminders.map(reminder =>
            reminder.id === id ? { ...reminder, completed: !currentStatus } : reminder
          )
        );
        toast.success(`Reminder marked as ${!currentStatus ? 'complete' : 'incomplete'}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };


  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const success = await reminderService.delete(id, user.id);
      if (success) {
        setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
        toast.success('Reminder deleted successfully');
      } else {
        toast.error('Failed to delete reminder');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('An error occurred while deleting the reminder');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reminders"
        description="Keep track of important tasks and deadlines"
        actions={
          <Button asChild>
            <Link to="/reminders/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Link>
          </Button>
        }
      />

      {reminders.length === 0 ? (
        <EmptyState
          title="No reminders yet"
          description="Add your first reminder to keep track of important tasks"
          icon={<Clock size={24} className="text-muted-foreground" />}
          action={{
            label: 'Add Reminder',
            href: '/reminders/new',
          }}
        />
      ) : (
        <>
          <div className="mb-6 space-y-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reminders..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as any)} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Reminder</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="hidden md:table-cell">Related To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.map((reminder) => {
                  const dueDate = new Date(reminder.dueDate);
                  const isOverdue = dueDate < new Date() && !reminder.completed;

                  return (
                    <TableRow key={reminder.id} className={reminder.completed ? 'opacity-60' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={reminder.completed}
                          onCheckedChange={() => handleToggleComplete(reminder.id, reminder.completed)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className={reminder.completed ? 'line-through' : ''}>
                          <span className="font-medium">{reminder.title}</span>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {reminder.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={isOverdue ? 'text-destructive' : ''}>
                          {formatDateString(reminder.dueDate)}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {reminder.clientId && (
                          <Link
                            to={`/clients/${reminder.clientId}`}
                            className="text-primary hover:underline"
                          >
                            {clients[reminder.clientId]?.name || 'Unknown Client'}
                          </Link>
                        )}
                        {reminder.projectId && reminder.clientId && ' - '}
                        {reminder.projectId && (
                          <Link
                            to={`/projects/${reminder.projectId}`}
                            className="text-primary hover:underline"
                          >
                            {projects[reminder.projectId]?.title || 'Unknown Project'}
                          </Link>
                        )}
                        {!reminder.clientId && !reminder.projectId && 'General'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/reminders/${reminder.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reminder.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default RemindersIndex;
