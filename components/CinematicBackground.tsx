import React from 'react';

export const CinematicBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#15100E]"
    >
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2A1F1B_0%,_#15100E_100%)]" />

      {/* Subtle Grain Overlay for Film Look */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>

      {/* Ambient Glow - Top Left (Gold/Champagne) */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-[#C6934B] opacity-[0.04] blur-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>

      {/* Ambient Glow - Bottom Right (Deep Red) */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#8A1C1C] opacity-[0.06] blur-[120px]"></div>
      
      {/* Spotlight Effect Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle,_rgba(253,240,201,0.02)_0%,_transparent_70%)] pointer-events-none"></div>
    </div>
  );
};