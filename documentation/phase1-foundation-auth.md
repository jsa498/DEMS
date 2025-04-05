# Phase 1: Project Foundation & Custom Authentication

## Overview
Phase 1 establishes the project structure and implements a custom username/PIN-based authentication system using Supabase as the backend.

## Features
- Next.js project setup with TypeScript and ShadCN for UI
- Supabase connection configuration
- Custom authentication system with username/PIN
- Role-based access control
- Route protection middleware

## Database Tables
- **Users**: 
  - username (unique)
  - hashed_pin
  - role (admin/sales/engineer)
  - team_id (foreign key)
  - created_at
  - last_login

## Authentication Flow
1. User enters username and PIN
2. Backend validates credentials against database
3. On success, generate JWT token with user role and permissions
4. Store token in secure cookie/local storage
5. Redirect to role-appropriate dashboard

## Default Admin Credentials
The system will be initialized with the following admin account:
- **Username**: jaskaran (case insensitive)
- **PIN**: 8010
- **Role**: admin

## UI Components
- Login page with username/PIN form
- Admin user registration form with role assignment
- Error handling and validation
- Loading states for authentication processes

## Security Considerations
- PIN hashing with bcrypt
- Rate limiting on authentication attempts
- Secure token storage
- Row-level security policies in Supabase

## Acceptance Criteria
- Users can log in with username and PIN
- Invalid credentials show appropriate error messages
- Successful login redirects to correct dashboard based on role
- Admin can register new employees with role assignment
- Authentication state persists across page refreshes
- Secure routes are protected from unauthorized access 