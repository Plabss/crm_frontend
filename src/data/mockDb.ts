import { v4 as uuidv4 } from 'uuid';
import { Client, Project, Reminder, DashboardSummary, ProjectStatus } from '../types';

// Mock delay to simulate API calls
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Helper to create timestamps for createdAt fields
const getCreatedAt = () => new Date().toISOString();

// Mock database for development
const mockDb = {
  clients: [
    {
      id: uuidv4(),
      userId: '1',
      name: 'Acme Corp',
      email: 'info@acme.com',
      phone: '123-456-7890',
      company: 'Acme Corporation',
      notes: 'Long-term client',
      createdAt: getCreatedAt()
    },
    {
      id: uuidv4(),
      userId: '1', 
      name: 'Beta Co',
      email: 'contact@beta.com',
      phone: '987-654-3210',
      company: 'Beta Company',
      notes: 'New client',
      createdAt: getCreatedAt()
    }
  ],
  projects: [
    {
      id: uuidv4(),
      userId: '1',
      clientId: '1',
      title: 'Website Redesign',
      description: 'Redesign Acme Corp website',
      status: 'in_progress',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      createdAt: getCreatedAt()
    },
    {
      id: uuidv4(),
      userId: '1',
      clientId: '2',
      title: 'Mobile App Development',
      description: 'Develop mobile app for Beta Co',
      status: 'planned',
      startDate: '2024-02-15',
      endDate: '2024-05-30',
      createdAt: getCreatedAt()
    },
    {
      id: uuidv4(),
      userId: '1',
      clientId: '1',
      title: 'New CRM',
      description: 'Acme Corp new CRM',
      status: 'completed',
      startDate: '2023-01-01',
      endDate: '2023-03-31',
      createdAt: getCreatedAt()
    }
  ],
  reminders: [
    {
      id: uuidv4(),
      userId: '1',
      clientId: '1',
      projectId: '1',
      title: 'Follow up on proposal',
      description: 'Send a follow-up email regarding the website redesign proposal',
      dueDate: '2024-02-10',
      completed: false,
      createdAt: getCreatedAt()
    },
    {
      id: uuidv4(),
      userId: '1',
      clientId: '2',
      projectId: '2',
      title: 'Discuss project timeline',
      description: 'Schedule a meeting to discuss the mobile app development timeline',
      dueDate: '2024-02-01',
      completed: false,
      createdAt: getCreatedAt()
    },
    {
      id: uuidv4(),
      userId: '1',
      clientId: '1',
      projectId: '1',
      title: 'Final reminder',
      description: 'Final reminder',
      dueDate: '2023-01-01',
      completed: false,
      createdAt: getCreatedAt()
    }
  ],
  interactions: [
    {
      id: uuidv4(),
      userId: '1',
      clientId: '1',
      projectId: '1',
      type: 'email',
      date: '2024-01-25',
      notes: 'Sent initial proposal',
      createdAt: getCreatedAt()
    },
    {
      id: uuidv4(),
      userId: '1',
      clientId: '2',
      projectId: '2',
      type: 'phone',
      date: '2024-01-28',
      notes: 'Discussed project requirements',
      createdAt: getCreatedAt()
    }
  ]
};

export const clientService = {
  getAll: async (userId: string): Promise<Client[]> => {
    await mockDelay();
    return mockDb.clients.filter(client => client.userId === userId);
  },

  getById: async (id: string, userId: string): Promise<Client> => {
    await mockDelay();
    const client = mockDb.clients.find(client => client.id === id && client.userId === userId);
    if (!client) {
      throw new Error("Client not found");
    }
    return client;
  },

  create: async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    await mockDelay();
    const newClient = {
      id: uuidv4(),
      ...clientData,
      createdAt: getCreatedAt()
    };
    mockDb.clients.push(newClient);
    return newClient;
  },

  update: async (id: string, userId: string, clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>): Promise<Client> => {
    await mockDelay();
    const clientIndex = mockDb.clients.findIndex(client => client.id === id && client.userId === userId);
    if (clientIndex === -1) {
      throw new Error("Client not found");
    }
    const client = mockDb.clients[clientIndex];
    const updatedClient: Client = {
      ...client,
      ...clientData,
      id,
      userId
    };
    mockDb.clients[clientIndex] = updatedClient;
    return updatedClient;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    await mockDelay();
    const initialLength = mockDb.clients.length;
    mockDb.clients = mockDb.clients.filter(client => client.id !== id || client.userId !== userId);
    return mockDb.clients.length < initialLength;
  }
};

export const projectService = {
  getAll: async (userId: string): Promise<Project[]> => {
    await mockDelay();
    return mockDb.projects.filter(project => project.userId === userId);
  },
  getById: async (id: string, userId: string): Promise<Project> => {
    await mockDelay();
    const project = mockDb.projects.find(project => project.id === id && project.userId === userId);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  },
  getByClient: async (clientId: string, userId: string): Promise<Project[]> => {
    await mockDelay();
    return mockDb.projects.filter(project => project.clientId === clientId && project.userId === userId);
  },
  create: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    await mockDelay();
    const newProject = {
      id: uuidv4(),
      ...projectData,
      createdAt: getCreatedAt()
    };
    mockDb.projects.push(newProject);
    return newProject;
  },
  update: async (id: string, projectData: Omit<Project, 'id'>, userId: string): Promise<Project> => {
    await mockDelay();
    const projectIndex = mockDb.projects.findIndex(project => project.id === id && project.userId === userId);
    if (projectIndex === -1) {
      throw new Error("Project not found");
    }
    const updatedProject = { id, ...projectData, userId };
    mockDb.projects[projectIndex] = updatedProject;
    return updatedProject;
  },
  delete: async (id: string, userId: string): Promise<boolean> => {
    await mockDelay();
    const initialLength = mockDb.projects.length;
    mockDb.projects = mockDb.projects.filter(project => project.id !== id || project.userId !== userId);
    return mockDb.projects.length < initialLength;
  },
};

export const reminderService = {
  getAll: async (userId: string): Promise<Reminder[]> => {
    await mockDelay();
    return mockDb.reminders.filter(reminder => reminder.userId === userId);
  },
  getUpcoming: async (userId: string): Promise<Reminder[]> => {
    await mockDelay();
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return mockDb.reminders.filter(reminder => 
      reminder.userId === userId && 
      new Date(reminder.dueDate) <= sevenDaysLater && 
      new Date(reminder.dueDate) >= now
    );
  },
  getByClient: async (clientId: string, userId: string): Promise<Reminder[]> => {
    await mockDelay();
    return mockDb.reminders.filter(reminder => reminder.clientId === clientId && reminder.userId === userId);
  },
  getByProject: async (projectId: string, userId: string): Promise<Reminder[]> => {
    await mockDelay();
    return mockDb.reminders.filter(reminder => reminder.projectId === projectId && reminder.userId === userId);
  },
  create: async (reminderData: Omit<Reminder, 'id'>): Promise<Reminder> => {
    await mockDelay();
    const newReminder = {
      id: uuidv4(),
      ...reminderData,
      createdAt: getCreatedAt()
    };
    mockDb.reminders.push(newReminder);
    return newReminder;
  },
  update: async (id: string, reminderData: Omit<Reminder, 'id'>, userId: string): Promise<Reminder> => {
    await mockDelay();
    const reminderIndex = mockDb.reminders.findIndex(reminder => reminder.id === id && reminder.userId === userId);
    if (reminderIndex === -1) {
      throw new Error("Reminder not found");
    }
    const updatedReminder = { id, ...reminderData, userId };
    mockDb.reminders[reminderIndex] = updatedReminder;
    return updatedReminder;
  },
  delete: async (id: string, userId: string): Promise<boolean> => {
    await mockDelay();
    const initialLength = mockDb.reminders.length;
    mockDb.reminders = mockDb.reminders.filter(reminder => reminder.id !== id || reminder.userId !== userId);
    return mockDb.reminders.length < initialLength;
  },
  getById: async (id: string, userId: string): Promise<Reminder> => {
    await mockDelay();
    const reminder = mockDb.reminders.find(r => r.id === id && r.userId === userId);
    if (!reminder) {
      throw new Error("Reminder not found");
    }
    return reminder;
  },
  toggleComplete: async (id: string, userId: string): Promise<Reminder> => {
    await mockDelay();
    const reminderIndex = mockDb.reminders.findIndex(reminder => reminder.id === id && reminder.userId === userId);
    if (reminderIndex === -1) {
      throw new Error("Reminder not found");
    }
    const reminder = mockDb.reminders[reminderIndex];
    const updatedReminder = { ...reminder, completed: !reminder.completed };
    mockDb.reminders[reminderIndex] = updatedReminder;
    return updatedReminder;
  },
};

// export const dashboardService = {
//   getSummary: async (userId: string): Promise<DashboardSummary> => {
//     await mockDelay();

//     // Fetch all relevant data
//     const clients = await clientService.getAll(userId);
//     const projects = await projectService.getAll(userId);
//     const reminders = await reminderService.getUpcoming(userId);

//     // Calculate projects by status
//     const projectsByStatus = projects.reduce((acc: Record<ProjectStatus, number>, project) => {
//       acc[project.status] = (acc[project.status] || 0) + 1;
//       return acc;
//     }, {} as Record<ProjectStatus, number>);

//     // Construct and return the dashboard summary
//     return {
//       totalClients: clients.length,
//       totalProjects: projects.length,
//       upcomingReminders: reminders,
//       projectsByStatus: projectsByStatus,
//     };
//   },
// };

