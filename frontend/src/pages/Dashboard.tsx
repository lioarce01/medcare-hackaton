import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, PlusCircle, TrendingUp, Target, Award } from 'lucide-react';
import { AdherenceSummary } from '../components/AdherenceSummary';
import { MedicationList } from '../components/MedicationList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime } from '../utils/formatters';
import { useUser } from '../hooks/useUser';
import { useConfirmDose, useGetAdherenceHistory, useSkipDose } from '../hooks/useAdherence';
import { useActiveMedications } from '../hooks/useMedications';
import { useGetAnalyticsStats } from '../hooks/useAnalytics';
import { useTranslation } from 'react-i18next';

interface TodayDose {
  id: string;
  medication: {
    id: string;
    name: string;
    dosage: {
      amount: number;
      unit: string;
    };
    instructions: string;
    imageUrl?: string;
  };
  scheduled_time: string;
  status: 'pending' | 'taken' | 'skipped';
  taken_time?: string;
}

export const Dashboard: React.FC = () => {
  const { data: user } = useUser();
  const [processingDose, setProcessingDose] = useState<string | null>(null);
  const { t } = useTranslation();

  const { mutate: confirmDose } = useConfirmDose();
  const { mutate: skipDose } = useSkipDose()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const { data: adherenceRecords = [], isLoading: isLoadingAdherence, error: adherenceError } = useGetAdherenceHistory(today);
  const { data: activeMedications = [], isLoading: isLoadingMeds, error: medsError } = useActiveMedications();
  const { data: analyticsData = [], isLoading: isLoadingAnalytics, error: analyticsError } = useGetAnalyticsStats();

  const isLoading = isLoadingAdherence || isLoadingMeds || isLoadingAnalytics;
  const error = adherenceError || medsError || analyticsError;

  const transformedMedications = activeMedications.map((med: any) => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    scheduled_times: med.scheduled_times ?? [],
    frequency: med.frequency ?? { times_per_day: 1, specific_days: [] },
    instructions: med.instructions ?? '',
    active: med.active ?? true,
    medication_type: med.medication_type ?? 'prescription',
    image_url: med.image_url ?? '',
  }));

  // Use adherenceRecords as todayDoses
  const todayDoses: TodayDose[] = adherenceRecords.map((record: any) => ({
    id: record.id,
    medication: {
      id: record.medication?.id || '',
      name: record.medication?.name || '',
      dosage: record.medication?.dosage || { amount: 0, unit: '' },
      instructions: record.medication?.instructions || '',
      imageUrl: record.medication?.image_url || record.medication?.imageUrl,
    },
    scheduled_time: record.scheduled_time,
    status: record.status,
    taken_time: record.taken_time,
  }));

  const stats = analyticsData.reduce(
    (acc: any, record: any) => {
      acc.total++;
      if (record.status === 'taken') acc.taken++;
      if (record.status === 'skipped') acc.skipped++;
      return acc;
    },
    { total: 0, taken: 0, skipped: 0 }
  );

  const adherenceStats = {
    overall: {
      ...stats,
      adherenceRate: stats.total > 0 ? (stats.taken / stats.total) * 100 : 0,
    },
  };

  const handleConfirmDose = (recordId: string) => {
    setProcessingDose(recordId);

    confirmDose(recordId, {
      onSettled: () => {
        setProcessingDose(null);
      },
    });
  };

  const handleSkipDose = (recordId: string) => {
    setProcessingDose(recordId)

    skipDose(recordId, {
      onSettled: () => {
        setProcessingDose(null)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-indigo-600 font-medium">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  // Get pending doses
  const pendingDoses = todayDoses.filter(dose => dose.status === 'pending');
  const upcomingDoses = [...pendingDoses].sort((a, b) => {
    return a.scheduled_time.localeCompare(b.scheduled_time);
  });

  // Get taken, skipped, and skipped doses
  const completedDoses = todayDoses.filter(dose => dose.status !== 'pending');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetings.morning');
    if (hour < 17) return t('dashboard.greetings.afternoon');
    return t('dashboard.greetings.evening');
  };

  const getTodayProgress = () => {
    const total = todayDoses.length;
    const completed = todayDoses.filter(dose => dose.status === 'taken').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const nextDose = upcomingDoses[0];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {getGreeting()}, {user?.name || 'there'}!
              </h1>
              <p className="text-gray-600">
                {upcomingDoses.length > 0 
                  ? t('dashboard.header.medications_scheduled', { 
                      count: upcomingDoses.length,
                      plural: upcomingDoses.length === 1 ? '' : 's'
                    })
                  : t('dashboard.header.all_completed')
                }
              </p>
            </div>
            <Link 
              to="/medications/add" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusCircle className="mr-2 group-hover:rotate-90 transition-transform duration-200" size={20} />
              {t('dashboard.header.add_medication')}
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm animate-pulse">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {(error as Error)?.message || "Unexpected error"}
              </div>
            </div>
          )}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.today_progress')}</p>
                  <p className="text-3xl font-bold text-blue-600">{getTodayProgress()}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getTodayProgress()}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.overall_adherence')}</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(adherenceStats.overall.adherenceRate)}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {t('dashboard.stats.doses_taken', {
                  taken: adherenceStats.overall.taken,
                  total: adherenceStats.overall.total
                })}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.stats.active_medications')}</p>
                  <p className="text-3xl font-bold text-purple-600">{transformedMedications.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{t('dashboard.stats.currently_managing')}</p>
            </div>
          </div>

          {/* Next Dose Alert */}
          {nextDose && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t('dashboard.next_dose.title')}</h3>
                    <p className="text-blue-100">
                      {nextDose.medication.name} • {formatTime(nextDose.scheduled_time)}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex space-x-3">
                  <button
                    onClick={() => handleConfirmDose(nextDose.id)}
                    disabled={processingDose === nextDose.id}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 disabled:opacity-50"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    {t('dashboard.next_dose.take_now')}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Adherence Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <AdherenceSummary stats={adherenceStats.overall} />
          </div>
          
          {/* Today's Schedule */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center">
                <Calendar className="mr-3 text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.schedule.title')}</h2>
              </div>
            </div>
            
            <div className="p-6">
              {upcomingDoses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <p className="text-gray-600 text-lg">{t('dashboard.schedule.all_completed.title')}</p>
                  <p className="text-gray-500 mt-2">{t('dashboard.schedule.all_completed.subtitle')}</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingDoses.map(dose => (
                    <div key={dose.id} className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {dose.medication.name}
                          </h3>
                          <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            <Clock className="mr-1" size={16} />
                            <span className="font-semibold text-sm">{formatTime(dose.scheduled_time)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-gray-700">
                            <span className="font-medium text-lg">
                              {dose.medication.dosage.amount} {dose.medication.dosage.unit}
                            </span>
                          </div>
                          
                          {dose.medication.instructions && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600 italic">
                                {t('dashboard.schedule.medication.instructions', {
                                  instructions: dose.medication.instructions
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleConfirmDose(dose.id)}
                            disabled={processingDose === dose.id}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                          >
                            {processingDose === dose.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <CheckCircle className="mr-2" size={18} />
                                {t('dashboard.schedule.medication.take')}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSkipDose(dose.id)}
                            disabled={processingDose === dose.id}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                          >
                            <XCircle className="mr-2" size={18} />
                            {t('dashboard.schedule.medication.skip')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          
          {/* Completed Doses */}
          {completedDoses.length > 0 && (
            <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 text-green-500" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.completed.title')}</h2>
                  <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {completedDoses.length}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.completed.table.medication')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.completed.table.scheduled_time')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.completed.table.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {completedDoses.map(dose => (
                      <tr key={dose.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{dose.medication.name}</div>
                          <div className="text-sm text-gray-500">{dose.medication.dosage.amount} {dose.medication.dosage.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                          {formatTime(dose.scheduled_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {dose.status === 'taken' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="mr-1" size={16} />
                              {t('dashboard.completed.table.taken')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              <XCircle className="mr-1" size={16} />
                              {t('dashboard.completed.table.skipped')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          
          {/* Your Medications */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PlusCircle className="mr-3 text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.medications.title')}</h2>
                  <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {transformedMedications.length}
                  </span>
                </div>
                <Link 
                  to="/medications" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  {t('dashboard.medications.view_all')}
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <MedicationList medications={transformedMedications} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};