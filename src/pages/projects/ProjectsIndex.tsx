
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { EmptyState } from '../../components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Search, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { clientService } from '../../services/clientService';
import { Project, Client, ProjectStatus } from '../../types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusOptions: ProjectStatus[] = [
  'PLANNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];

const ProjectsIndex: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const projectsData = await projectService.getAll(user.id);
          setProjects(projectsData);
          setFilteredProjects(projectsData);
          
          // Fetch all clients to get their names
          const clientsData = await clientService.getAll(user.id);
          const clientsMap = clientsData.reduce((acc, client) => {
            acc[client.id] = client;
            return acc;
          }, {} as Record<string, Client>);
          setClients(clientsMap);
        } catch (error) {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = [...projects];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        (clients[project.clientId]?.name.toLowerCase().includes(query))
      );
    }
    
    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, projects, clients]);

  const formatDateString = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
  };

  const formatStatus = (status: ProjectStatus): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColorClass = (status: ProjectStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'planned':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your client projects"
        actions={
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add your first project to get started"
          icon={<Calendar size={24} className="text-muted-foreground" />}
          action={{
            label: 'Add Project',
            href: '/projects/new',
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 mb-6 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Budget</TableHead>
                  <TableHead className="hidden md:table-cell">Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link to={`/projects/${project.id}`} className="hover:underline">
                        {project.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/clients/${project.clientId}`} className="hover:underline">
                        {clients[project.clientId]?.name || 'Unknown Client'}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColorClass(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.budget !== undefined ? `$${project.budget.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.deadline ? formatDateString(project.deadline) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/projects/${project.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsIndex;
