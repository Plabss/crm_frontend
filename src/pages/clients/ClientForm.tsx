import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { clientService } from '../../services/clientService';
import { Client } from '../../types';
import { z } from 'zod';
import { toast } from 'sonner';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
  notes: z.string().optional(),
});

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('User from context:', user);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'userId' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (isEditing && user && id) {
        setIsLoading(true);
        try {
          const data = await clientService.getById(id, user.id);
          if (data) {
            // Remove unwanted fields
            const { id, userId, createdAt, ...clientData } = data;
            setFormData(clientData);
          } else {
            toast.error('Client not found');
            navigate('/clients');
          }
        } catch (error) {
          console.error('Error fetching client:', error);
          toast.error('Error loading client data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClient();
  }, [isEditing, user, id, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      clientSchema.parse(formData);
      
      if (!user) {
        toast.error('You must be logged in');
        return;
      }
      
      if (isEditing && id) {
        // Update existing client
        await clientService.update(id, user.id, formData);
        toast.success('Client updated successfully');
      } else {
        // Create new client
        await clientService.create({
          ...formData,
          userId: user.id,
        });
        toast.success('Client added successfully');
      }
      
      navigate('/clients');
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
          <p className="mt-4 text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Client' : 'Add Client'}
        description={isEditing ? 'Update client information' : 'Create a new client'}
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Add any additional information about this client"
            />
          </div>
          
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clients')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
