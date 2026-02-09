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

      {/* Falling Petals (Sakura Style) */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-[#C6934B]/20 rounded-full"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 12 + 6}px`,
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              opacity: Math.random() * 0.5,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `petalFall ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Hand-brushed Background Rings (Tokyo Poster Style) */}
      <div className="absolute bottom-[10%] left-[-5%] opacity-[0.03] scale-150 rotate-12">
        <BrushedRing size={400} color="#C6934B" />
      </div>
      <div className="absolute top-[5%] right-[-10%] opacity-[0.02] scale-[2] -rotate-12">
        <BrushedRing size={500} color="#FDF0C9" />
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-[#C6934B] opacity-[0.04] blur-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#8A1C1C] opacity-[0.06] blur-[120px]"></div>
      
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(110vh) translateX(50px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const BrushedRing = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10" 
      stroke={color} 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeDasharray="1 10" 
      className="opacity-50"
    />
    <path 
      d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeDasharray="20 5"
    />
  </svg>
);