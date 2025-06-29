import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white duration-200 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};