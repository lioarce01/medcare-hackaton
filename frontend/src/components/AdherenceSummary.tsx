import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdherenceSummaryProps {
  stats: {
    adherenceRate: number;
    taken: number;
    skipped: number;
    total: number;
  };
}

export const AdherenceSummary: React.FC<AdherenceSummaryProps> = ({ stats }) => {
  const { t } = useTranslation();

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getAdherenceText = (rate: number) => {
    if (rate >= 90) return t('adherence.summary.status.excellent');
    if (rate >= 70) return t('adherence.summary.status.good');
    if (rate >= 50) return t('adherence.summary.status.fair');
    return t('adherence.summary.status.needs_improvement');
  };
  
  const adherenceColor = getAdherenceColor(stats.adherenceRate);
  const adherenceText = getAdherenceText(stats.adherenceRate);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('adherence.summary.title')}</h3>
      
      <div className="flex flex-col md:flex-row">
        {/* Adherence Rate */}
        <div className="flex-1 mb-6 md:mb-0">
          <div className="flex items-center justify-center flex-col">
            <div className="relative mb-2">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#e5e7eb" 
                  strokeWidth="12" 
                  fill="none" 
                />
                
                {/* Progress circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke={adherenceColor.replace('bg-', 'text-')} 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${stats.adherenceRate * 2.51} 251`} 
                  strokeDashoffset="0" 
                  transform="rotate(-90 50 50)"
                  className={adherenceColor.replace('bg-', 'text-')}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-800">
                  {Math.round(stats.adherenceRate)}%
                </span>
                <span className="text-sm text-gray-500">{t('adherence.summary.adherence')}</span>
              </div>
            </div>
            <div className={`mt-2 px-3 py-1 rounded-full text-white text-sm font-medium ${adherenceColor}`}>
              {adherenceText}
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Taken */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <h4 className="text-gray-700 font-medium">{t('adherence.summary.stats.taken')}</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.taken}</p>
            <p className="text-sm text-gray-500">{t('adherence.summary.stats.doses')}</p>
          </div>
          
          {/* skipped */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2">
              <XCircle className="text-red-500 mr-2" size={20} />
              <h4 className="text-gray-700 font-medium">{t('adherence.summary.stats.skipped')}</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.skipped}</p>
            <p className="text-sm text-gray-500">{t('adherence.summary.stats.doses')}</p>
          </div>
          
          {/* Total */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2">
              <AlertTriangle className="text-blue-500 mr-2" size={20} />
              <h4 className="text-gray-700 font-medium">{t('adherence.summary.stats.total')}</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500">{t('adherence.summary.stats.scheduled')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};