import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import { projectService } from '../../services/projectService';
import { Project, Client } from '../../types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarIcon, Edit, ListChecks, User2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

// Create ClientLink component for this file
const ClientLink = ({ clientId }: { clientId: string }) => {
  const [client, setClient] = useState<Client | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientData = await clientService.getById(clientId, user.id);
        setClient(clientData);
      } catch (error) {
        console.error('Error fetching client:', error);
      }
    };
    
    fetchClient();
  }, [clientId]);
  
  if (!client) return <span>Loading client...</span>;
  
  return (
    <Link to={`/clients/${client.id}`} className="hover:underline">
      {client.name}
    </Link>
  );
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        try {
          const projectData = await projectService.getById(id, user.id);
          console.log('Project data:', projectData);
          setProject(projectData);
        } catch (error) {
          console.error('Error fetching project:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProject();
  }, [id]);

  if (isLoading) {
    return <div>Loading project details...</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title={project.title}
        description={`Details for project: ${project.title}`}
        actions={
          <Button asChild>
            <Link to={`/projects/${project.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Details about this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Client:</strong> <ClientLink clientId={project.clientId} />
              </p>
              <p>
                <strong>Deadline:</strong> {format(new Date(project.deadline), 'MMM d, yyyy')}
              </p>
              <p>
                <strong>Status:</strong> {project.status.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Project description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{project.description || 'No description available.'}</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>More project specifics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Budget:</strong> ${project.budget.toLocaleString()}
              </p>
              <p>
                <strong>Created:</strong> {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
