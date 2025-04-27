# FreelanceFlow CRM

A modern, responsive CRM system built for freelancers to manage clients, projects, and reminders efficiently.

## Features

- **Dashboard**: Get a quick overview of your business metrics and upcoming tasks
- **Client Management**: Track and manage client information and interactions
- **Project Management**: Create and track projects with status, budget, and deadlines
- **Reminder System**: Set and manage reminders for important tasks and deadlines
- **Dark/Light Theme**: Built-in theme switching for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context + React Query
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Forms & Validation**: Zod
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Notifications**: Sonner
- **Build Tool**: Vite

## Prerequisites

- Node.js 16.x or higher
- npm or bun package manager

## Getting Started

1. Clone the repository:
```bash
git clone <https://github.com/Plabss/crm_frontend.git>
cd crm-frontend
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layouts/       # Layout components
│   ├── shared/        # Shared components
│   └── ui/           # UI component library
├── contexts/          # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Page components
│   ├── clients/      # Client-related pages
│   ├── projects/     # Project-related pages
│   └── reminders/    # Reminder-related pages
├── services/         # API service layers
└── types/            # TypeScript type definitions
```

## Features in Detail

### Authentication
- User registration and login
- Protected routes
- JWT-based authentication
- Persistent sessions

### Client Management
- Create, view, edit, and delete clients
- Track client contact information
- View client-associated projects and reminders
- Client notes and details

### Project Management
- Create and manage projects
- Track project status (Planned, In Progress, On Hold, Completed, Cancelled)
- Budget tracking
- Project deadlines
- Associate projects with clients

### Reminder System
- Create time-sensitive reminders
- Associate reminders with clients or projects
- Mark reminders as complete
- Filter reminders by status and due date

### Dashboard
- Overview of key metrics
- Project status distribution
- Recent client activity
- Upcoming reminders
- Quick action buttons

## Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5050/api
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
