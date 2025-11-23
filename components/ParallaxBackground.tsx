import React, { useState, useEffect } from 'react';

interface ParallaxBackgroundProps {
  isNight: boolean;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ isNight }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
         if (e.beta && e.gamma) {
             const x = Math.min(Math.max(e.gamma / 45, -1), 1);
             const y = Math.min(Math.max(e.beta / 45, -1), 1);
             setMousePos({ x, y });
         }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">

      {/* Background Image Layer */}
      <div
         className="absolute inset-[-5%] bg-cover bg-center transition-transform duration-100 ease-out"
         style={{
             backgroundImage: `url('background.jpeg')`,
             transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0) scale(1.1)`,
             filter: isNight ? 'brightness(0.4) contrast(1.2) hue-rotate(-20deg)' : 'brightness(0.8) contrast(1.1)',
             transition: 'filter 1s ease-in-out, transform 0.1s ease-out'
         }}
      />

      {/* Overlay Gradient for UI Readability */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
          isNight
            ? 'bg-gradient-to-b from-indigo-950/80 via-transparent to-black/80'
            : 'bg-gradient-to-b from-purple-900/40 via-transparent to-black/60'
      }`}></div>

      {/* Atmospheric Particles */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * -30}px, 0)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Floating dust/magic motes */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`mote-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white/40 blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite linear`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
