import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface IntroVideoProps {
  onClose: () => void;
}

const VIDEO_SRC = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export const IntroVideo: React.FC<IntroVideoProps> = ({ onClose }) => {
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        onEnded={onClose}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
        Seu navegador não suporta vídeos.
      </video>

      {canSkip && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-white/20 hover:bg-black/70 transition-all duration-300 flex items-center gap-2 animate-fade-in"
        >
          <X className="w-5 h-5" />
          <span className="font-bold">Pular</span>
        </button>
      )}

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <h1 className="text-white text-4xl font-black fantasy-font drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-pulse">
          Royal Merge Kingdom
        </h1>
        <p className="text-white/80 text-lg mt-2 drop-shadow-lg">
          Uma jornada épica está prestes a começar...
        </p>
      </div>
    </div>
  );
};
