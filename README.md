# Medication Adherence Tracking System

A comprehensive system for tracking medication adherence, sending reminders, and analyzing patterns.

## Features

- **User Management**: Registration, authentication, and user profiles
- **Medication Management**: Track medications with detailed information
- **Reminder System**: Email notifications for medication doses
- **Adherence Tracking**: Log and monitor medication intake
- **Adherence Analytics**: Visualize adherence patterns and get insights

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Email Service**: Supabase Email
- **Frontend**: React, Tailwind CSS
- **State Management**: React Context API
- **Data Visualization**: Chart.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Supabase Account

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env` file
4. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
NODE_ENV=development

# Client-side variables (must be prefixed with VITE_)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

This project is licensed under the MIT License.