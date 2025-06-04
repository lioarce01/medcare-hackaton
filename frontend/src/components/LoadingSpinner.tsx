import { Loader2 } from 'lucide-react';
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <Loader2 className="animate-spin rounded-full h-12 w-12 text-indigo-600"/>
    </div>
  );
};