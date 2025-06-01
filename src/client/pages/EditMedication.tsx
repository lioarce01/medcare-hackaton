import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../utils/api';

export const EditMedication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dosage: {
      amount: '',
      unit: 'mg'
    },
    frequency: {
      timesPerDay: 1,
      specificDays: []
    },
    scheduledTimes: ['08:00'],
    instructions: '',
    medicationType: 'prescription',
    active: true
  });

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const { data } = await api.get(`/medications/${id}`);
        setFormData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch medication');
      } finally {
        setLoading(false);
      }
    };

    fetchMedication();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/medications/${id}`, formData);
      navigate('/medications');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update medication');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Medication</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Medication Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dosage Amount
            </label>
            <input
              type="number"
              value={formData.dosage.amount}
              onChange={(e) => setFormData({
                ...formData,
                dosage: { ...formData.dosage, amount: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              value={formData.dosage.unit}
              onChange={(e) => setFormData({
                ...formData,
                dosage: { ...formData.dosage, unit: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="g">g</option>
              <option value="tablet">tablet</option>
              <option value="capsule">capsule</option>
              <option value="pill">pill</option>
              <option value="injection">injection</option>
              <option value="patch">patch</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Medication Type
          </label>
          <select
            value={formData.medicationType}
            onChange={(e) => setFormData({ ...formData, medicationType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="prescription">Prescription</option>
            <option value="over-the-counter">Over the Counter</option>
            <option value="vitamin">Vitamin</option>
            <option value="supplement">Supplement</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active Medication
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};