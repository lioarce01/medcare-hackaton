import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Calendar, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatPercentage } from '../utils/formatters';
import { supabase } from '../../config/supabase';
import { useAuth } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch adherence records for the date range
        const { data: adherenceData, error: adherenceError } = await supabase
          .from('adherence')
          .select(`
            *,
            medication:medications (
              id,
              name,
              medication_type
            )
          `)
          .eq('user_id', user.id)
          .gte('scheduled_date', dateRange.startDate.toISOString().split('T')[0])
          .lte('scheduled_date', dateRange.endDate.toISOString().split('T')[0]);

        if (adherenceError) throw adherenceError;

        // Calculate overall stats
        const total = adherenceData?.length || 0;
        const taken = adherenceData?.filter(record => record.status === 'taken').length || 0;
        const missed = adherenceData?.filter(record => record.status === 'missed').length || 0;
        const skipped = adherenceData?.filter(record => record.status === 'skipped').length || 0;
        const adherenceRate = total > 0 ? (taken / (total - skipped)) * 100 : 0;

        // Calculate day of week stats
        const dayOfWeekStats = Array.from({ length: 7 }, (_, i) => {
          const dayRecords = adherenceData?.filter(record => {
            const date = new Date(record.scheduled_date);
            return date.getDay() === i;
          }) || [];

          const dayTotal = dayRecords.length;
          const dayTaken = dayRecords.filter(record => record.status === 'taken').length;
          const dayRate = dayTotal > 0 ? (dayTaken / dayTotal) * 100 : 0;

          return {
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
            total: dayTotal,
            taken: dayTaken,
            rate: dayRate
          };
        });

        // Calculate medication-specific stats
        const medicationStats = Object.values(
          adherenceData?.reduce((acc: any, record) => {
            const medId = record.medication.id;
            if (!acc[medId]) {
              acc[medId] = {
                id: medId,
                name: record.medication.name,
                total: 0,
                taken: 0,
                missed: 0,
                skipped: 0,
                adherenceRate: 0,
                riskScore: 0
              };
            }

            acc[medId].total++;
            acc[medId][record.status]++;

            // Calculate adherence rate for each medication
            acc[medId].adherenceRate = acc[medId].total > 0
              ? (acc[medId].taken / (acc[medId].total - acc[medId].skipped)) * 100
              : 0;

            // Calculate simple risk score based on missed doses
            acc[medId].riskScore = Math.min(
              100,
              Math.round((acc[medId].missed / Math.max(1, acc[medId].total)) * 100)
            );

            return acc;
          }, {}) || {}
        );

        // Calculate weekly trends
        const weeklyTrends = [];
        let currentDate = new Date(dateRange.startDate);
        while (currentDate <= dateRange.endDate) {
          const weekEnd = new Date(currentDate);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const weekRecords = adherenceData?.filter(record => {
            const recordDate = new Date(record.scheduled_date);
            return recordDate >= currentDate && recordDate <= weekEnd;
          }) || [];

          const weekTotal = weekRecords.length;
          const weekTaken = weekRecords.filter(record => record.status === 'taken').length;
          const weekMissed = weekRecords.filter(record => record.status === 'missed').length;
          const weekRate = weekTotal > 0 ? (weekTaken / weekTotal) * 100 : 0;

          weeklyTrends.push({
            week: `Week ${weeklyTrends.length + 1}`,
            startDate: currentDate.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            total: weekTotal,
            taken: weekTaken,
            missed: weekMissed,
            adherenceRate: weekRate
          });

          currentDate.setDate(currentDate.getDate() + 7);
        }

        setStats({
          overall: {
            total,
            taken,
            missed,
            skipped,
            adherenceRate
          },
          dayOfWeekStats,
          medicationStats,
          weeklyTrends
        });

      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, user?.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <AlertTriangle className="inline-block mr-2\" size={20} />
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-gray-500 text-center py-8">
        No analytics data available
      </div>
    );
  }

  const weeklyTrendsData = {
    labels: stats.weeklyTrends.map((trend: any) => trend.week),
    datasets: [
      {
        label: 'Adherence Rate (%)',
        data: stats.weeklyTrends.map((trend: any) => trend.adherenceRate),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const dayOfWeekData = {
    labels: stats.dayOfWeekStats.map((stat: any) => stat.day),
    datasets: [
      {
        label: 'Adherence Rate (%)',
        data: stats.dayOfWeekStats.map((stat: any) => stat.rate),
        backgroundColor: '#2563eb',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={dateRange.startDate.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              startDate: new Date(e.target.value),
            }))}
          >
            <option value={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>Last 7 days</option>
            <option value={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>Last 30 days</option>
            <option value={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Total Doses</h3>
            <Calendar className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overall.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Taken</h3>
            <Activity className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.overall.taken}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Missed</h3>
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.overall.missed}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Adherence Rate</h3>
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {formatPercentage(stats.overall.adherenceRate)}
          </p>
        </div>
      </div>

      {/* Weekly Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Adherence Trends</h3>
        <div className="h-80">
          <Line data={weeklyTrendsData} options={chartOptions} />
        </div>
      </div>

      {/* Medication-wise Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Medication Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Doses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Missed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adherence Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.medicationStats.map((med: any) => (
                <tr key={med.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{med.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {med.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {med.taken}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {med.missed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            med.adherenceRate >= 90
                              ? 'bg-green-500'
                              : med.adherenceRate >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${med.adherenceRate}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {formatPercentage(med.adherenceRate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        med.riskScore < 30
                          ? 'bg-green-100 text-green-800'
                          : med.riskScore < 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {med.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day of Week Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Day of Week Analysis</h3>
        <div className="h-80">
          <Bar data={dayOfWeekData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};