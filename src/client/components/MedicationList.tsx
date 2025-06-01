import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Edit, Trash, AlertTriangle, Pill } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface Medication {
  id: string;
  name: string;
  dosage: {
    amount: number;
    unit: string;
  };
  scheduled_times: string[];
  frequency: {
    times_per_day: number;
    specific_days: string[];
  };
  instructions?: string;
  active: boolean;
  medication_type: string;
  image_url?: string;
}

interface MedicationListProps {
  medications: Medication[];
  onDelete?: (id: string) => void;
}

export const MedicationList: React.FC<MedicationListProps> = ({ medications, onDelete }) => {
  if (medications.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <Pill className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-3">No medications found</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          You don't have any medications yet. Start building your medication schedule by adding your first medication.
        </p>
        <Link 
          to="/medications/add" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Pill className="w-5 h-5" />
          Add Your First Medication
        </Link>
      </div>
    );
  }

  const getMedicationTypeConfig = (type: string) => {
    switch (type) {
      case 'prescription':
        return {
          gradient: 'from-blue-500 to-blue-600',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200'
        };
      case 'over-the-counter':
        return {
          gradient: 'from-emerald-500 to-green-600',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200'
        };
      case 'vitamin':
        return {
          gradient: 'from-amber-500 to-yellow-600',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200'
        };
      case 'supplement':
        return {
          gradient: 'from-purple-500 to-violet-600',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200'
        };
      default:
        return {
          gradient: 'from-slate-500 to-gray-600',
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200'
        };
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {medications.map(medication => {
        const typeConfig = getMedicationTypeConfig(medication.medication_type);
        
        return (
          <div 
            key={medication.id} 
            className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            {/* Top Banner with Gradient */}
            <div className={`h-1.5 bg-gradient-to-r ${typeConfig.gradient}`}></div>
            
            <div className="p-6">
              {/* Header with Status */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                    {medication.name}
                  </h3>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} border`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${typeConfig.gradient}`}></div>
                    {medication.medication_type.replace('-', ' ')}
                  </div>
                </div>
                
                <div className="ml-3">
                  {medication.active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 font-medium">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              
              {/* Dosage */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-800">
                    {medication.dosage.amount}
                    <span className="text-lg font-medium text-slate-600 ml-1">
                      {medication.dosage.unit}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Dosage</p>
                </div>
              </div>
              
              {/* Schedule Information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 mb-1">Schedule</p>
                    <p className="text-sm text-slate-600 break-words">
                      {medication.scheduled_times.map(formatTime).join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 mb-1">Frequency</p>
                    {medication.frequency.specific_days?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {medication.frequency.specific_days
                          .map(day => day.charAt(0).toUpperCase() + day.slice(1, 3))
                          .map(day => (
                            <span key={day} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                              {day}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">Every day</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              {medication.instructions && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium mb-1">Instructions</p>
                  <p className="text-sm text-amber-700 italic">
                    "{medication.instructions}"
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to={`/medications/edit/${medication.id}`}
                  className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 py-3 rounded-xl flex items-center justify-center transition-all duration-200 border border-blue-200 hover:border-blue-300 font-medium group"
                >
                  <Edit className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  Edit
                </Link>
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(medication.id)}
                    className="flex-1 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-700 py-3 rounded-xl flex items-center justify-center transition-all duration-200 border border-red-200 hover:border-red-300 font-medium group"
                  >
                    <Trash className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
