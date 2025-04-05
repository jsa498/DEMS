# DEMS Database Schema

## Overview
This document outlines the complete database schema for the DevFlow Employee Management System (DEMS), including table structures, relationships, and database-level functionality.

## Tables

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  hashed_pin VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sales', 'engineer')),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  profile_image_url TEXT
);
```

### Teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('sales', 'engineering')),
  description TEXT,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### Prospects
```sql
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  details JSONB NOT NULL,
  potential_value DECIMAL(12,2),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  sales_employee_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_notes TEXT,
  admin_id UUID REFERENCES users(id)
);
```

### Clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  details JSONB NOT NULL,
  sales_employee_id UUID REFERENCES users(id) NOT NULL,
  prospect_id UUID REFERENCES prospects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  total_value DECIMAL(12,2) DEFAULT 0
);
```

### Sales
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  sales_employee_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  commission DECIMAL(12,2)
);
```

### Projects (for Engineering Team)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  client_id UUID REFERENCES clients(id),
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Project_Engineers
```sql
CREATE TABLE project_engineers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  engineer_id UUID REFERENCES users(id) NOT NULL,
  hours_logged DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, engineer_id)
);
```

### Activities
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  entity_type VARCHAR(20),
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  link TEXT
);
```

## Relationships
- Users belong to Teams (many-to-one)
- Teams can have a manager from Users (one-to-one)
- Prospects are created by Sales users (many-to-one)
- Clients come from approved Prospects (one-to-one)
- Sales records are tied to Clients and Sales users (many-to-one)
- Projects can be assigned to multiple Engineers (many-to-many via Project_Engineers)
- Activities track actions by Users on various entities
- Notifications are sent to specific Users

## Indexes
```sql
-- Improve lookup performance
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_prospects_sales_employee_id ON prospects(sales_employee_id);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_clients_sales_employee_id ON clients(sales_employee_id);
CREATE INDEX idx_sales_sales_employee_id ON sales(sales_employee_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
```

## Triggers and Functions
```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_prospects_timestamp
BEFORE UPDATE ON prospects
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Log activity on prospect status change
CREATE OR REPLACE FUNCTION log_prospect_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO activities (user_id, activity_type, description, entity_type, entity_id)
    VALUES (NEW.admin_id, 'status_change', 'Prospect status changed from ' || OLD.status || ' to ' || NEW.status, 'prospect', NEW.id);
    
    -- Create notification for sales employee
    INSERT INTO notifications (user_id, title, message, link)
    VALUES (
      NEW.sales_employee_id, 
      'Prospect Status Update', 
      'Your prospect ' || NEW.name || ' has been ' || NEW.status, 
      '/prospects/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospect_status_change
AFTER UPDATE ON prospects
FOR EACH ROW EXECUTE PROCEDURE log_prospect_status_change();
```

## Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example policies (to be expanded based on actual auth implementation)
CREATE POLICY admin_all_access ON users TO authenticated
USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY sales_view_own_prospects ON prospects TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  OR
  sales_employee_id = auth.uid()
);
```

## Notes
- The schema uses UUID for IDs to ensure global uniqueness and security
- JSONB type is used for flexible detailed information
- Timestamps use WITH TIME ZONE for global time consistency
- Row Level Security will be configured based on user roles and teams
- Triggers automate activity logging and notification creation
- Additional indexes may be added based on query performance analysis 