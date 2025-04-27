import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectService } from '../../services/projectService';
import { clientService } from '../../services/clientService';
import { reminderService } from '../../services/reminderService';
import { Reminder, Client, Project } from '../../types';
import { z } from 'zod';
import { toast } from 'sonner';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  clientId: z.string().nullable(),
  projectId: z.string().nullable(),
  dueDate: z.string().min(1, 'Due date is required'),
  completed: z.boolean(),
});

const ReminderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedClientId = queryParams.get('clientId') || null;
  const preselectedProjectId = queryParams.get('projectId') || null;
  const { user } = useAuth();

  const isEditing = Boolean(id);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const [formData, setFormData] = useState<Omit<Reminder, 'id' | 'userId' | 'createdAt'>>({
    title: '',
    description: '',
    clientId: preselectedClientId,
    projectId: preselectedProjectId,
    dueDate: new Date().toISOString(),
    completed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Fetch all clients and projects
          const clientsData = await clientService.getAll(user.id);
          const projectsData = await projectService.getAll(user.id);

          setClients(clientsData);
          setProjects(projectsData);

          // Filter projects by client if a client is selected
          if (formData.clientId) {
            setFilteredProjects(projectsData.filter(project => project.clientId === formData.clientId));
          } else {
            setFilteredProjects(projectsData);
          }

          // If editing, fetch reminder data
          if (isEditing && id) {
            const reminderData = await reminderService.getById(id, user.id);
            if (reminderData) {
              // Remove unwanted fields
              const { id, userId, createdAt, ...reminderFormData } = reminderData;
              setFormData(reminderFormData);
              setDueDate(new Date(reminderData.dueDate));

              // Update filtered projects if client is selected
              if (reminderData.clientId) {
                setFilteredProjects(projectsData.filter(project => project.clientId === reminderData.clientId));
              }
            } else {
              toast.error('Reminder not found');
              navigate('/reminders');
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Error loading data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isEditing, user, id, navigate]);

  useEffect(() => {
    // Update filtered projects when client selection changes
    if (formData.clientId) {
      setFilteredProjects(projects.filter(project => project.clientId === formData.clientId));

      // Clear project selection if the current project doesn't belong to the selected client
      if (formData.projectId) {
        const projectBelongsToClient = projects.some(
          p => p.id === formData.projectId && p.clientId === formData.clientId
        );

        if (!projectBelongsToClient) {
          setFormData(prev => ({ ...prev, projectId: null }));
        }
      }
    } else {
      setFilteredProjects(projects);
    }
  }, [formData.clientId, projects]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: keyof typeof formData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: keyof typeof formData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (date) {
      setDueDate(date);
      setFormData((prev) => ({ ...prev, dueDate: date.toISOString() }));

      // Clear validation error
      if (errors.dueDate) {
        setErrors((prev) => ({ ...prev, dueDate: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      reminderSchema.parse(formData);

      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      if (isEditing && id) {
        // Update existing reminder
        await reminderService.update(id, user.id, formData);
        toast.success('Reminder updated successfully');
      } else {
        // Create new reminder
        await reminderService.create({
          ...formData,
          userId: user.id,
        });
        toast.success('Reminder added successfully');
      }

      navigate('/reminders');
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format validation errors
        const fieldErrors = error.errors.reduce(
          (acc, curr) => {
            const fieldName = curr.path[0] as string;
            acc[fieldName] = curr.message;
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(fieldErrors);
      } else {
        console.error('Form submission error:', error);
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reminder data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Reminder' : 'Add Reminder'}
        description={isEditing ? 'Update reminder details' : 'Create a new reminder'}
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Add details about this reminder"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={formData.clientId || undefined}
                onValueChange={(value) => handleSelectChange('clientId', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                value={formData.projectId || undefined}
                onValueChange={(value) => handleSelectChange('projectId', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {filteredProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                      errors.dueDate ? 'border-destructive' : ''
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={handleDueDateChange}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate}</p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2 h-10">
                  <Checkbox
                    id="completed"
                    checked={formData.completed}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('completed', checked as boolean)
                    }
                  />
                  <Label htmlFor="completed">Mark as completed</Label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/reminders')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Reminder' : 'Add Reminder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;
