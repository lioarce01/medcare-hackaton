import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Clock, AlertTriangle } from 'lucide-react';
import { medicationApi } from '../utils/api';
import { localToUTC } from '../utils/formatters';

export const AddMedication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dosage: {
      amount: '',
      unit: 'mg'
    },
    frequency: {
      times_per_day: 1,
      specific_days: [] as string[]
    },
    scheduled_times: ['08:00'],
    instructions: '',
    medication_type: 'prescription',
    active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    refill_reminder: {
      enabled: false,
      threshold: 7,
      last_refill: null,
      next_refill: null,
      supply_amount: 0,
      supply_unit: 'days'
    },
    side_effects_to_watch: [] as string[],
    image_url: ''
  });

  const [newSideEffect, setNewSideEffect] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert scheduled times to UTC before saving
      const utcScheduledTimes = formData.scheduled_times.map(localToUTC);
      
      // Ensure start_date is set to the beginning of the day
      const startDate = new Date(formData.start_date);
      startDate.setUTCHours(0, 0, 0, 0);

      const medicationData = {
        ...formData,
        scheduled_times: utcScheduledTimes,
        start_date: startDate.toISOString()
      };
      
      await medicationApi.create(medicationData);
      navigate('/medications');
    } catch (err: any) {
      console.error('Error adding medication:', err);
      setError(err.message || 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const addScheduledTime = () => {
    setFormData(prev => ({
      ...prev,
      scheduled_times: [...prev.scheduled_times, '08:00']
    }));
  };

  const removeScheduledTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scheduled_times: prev.scheduled_times.filter((_, i) => i !== index)
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const days = prev.frequency.specific_days;
      const newDays = days.includes(day)
        ? days.filter(d => d !== day)
        : [...days, day];
      return {
        ...prev,
        frequency: {
          ...prev.frequency,
          specific_days: newDays
        }
      };
    });
  };

  const handleAddSideEffect = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSideEffect.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        side_effects_to_watch: [...prev.side_effects_to_watch, newSideEffect.trim()]
      }));
      setNewSideEffect('');
    }
  };

  const removeSideEffect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      side_effects_to_watch: prev.side_effects_to_watch.filter((_, i) => i !== index)
    }));
  };

  const toggleRefillReminder = () => {
    setFormData(prev => ({
      ...prev,
      refill_reminder: {
        ...prev.refill_reminder,
        enabled: !prev.refill_reminder.enabled
      }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Add New Medication</h1>
          <p className="text-gray-600 mt-1">Enter the details of your medication</p>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Amount *
                </label>
                <input
                  type="number"
                  value={formData.dosage.amount}
                  onChange={(e) => setFormData({
                    ...formData,
                    dosage: { ...formData.dosage, amount: e.target.value }
                  })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.dosage.unit}
                  onChange={(e) => setFormData({
                    ...formData,
                    dosage: { ...formData.dosage, unit: e.target.value }
                  })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="mg">mg</option>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="mcg">mcg</option>
                  <option value="IU">IU</option>
                  <option value="tablet">tablet</option>
                  <option value="capsule">capsule</option>
                  <option value="pill">pill</option>
                  <option value="injection">injection</option>
                  <option value="patch">patch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication Type *
              </label>
              <select
                value={formData.medication_type}
                onChange={(e) => setFormData({ ...formData, medication_type: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="prescription">Prescription</option>
                <option value="over-the-counter">Over the Counter</option>
                <option value="vitamin">Vitamin</option>
                <option value="supplement">Supplement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.frequency.specific_days.includes(day)
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to take medication every day
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Scheduled Times *
                </label>
                <button
                  type="button"
                  onClick={addScheduledTime}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Time
                </button>
              </div>
              <div className="space-y-2">
                {formData.scheduled_times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-gray-50 rounded-lg border border-gray-200 p-2">
                      <Clock className="text-gray-400 mr-2" size={18} />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...formData.scheduled_times];
                          newTimes[index] = e.target.value;
                          setFormData({ ...formData, scheduled_times: newTimes });
                        }}
                        className="flex-1 bg-transparent border-none focus:ring-0"
                        required
                      />
                    </div>
                    {formData.scheduled_times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScheduledTime(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min={formData.start_date}
                />
              </div>
            </div>
          </div>

          {/* Refill Reminder */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Refill Reminder</h2>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="refillEnabled"
                checked={formData.refill_reminder.enabled}
                onChange={toggleRefillReminder}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="refillEnabled" className="ml-2 block text-sm text-gray-700">
                Enable refill reminders
              </label>
            </div>

            {formData.refill_reminder.enabled && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supply Amount
                    </label>
                    <input
                      type="number"
                      value={formData.refill_reminder.supply_amount}
                      onChange={(e) => setFormData({
                        ...formData,
                        refill_reminder: {
                          ...formData.refill_reminder,
                          supply_amount: parseInt(e.target.value)
                        }
                      })}
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supply Unit
                    </label>
                    <select
                      value={formData.refill_reminder.supply_unit}
                      onChange={(e) => setFormData({
                        ...formData,
                        refill_reminder: {
                          ...formData.refill_reminder,
                          supply_unit: e.target.value
                        }
                      })}
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Threshold (days before refill needed)
                  </label>
                  <input
                    type="number"
                    value={formData.refill_reminder.threshold}
                    onChange={(e) => setFormData({
                      ...formData,
                      refill_reminder: {
                        ...formData.refill_reminder,
                        threshold: parseInt(e.target.value)
                      }
                    })}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Additional Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="E.g., Take with food, Avoid alcohol, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Side Effects to Watch
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newSideEffect}
                  onChange={(e) => setNewSideEffect(e.target.value)}
                  onKeyDown={handleAddSideEffect}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Press Enter to add"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.side_effects_to_watch.map((effect, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700 border border-red-200"
                    >
                      {effect}
                      <button
                        type="button"
                        onClick={() => removeSideEffect(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/medication-image.jpg"
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
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};