import React, { useState, useEffect } from 'react';
import { OptimizedImageProps } from '../types/ui_types';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4='
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  const getWebPSrc = (originalSrc: string) => {
    // If the image is already WebP, return as is
    if (originalSrc.endsWith('.webp')) return originalSrc;
    
    // If the image is in public directory, convert to WebP
    if (originalSrc.startsWith('/')) {
      const baseName = originalSrc.split('.')[0];
      return `${baseName}.webp`;
    }
    
    return originalSrc;
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        backgroundColor: '#f1f1f1'
      }}
    >
      <img
        src={error ? placeholder : getWebPSrc(src)}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={() => setError(true)}
      />
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 animate-pulse bg-gray-200"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
    </div>
  );
}; 