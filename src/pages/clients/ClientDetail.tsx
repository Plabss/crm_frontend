import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Building, FileText, Edit, Trash, Calendar, MessageSquare, Clock, Plus } from 'lucide-react';
import { Client, Project, Reminder } from '../../types';
import { clientService } from '../../services/clientService';
import { projectService } from '../../services/projectService';
import { reminderService } from '../../services/reminderService';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !id) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching client data for ID:', id);
        console.log('Current user ID:', user.data?.user?.id);
        const clientData = await clientService.getById(id, user.data?.user?.id);
        if (!clientData) {
          toast.error('Client not found');
          navigate('/clients');
          return;
        }
        
        setClient(clientData);
        
        const projectsData = await projectService.getByClient(id, user.data?.user?.id);
        const remindersData = await reminderService.getByClient(id, user.data?.user?.id);
        setProjects(projectsData);
        setReminders(remindersData);
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast.error('Failed to load client data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user, id, navigate]);

  const handleDelete = async () => {
    if (!user || !id) return;
    
    try {
      const success = await clientService.delete(id, user.data?.user?.id);
      if (success) {
        toast.success('Client deleted successfully');
        navigate('/clients');
      } else {
        toast.error('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('An error occurred while deleting the client');
    }
  };

  const formatDateString = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Client not found</p>
        <Button className="mt-4" asChild>
          <Link to="/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.company || 'Individual Client'}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/clients/${client.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete client "{client.name}" and all associated data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 items-center">
              <Mail size={16} className="text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="text-sm hover:underline">
                {client.email}
              </a>
            </div>
            <div className="flex gap-3 items-center">
              <Phone size={16} className="text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                {client.phone}
              </a>
            </div>
            {client.company && (
              <div className="flex gap-3 items-center">
                <Building size={16} className="text-muted-foreground" />
                <span className="text-sm">{client.company}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {client.notes || "No notes available for this client."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Projects</h3>
            <Button asChild>
              <Link to={`/projects/new?clientId=${client.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
          
          {projects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/projects/${project.id}`} className="hover:underline">
                        {project.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Budget: ${project.budget.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          project.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span>{formatDateString(project.deadline)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="text-lg font-medium mb-2">No Projects Yet</h4>
              <p className="text-muted-foreground mb-4">
                Create your first project with this client
              </p>
              <Button asChild>
                <Link to={`/projects/new?clientId=${client.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reminders" className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Reminders</h3>
            <Button asChild>
              <Link to={`/reminders/new?clientId=${client.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Reminder
              </Link>
            </Button>
          </div>
          
          {reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const dueDate = new Date(reminder.dueDate);
                const isOverdue = dueDate < new Date() && !reminder.completed;
                
                return (
                  <Card key={reminder.id} 
                    className={reminder.completed ? 'opacity-60' : ''}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className={`text-base ${
                            reminder.completed ? 'line-through' : ''
                          }`}>
                            {reminder.title}
                          </CardTitle>
                          <CardDescription className={`${
                            isOverdue ? 'text-destructive' : ''
                          }`}>
                            Due: {formatDateString(reminder.dueDate)}
                            {isOverdue && ' (Overdue)'}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/reminders/${reminder.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    {reminder.description && (
                      <CardContent>
                        <p className="text-sm">{reminder.description}</p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="text-lg font-medium mb-2">No Reminders Set</h4>
              <p className="text-muted-foreground mb-4">
                Create your first reminder for this client
              </p>
              <Button asChild>
                <Link to={`/reminders/new?clientId=${client.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
