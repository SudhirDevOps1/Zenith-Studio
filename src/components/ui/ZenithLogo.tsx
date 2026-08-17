import React, { useState } from 'react';
import appLogo from '../../assets/logo.png';

interface ZenithLogoProps {
  className?: string;
  size?: number;
}

export const ZenithLogo: React.FC<ZenithLogoProps> = ({ className = 'w-5 h-5', size }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-sm border border-cyan-400/30 shrink-0 ${className}`}
        style={size ? { width: `${size}px`, height: `${size}px`, fontSize: `${Math.max(10, Math.floor(size * 0.45))}px` } : undefined}
      >
        Z
      </div>
    );
  }

  return (
    <img
      src={appLogo}
      alt="Zenith Studio"
      className={`object-cover select-none shrink-0 rounded-md ${className}`}
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
      onError={() => setHasError(true)}
    />
  );
};
