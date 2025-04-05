# DevFlow Employee Management System (DEMS)

## Project Overview
DEMS is a comprehensive employee and client management system designed for software development companies. It enables efficient tracking of sales prospects, client conversion, and employee performance across both sales and engineering teams.

## Core Features
- Custom username/PIN authentication system
- Role-based dashboards (Admin, Sales, Engineering)
- Team management and organization
- Prospect and client tracking workflow
- Performance leaderboards for different teams
- Analytics and reporting capabilities

## Technology Stack
- **Frontend**: Next.js, React, TypeScript, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom implementation with Supabase
- **State Management**: React Context/Hooks
- **UI**: Always use ShadCN UI
- **Charts/Visualization**: ShadCN UI maybe Recharts or similar library

## Project Phases

### [Phase 1: Project Foundation & Custom Authentication](./phase1-foundation-auth.md)
Sets up the project structure and implements the custom username/PIN authentication system.

### [Phase 2: Admin Dashboard & Team Management](./phase2-admin-dashboard.md)
Creates the admin dashboard with team management capabilities, employee registration, and statistics visualization.

### [Phase 3: Employee Dashboards & Prospect Management](./phase3-employee-dashboards.md)
Implements role-specific dashboards for sales and engineering employees, with prospect management functionality.

### [Phase 4: Client Workflow & Leaderboards](./phase4-client-workflow-leaderboards.md)
Builds the client approval workflow and team-specific leaderboards to track employee performance.

### [Phase 5: Refinement & Optimization](./phase5-refinement-optimization.md)
Enhances the system with additional features, optimizations, and user experience improvements.

## Database Structure

### Core Tables
- **Users**: Authentication and employee information
- **Teams**: Group organization for employees
- **Prospects**: Potential clients submitted by sales team
- **Clients**: Approved prospects converted to clients
- **Sales**: Records of successful client conversions

## Development Approach
- Mobile-first, responsive design
- Component-based architecture
- Server-side rendering where appropriate
- Optimistic UI updates for improved UX
- Real-time updates using Supabase subscriptions

## Getting Started
This documentation serves as a planning guide for developing the DevFlow Employee Management System. Each phase document outlines specific features, components, and acceptance criteria to guide implementation.

Before beginning development, ensure:
1. Familiarity with the tech stack
2. Supabase project setup completed
3. Development environment configuration
4. Understanding of the phased approach

## Implementation Notes
- Follow Next.js best practices and patterns
- Use TypeScript for type safety throughout
- Implement proper form validation
- Follow the shadcn/ui component design patterns
- Use the shadcn dashboard-01 component (`npx shadcn@latest add dashboard-01`) for all dashboards
- Implement the exact UI as shown in the dashboard-01 example with stat cards, area charts, and data tables
- Maintain the clean, modern aesthetic with dark theme from the dashboard-01 example
- Create reusable custom hooks for shared logic
- Implement proper error handling throughout 