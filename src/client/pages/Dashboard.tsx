import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, PlusCircle, TrendingUp, Target, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardCard } from '../components/DashboardCard';
import { AdherenceSummary } from '../components/AdherenceSummary';
import { MedicationList } from '../components/MedicationList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime } from '../utils/formatters';
import { medicationApi, adherenceApi, analyticsApi } from '../utils/api';

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
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  taken_time?: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayDoses, setTodayDoses] = useState<TodayDose[]>([]);
  const [activeMedications, setActiveMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adherenceStats, setAdherenceStats] = useState({
    overall: { adherenceRate: 0, taken: 0, missed: 0, total: 0 }
  });
  const [processingDose, setProcessingDose] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's adherence records
        const { data: todayData } = await adherenceApi.getHistory(today);
        setTodayDoses(todayData || []);
        
        // Fetch active medications
        const { data: medicationsData } = await medicationApi.getActive();
        setActiveMedications(medicationsData || []);
        
        // Calculate adherence stats
        const { data: statsData } = await analyticsApi.getStats();

        const stats = statsData?.reduce((acc: any, record: any) => {
          acc.total++;
          if (record.status === 'taken') acc.taken++;
          if (record.status === 'missed') acc.missed++;
          return acc;
        }, { total: 0, taken: 0, missed: 0 });

        setAdherenceStats({
          overall: {
            ...stats,
            adherenceRate: stats.total > 0 ? (stats.taken / stats.total) * 100 : 0
          }
        });
        
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const handleConfirmDose = async (doseId: string) => {
    try {
      setProcessingDose(doseId);
      await adherenceApi.confirmDose(doseId);
      
      setTodayDoses(prev => 
        prev.map(dose => 
          dose.id === doseId 
            ? { ...dose, status: 'taken', taken_time: new Date().toISOString() } 
            : dose
        )
      );
    } catch (error: any) {
      console.error('Error confirming dose:', error);
      setError(error.message || 'Failed to confirm dose');
    } finally {
      setProcessingDose(null);
    }
  };

  const handleSkipDose = async (doseId: string) => {
    try {
      setProcessingDose(doseId);
      await adherenceApi.skipDose(doseId);
      
      setTodayDoses(prev => 
        prev.map(dose => 
          dose.id === doseId 
            ? { ...dose, status: 'skipped' } 
            : dose
        )
      );
    } catch (error: any) {
      console.error('Error skipping dose:', error);
      setError(error.message || 'Failed to skip dose');
    } finally {
      setProcessingDose(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Get pending doses
  const pendingDoses = todayDoses.filter(dose => dose.status === 'pending');
  const upcomingDoses = [...pendingDoses].sort((a, b) => {
    return a.scheduled_time.localeCompare(b.scheduled_time);
  });

  // Get taken, missed, and skipped doses
  const completedDoses = todayDoses.filter(dose => dose.status !== 'pending');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTodayProgress = () => {
    const total = todayDoses.length;
    const completed = todayDoses.filter(dose => dose.status === 'taken').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const nextDose = upcomingDoses[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
                  ? `You have ${upcomingDoses.length} medication${upcomingDoses.length === 1 ? '' : 's'} scheduled for today`
                  : 'All medications completed for today! 🎉'
                }
              </p>
            </div>
            <Link 
              to="/medications/add" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusCircle className="mr-2 group-hover:rotate-90 transition-transform duration-200" size={20} />
              Add Medication
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm animate-pulse">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                {error}
              </div>
            </div>
          )}

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Progress</p>
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
                  <p className="text-sm font-medium text-gray-600">Overall Adherence</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(adherenceStats.overall.adherenceRate)}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {adherenceStats.overall.taken} of {adherenceStats.overall.total} doses taken
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Medications</p>
                  <p className="text-3xl font-bold text-purple-600">{activeMedications.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Currently managing</p>
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
                    <h3 className="text-lg font-semibold">Next Medication</h3>
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
                    Take Now
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
                <h2 className="text-2xl font-bold text-gray-800">Today's Schedule</h2>
              </div>
            </div>
            
            <div className="p-6">
              {upcomingDoses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="text-green-600\" size={32} />
                  </div>
                  <p className="text-gray-600 text-lg">All medications completed for today!</p>
                  <p className="text-gray-500 mt-2">Great job staying on track! 🎉</p>
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
                                "{dose.medication.instructions}"
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
                                <CheckCircle className="mr-2\" size={18} />
                                Take
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSkipDose(dose.id)}
                            disabled={processingDose === dose.id}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                          >
                            <XCircle className="mr-2" size={18} />
                            Skip
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
                  <h2 className="text-2xl font-bold text-gray-800">Completed Today</h2>
                  <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {completedDoses.length}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                              <CheckCircle className="mr-1\" size={16} />
                              Taken
                            </span>
                          ) : dose.status === 'missed' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              <XCircle className="mr-1" size={16} />
                              Missed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              <AlertCircle className="mr-1" size={16} />
                              Skipped
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
                  <h2 className="text-2xl font-bold text-gray-800">Your Medications</h2>
                  <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {activeMedications.length}
                  </span>
                </div>
                <Link 
                  to="/medications" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  View All →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <MedicationList medications={activeMedications} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};