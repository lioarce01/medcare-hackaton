import React from 'react';
import { OptimizedImage } from './OptimizedImage';

export const FloatingLogo: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a 
        href="https://bolt.new/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:scale-110 transition-transform duration-200"
      >
        <OptimizedImage 
          src="/black_circle_360x360.webp" 
          alt="MedTracker Logo" 
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
          loading="eager"
        />
      </a>
    </div>
  );
}; 