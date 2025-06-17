[![Netlify Status](https://api.netlify.com/api/v1/badges/2620bd12-4eb5-451d-ac75-6b9553ee72fc/deploy-status)](https://app.netlify.com/projects/medcare-hackaton/deploys)

# MedTracker - Medication Adherence Tracking System

A comprehensive medication management and adherence tracking system built with React, TypeScript, and modern web technologies.

## Features

- 📱 **User Authentication**: Secure login and registration system with Supabase Auth
- 💊 **Medication Management**: Add, edit, and track medications
- 📊 **Adherence Analytics**: Visualize medication adherence patterns
- 🔔 **Reminder System**: Smart notifications for medication schedules
- 🌐 **Multi-language Support**: Internationalization with i18n
- ♿ **Accessibility**: WCAG 2.1 compliant
- 📈 **Performance Monitoring**: Real-time error tracking with Sentry

## Tech Stack

- **Frontend**:

  - React 18
  - TypeScript
  - Tailwind CSS
  - React Query
  - React Router
  - i18next
  - Sentry
  - PWA Support

- **Backend**:
  - Supabase
    - Authentication
    - PostgreSQL Database
    - Real-time subscriptions
    - Storage
  - Node.js
  - Express

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase Account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/medtracker.git
   cd medtracker
   ```

2. Install dependencies:

   ```bash
   # Install frontend dependencies
   cd frontend
   pnpm install

   # Install backend dependencies
   cd ../backend
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Frontend (.env)
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SENTRY_DSN=your-sentry-dsn
   VITE_APP_VERSION=1.0.0

   # Backend (.env)
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. Start the development servers:

   ```bash
   # Start backend
   cd backend
   pnpm dev

   # Start frontend (in a new terminal)
   cd frontend
   pnpm dev
   ```

## Project Structure

```
medtracker/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── types/         # TypeScript type definitions
│   │   └── i18n/          # Internationalization files
│   └── public/            # Static assets
└── backend/
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── routes/        # API routes
    │   └── services/      # Business logic
    └── supabase/          # Supabase configuration and migrations
```

## Available Scripts

### Frontend

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm lint` - Run linter
- `pnpm format` - Format code

### Backend

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm supabase:generate` - Generate Supabase types

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Sentry](https://sentry.io/)
- [i18next](https://www.i18next.com/)
