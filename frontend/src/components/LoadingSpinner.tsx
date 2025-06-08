import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-indigo-600 mx-auto"/>
        <p className="mt-4 text-indigo-600 font-medium text-lg animate-pulse">
          {t('common.loading')}
        </p>
      </div>
    </div>
  );
};