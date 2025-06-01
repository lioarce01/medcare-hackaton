import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime, formatDate } from '../utils/formatters';
import { adherenceApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface AdherenceRecord {
  id: string;
  medication: {
    id: string;
    name: string;
    dosage: {
      amount: number;
      unit: string;
    };
    instructions: string;
  };
  scheduled_time: string;
  scheduled_date: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  taken_time?: string;
}

export const Adherence: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [adherenceRecords, setAdherenceRecords] = useState<AdherenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAdherenceRecords();
  }, [selectedDate, isAuthenticated]);

  const fetchAdherenceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adherenceApi.getHistory(selectedDate.toISOString().split('T')[0]);
      setAdherenceRecords(data || []);
    } catch (err: any) {
      console.error('Error fetching adherence records:', err);
      setError(err.message || 'Failed to fetch adherence records');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDose = async (recordId: string) => {
    try {
      setProcessingId(recordId);
      await adherenceApi.confirmDose(recordId);
      await fetchAdherenceRecords();
    } catch (err: any) {
      console.error('Error confirming dose:', err);
      setError(err.message || 'Failed to confirm dose');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSkipDose = async (recordId: string) => {
    try {
      setProcessingId(recordId);
      await adherenceApi.skipDose(recordId);
      await fetchAdherenceRecords();
    } catch (err: any) {
      console.error('Error skipping dose:', err);
      setError(err.message || 'Failed to skip dose');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Adherence History</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Previous Day
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Next Day
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          {/* Records Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="text-blue-600 mr-2" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">
                  {formatDate(selectedDate)}
                </h2>
              </div>
            </div>

            {adherenceRecords.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-gray-500">No medication records found for this date.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {adherenceRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {record.medication.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {record.medication.dosage.amount} {record.medication.dosage.unit}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="text-gray-400 mr-1" size={16} />
                        <span className="text-sm text-gray-600">
                          {formatTime(record.scheduled_time)}
                        </span>
                      </div>
                    </div>

                    {record.medication.instructions && (
                      <p className="text-sm text-gray-500 mb-3 italic">
                        "{record.medication.instructions}"
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {record.status === 'taken' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="mr-1\" size={14} />
                            Taken
                          </span>
                        ) : record.status === 'missed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="mr-1" size={14} />
                            Missed
                          </span>
                        ) : record.status === 'skipped' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <AlertCircle className="mr-1" size={14} />
                            Skipped
                          </span>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleConfirmDose(record.id)}
                              disabled={processingId === record.id}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {processingId === record.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                              ) : (
                                <>
                                  <CheckCircle className="mr-1\" size={14} />
                                  Take
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleSkipDose(record.id)}
                              disabled={processingId === record.id}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="mr-1" size={14} />
                              Skip
                            </button>
                          </div>
                        )}
                      </div>

                      {record.taken_time && (
                        <span className="text-sm text-gray-500">
                          Taken at {formatTime(record.taken_time.split('T')[1].slice(0, 5))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};