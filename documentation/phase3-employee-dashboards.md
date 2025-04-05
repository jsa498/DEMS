# Phase 3: Employee Dashboards & Prospect Management

## Overview
Phase 3 implements role-specific dashboards for sales and engineering employees, with prospect management functionality for the sales team.

## Features
- Role-specific dashboards (Sales/Engineering)
- Prospect creation and management
- Personal performance tracking
- Team leaderboards
- Prospect/project tracking with status indicators

## Sales Employee Dashboard
### Stat Cards
1. **My Prospects**:
   - Count of prospects submitted by the employee
   - Status breakdown (pending/approved/rejected)
   - Clicking opens detailed prospect list

2. **My Clients**:
   - Count of approved clients from employee's prospects
   - Clicking opens detailed client list

3. **Conversion Rate**:
   - Percentage of prospects converted to clients
   - Comparison to team average

4. **Team Ranking**:
   - Current position on sales leaderboard
   - Change indicator from previous period

### Dashboard Table/Outline Section
- Interactive table for prospect tracking with:
  - Prospect company names with checkboxes for selection
  - Section types (potential client, active negotiation, etc.)
  - Status indicators (In Process, Done)
  - Target values and limits
  - Assigned reviewer/manager
- Customizable columns with filtering options
- Progress tracking for each prospect

### Personal Performance Graph
- Historical performance over time
- Prospects submitted vs clients converted
- Comparison to personal targets
- Time period selection

## Engineering Employee Dashboard
### Stat Cards
1. **My Projects**:
   - Count of assigned projects
   - Status breakdown (in progress/completed)
   - Clicking opens project details

2. **Project Completion Rate**:
   - Percentage of completed projects
   - Comparison to team average

3. **Hours Logged**:
   - Total hours logged on projects
   - Comparison to targets

4. **Team Ranking**:
   - Current position on engineering leaderboard
   - Change indicator from previous period

### Dashboard Table/Outline Section
- Interactive table for project tracking with:
  - Project names with checkboxes for selection
  - Section types (design, development, testing)
  - Status indicators (In Process, Done)
  - Target completion dates and hour limits
  - Team member assignments
- Customizable columns with filtering options
- Progress tracking for each project or task

### Personal Performance Graph
- Historical performance metrics
- Projects completed over time
- Hours logged vs targets
- Time period selection

## Prospect Management Interface
- Form for creating new prospects with:
  - Company/client name
  - Contact information
  - Project requirements
  - Potential value
  - Notes/additional information
- Prospect listing with filtering and sorting
- Detailed prospect view with status history
- Edit functionality for pending prospects

## Database Extensions
- **Prospects**:
  - id
  - name
  - details (JSON)
  - status (pending/approved/rejected)
  - sales_employee_id
  - created_at
  - updated_at
  - admin_notes (for feedback)

## UI Implementation
- Use shadcn dashboard-01 component (`npx shadcn@latest add dashboard-01`) for employee dashboards
- Adapt the dashboard-01 UI for role-specific dashboards:
  - Implement the same stat card design with role-specific metrics
  - Use the area chart visualization for personal performance data
  - Utilize the same clean, modern aesthetic with dark theme
  - Implement the same time period filters for different data views
- Role-based dashboard rendering
- Interactive stat cards
- Form validation for prospect creation
- Status indicators with appropriate styling
- Personal performance visualizations
- Mobile-responsive layouts

## Acceptance Criteria
- Sales employees can create and manage prospects
- Engineering employees can view their project metrics
- Both roles have personalized dashboards with relevant stat cards
- Personal performance graphs accurately reflect individual metrics
- Dashboard Table/Outline sections show relevant prospects/projects with proper status indicators
- Table view allows effective tracking and management of items
- Status indicators accurately reflect current progress
- All forms include proper validation and error handling
- Dashboards update in real-time when data changes 