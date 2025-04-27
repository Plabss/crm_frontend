
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Project, Client, ProjectStatus } from '../../types';
import { z } from 'zod';
import { toast } from 'sonner';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  deadline: z.string().min(1, 'Deadline is required'),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
});

const statusOptions: ProjectStatus[] = [
  'PLANNED', // Changed to uppercase
  'IN_PROGRESS', // Changed to uppercase
  'ON_HOLD', // Changed to uppercase
  'COMPLETED', // Changed to uppercase
  'CANCELLED', // Changed to uppercase
];

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedClientId = queryParams.get('clientId') || '';
  const { user } = useAuth();
  
  const isEditing = Boolean(id);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'userId' | 'createdAt'>>({
    title: '',
    description: '',
    clientId: preselectedClientId,
    budget: 0,
    deadline: new Date().toISOString(),
    status: 'PLANNED',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Fetch all clients
          const clientsData = await clientService.getAll(user.id);
          setClients(clientsData);
          
          // If editing, fetch project data
          if (isEditing && id) {
            const projectData = await projectService.getById(id, user.id);
            if (projectData) {
              // Remove unwanted fields
              const { id, userId, createdAt, ...projectFormData } = projectData;
              setFormData(projectFormData);
              setDeadlineDate(new Date(projectData.deadline));
            } else {
              toast.error('Project not found');
              navigate('/projects');
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'budget') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDeadlineChange = (date: Date | undefined) => {
    if (date) {
      setDeadlineDate(date);
      setFormData((prev) => ({ ...prev, deadline: date.toISOString() }));
      
      // Clear validation error
      if (errors.deadline) {
        setErrors((prev) => ({ ...prev, deadline: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      projectSchema.parse(formData);
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }
      
      if (isEditing && id) {
        // Update existing project
        await projectService.update(id, user.id, formData);
        toast.success('Project updated successfully');
      } else {
        // Create new project
        await projectService.create({
          ...formData,
          userId: user.id,
        });
        toast.success('Project added successfully');
      }
      
      navigate('/projects');
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

  const formatStatus = (status: ProjectStatus): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Project' : 'Add Project'}
        description={isEditing ? 'Update project details' : 'Create a new project'}
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
            <Label htmlFor="clientId">
              Client <span className="text-destructive">*</span>
            </Label>
            {clients.length > 0 ? (
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => handleSelectChange('clientId', value)}
              >
                <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Input disabled placeholder="No clients found" className="flex-1" />
                <Button type="button" onClick={() => navigate('/clients/new')}>
                  Add Client
                </Button>
              </div>
            )}
            {errors.clientId && (
              <p className="text-sm text-destructive">{errors.clientId}</p>
            )}
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  $
                </span>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="1"
                  className={`pl-6 ${errors.budget ? 'border-destructive' : ''}`}
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>
              {errors.budget && (
                <p className="text-sm text-destructive">{errors.budget}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadlineDate && "text-muted-foreground",
                      errors.deadline ? 'border-destructive' : ''
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadlineDate ? format(deadlineDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadlineDate}
                    onSelect={handleDeadlineChange}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.deadline && (
                <p className="text-sm text-destructive">{errors.deadline}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter project details, goals, and scope"
            />
          </div>
          
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
