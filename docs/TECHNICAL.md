# Technical Documentation

## Architecture Overview

### Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture. Key architectural decisions include:

1. **State Management**

   - React Query for server state
   - Local state for component-specific data

2. **Routing**

   - React Router v6 for navigation
   - Protected routes with authentication checks
   - Lazy loading for code splitting

3. **Styling**

   - Tailwind CSS for utility-first styling
   - Custom components for reusability
   - Responsive design patterns

4. **Performance Optimizations**
   - Code splitting with dynamic imports
   - Bundle size optimization
   - Image optimization
   - Caching strategies

### Backend Architecture

The backend follows a layered architecture:

1. **Controllers Layer**

   - Request validation
   - Response formatting
   - Error handling

2. **Services Layer**

   - Business logic
   - Data processing
   - External service integration

3. **Data Access Layer**
   - Supabase Client
   - Database queries
   - Real-time subscriptions

## API Documentation

### Supabase Authentication

```typescript
// Sign Up
supabase.auth.signUp({
  email: string,
  password: string,
});

// Sign In
supabase.auth.signInWithPassword({
  email: string,
  password: string,
});

// Sign Out
supabase.auth.signOut();

// Get User
supabase.auth.getUser();
```

### Medication Endpoints

```typescript
// Get all medications
supabase.from("medications").select("*");

// Create medication
supabase.from("medications").insert(medicationData);

// Update medication
supabase.from("medications").update(medicationData).eq("id", id);

// Delete medication
supabase.from("medications").delete().eq("id", id);
```

### Adherence Endpoints

```typescript
// Get adherence records
supabase.from("adherence").select("*");

// Log adherence
supabase.from("adherence").insert(adherenceData);

// Get analytics
supabase
  .from("adherence")
  .select("*")
  .gte("takenAt", startDate)
  .lte("takenAt", endDate);
```

## Database Schema

```sql
-- Users table (managed by Supabase Auth)
create table public.users (
  id uuid references auth.users on delete cascade,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Medications table
create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  dosage text not null,
  frequency text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adherence table
create table public.adherence (
  id uuid default uuid_generate_v4() primary key,
  medication_id uuid references public.medications(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  taken_at timestamp with time zone not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.medications enable row level security;
alter table public.adherence enable row level security;

-- Create policies
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can view own medications" on public.medications
  for select using (auth.uid() = user_id);

create policy "Users can insert own medications" on public.medications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own medications" on public.medications
  for update using (auth.uid() = user_id);

create policy "Users can delete own medications" on public.medications
  for delete using (auth.uid() = user_id);
```

## Security Measures

1. **Authentication**

   - Supabase Auth
   - JWT tokens
   - Session management

2. **Authorization**

   - Row Level Security (RLS)
   - Resource ownership validation
   - API endpoint protection

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF protection

## Performance Monitoring

1. **Sentry Integration**

   - Error tracking
   - Performance monitoring
   - User session tracking

2. **Custom Metrics**
   - API response times
   - Database query performance
   - Client-side performance

## Testing Strategy

1. **Unit Tests**

   - Controller testing

## Deployment

1. **Frontend Deployment**

   - Vite build optimization
   - Static asset handling
   - Environment configuration

2. **Backend Deployment**

   - Node.js server setup
   - Supabase configuration
   - Environment variables

3. **CI/CD Pipeline**
   - Automated testing
   - Build process
   - Deployment automation

## Maintenance

1. **Logging**

   - Error logging
   - Access logging
   - Performance logging

2. **Monitoring**

   - Server health checks
   - Database monitoring
   - Application metrics
   - Database backups
   - Configuration backups
   - Disaster recovery plan
