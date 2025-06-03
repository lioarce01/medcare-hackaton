import React from 'react';
import { Heart, Pill } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Pill className="text-blue-600" size={20} />
              <span className="ml-2 text-lg font-bold text-gray-800">MedTracker</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Making medication management simple and effective.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-2">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                Contact
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Made with <Heart className="inline text-red-500" size={14} /> &copy; {new Date().getFullYear()} MedTracker
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};