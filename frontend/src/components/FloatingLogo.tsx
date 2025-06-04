import React from 'react';

export const FloatingLogo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a 
        href="https://bolt.new/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:scale-110 transition-transform duration-200"
      >
        <img 
          src="/black_circle_360x360.png" 
          alt="MedTracker Logo" 
          className="h-16 w-16 object-contain"
        />
      </a>
    </div>
  );
}; 