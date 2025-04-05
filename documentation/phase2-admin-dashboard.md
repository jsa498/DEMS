# Phase 2: Admin Dashboard & Team Management

## Overview
Phase 2 focuses on building the admin dashboard with team management capabilities, including employee registration and statistics visualization.

## Features
- Admin dashboard with key metrics and stat cards
- Team creation and management
- Employee registration system
- Prospect and project tracking with status indicators
- Performance visualization

## Dashboard Components
### Stat Cards (4 total)
1. **Active Employees**: 
   - Count of all active employees
   - Toggle between Sales/Engineering/All
   - Clicking opens detailed employee list modal

2. **Teams**: 
   - Count of active teams
   - Clicking opens teams management modal

3. **Pending Prospects**:
   - Count of prospects awaiting approval
   - Clicking opens prospect review page

4. **Approved Clients**:
   - Count of confirmed clients
   - Clicking opens client management page

### Dashboard Table/Outline Section
- Interactive table to track and manage:
  - Prospects with status indicators (In Process, Done)
  - Client projects with reviewers assigned
  - Sales performance metrics with targets and limits
- Customizable columns with sorting and filtering
- Status indicators showing progress (In Process, Done)
- Section types (Narrative, Technical content)
- Reviewer assignments and tracking

### Performance Graph
- Visual representation of team performance
- Toggleable between teams
- Time period selection (week/month/quarter/year)
- Metrics display (sales closed, prospects submitted)

## Database Extensions
- **Teams**:
  - id
  - name
  - type (sales/engineering)
  - created_at
  - description
  - manager_id (optional)

## Admin Functions
- Create/edit/delete teams
- Register new employees with:
  - Name (used as username)
  - PIN assignment
  - Role selection
  - Team assignment
- View and filter employee list
- Track activity logs

## UI Implementation
- Use shadcn dashboard-01 component (`npx shadcn@latest add dashboard-01`) for the admin dashboard UI
- Implement the exact UI as shown in the dashboard-01 example with:
  - Stat cards with metrics, trend indicators, and descriptive text
  - Area chart visualization for visitor/performance data
  - Time period filters (Last 3 months, Last 30 days, Last 7 days)
  - Table with status indicators and progress tracking
- Responsive dashboard layout
- Stat cards with hover effects and click interactions
- Interactive data visualization using charts
- Real-time updates using Supabase subscriptions
- Modal dialogs for detailed views and actions

## Acceptance Criteria
- Admin can view all four stat cards with accurate counts
- Clicking stat cards opens detailed modals with relevant data
- Admin can create, edit, and delete teams
- Admin can register new employees with all required information
- Dashboard Table/Outline section displays prospects and projects with correct statuses
- Table columns can be customized and filtered
- Status indicators accurately reflect current progress
- Performance graph displays data accurately with proper filtering options
- All admin actions are properly logged 