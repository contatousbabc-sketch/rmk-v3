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

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxOffset = {
    transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`,
    transition: 'transform 0.3s ease-out',
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Camada 1 - Fundo principal */}
      <div
        className={`absolute inset-[-10%] transition-colors duration-1000 ${
          isNight
            ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-black'
            : 'bg-gradient-to-br from-blue-900 via-purple-800 to-slate-900'
        }`}
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
          transition: 'transform 0.5s ease-out, background 1s',
        }}
      />

      {/* Camada 2 - Estrelas distantes */}
      <div
        className="absolute inset-[-10%]"
        style={parallaxOffset}
      >
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={`absolute w-1 h-1 rounded-full ${
              isNight ? 'bg-white' : 'bg-white/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Camada 3 - Nebulosas */}
      <div
        className="absolute inset-[-20%] opacity-30"
        style={{
          transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            isNight ? 'bg-blue-500/20' : 'bg-purple-500/20'
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            isNight ? 'bg-indigo-500/20' : 'bg-pink-500/20'
          }`}
        />
      </div>

      {/* Camada 4 - Partículas flutuantes */}
      <div
        className="absolute inset-[-10%]"
        style={{
          transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -15}px, 0)`,
          transition: 'transform 0.4s ease-out',
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full bg-white/10 blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
      `}</style>
    </div>
  );
};
