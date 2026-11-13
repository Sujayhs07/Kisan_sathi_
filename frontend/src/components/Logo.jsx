import React from 'react';

export default function Logo({ variant = 'dark', className = '', showText = true }) {
  // variant: 'dark' (for green backgrounds, white text) or 'light' (for cream/white backgrounds)
  const isDark = variant === 'dark';

  // If on light background and text should be shown, render the official logo with authentic branding typography
  if (!isDark && showText) {
    return (
      <div className={`flex items-center gap-2 select-none cursor-pointer ${className}`}>
        <img 
          src="/logo.png" 
          alt="Kisan Scheme Saathi" 
          className="h-12 md:h-14 w-auto object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  // Dark variant (e.g., Sidebar with dark forest green background)
  return (
    <div className={`flex items-center gap-3 select-none cursor-pointer ${className}`}>
      {/* Official Circular Emblem with golden accent ring */}
      <div className="relative w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center overflow-hidden bg-white/95">
        <img 
          src="/logo-emblem.png" 
          alt="Kisan Scheme Saathi Emblem" 
          className="w-full h-full object-contain p-0.5" 
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif-heading font-bold tracking-tight text-lg leading-tight ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}>
            Kisan Scheme <span className={isDark ? 'text-amber-300' : 'text-maroon-700'}>Saathi</span>
          </span>
          <span className={`text-[10px] tracking-wider uppercase font-semibold ${
            isDark ? 'text-emerald-300/80' : 'text-emerald-700'
          }`}>
            Government Schemes Portal
          </span>
        </div>
      )}
    </div>
  );
}
