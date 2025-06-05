import React, { useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdherenceSummaryProps } from '../types/ui_types';

// Memoize the adherence color calculation
const getAdherenceColor = (rate: number) => {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Memoize the adherence text calculation
const getAdherenceText = (rate: number, t: (key: string) => string) => {
  if (rate >= 90) return t('adherence.summary.status.excellent');
  if (rate >= 70) return t('adherence.summary.status.good');
  if (rate >= 50) return t('adherence.summary.status.fair');
  return t('adherence.summary.status.needs_improvement');
};

// Memoize the stats card component
const StatsCard = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  bgColor, 
  textColor, 
  borderColor 
}: { 
  icon: React.ElementType;
  title: string;
  value: number;
  subtitle: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}) => (
  <div className={`${bgColor} border ${borderColor} rounded-lg p-4 flex flex-col items-center justify-center`}>
    <div className="flex items-center mb-2">
      <Icon className={`${textColor} mr-2`} size={20} />
      <h4 className="text-gray-700 font-medium">{title}</h4>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
));

export const AdherenceSummary: React.FC<AdherenceSummaryProps> = ({
  adherenceRate,
  totalDoses,
  takenDoses,
  streakDays,
}) => {
  const { t } = useTranslation();

  const adherenceColor = useMemo(() => getAdherenceColor(adherenceRate), [adherenceRate]);
  const adherenceText = useMemo(() => getAdherenceText(adherenceRate, t), [adherenceRate, t]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adherence.summary.title')}</h3>
      
      {/* Status Indicators */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{t('adherence.summary.adherence')}</span>
            <div className={`w-3 h-3 rounded-full ${adherenceColor}`}></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{adherenceRate}%</p>
          <p className="text-sm text-gray-500">{adherenceText}</p>
        </div>

        <StatsCard
          icon={CheckCircle}
          title={t('adherence.summary.stats.taken')}
          value={takenDoses}
          subtitle={t('adherence.summary.stats.doses')}
          bgColor="bg-green-50"
          textColor="text-green-600"
          borderColor="border-green-100"
        />

        <StatsCard
          icon={XCircle}
          title={t('adherence.summary.stats.skipped')}
          value={totalDoses - takenDoses}
          subtitle={t('adherence.summary.stats.doses')}
          bgColor="bg-red-50"
          textColor="text-red-600"
          borderColor="border-red-100"
        />

        <StatsCard
          icon={AlertTriangle}
          title={t('adherence.summary.stats.total')}
          value={totalDoses}
          subtitle={t('adherence.summary.stats.scheduled')}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
          borderColor="border-yellow-100"
        />
      </div>
    </div>
  );
};