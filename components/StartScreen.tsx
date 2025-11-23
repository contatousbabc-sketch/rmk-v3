
import React from 'react';
import { User, Sparkles } from 'lucide-react';

interface StartScreenProps {
  onLogin: () => void;
  onGuest: () => void;
  isLoading: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onLogin, onGuest, isLoading }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#020617]">
      
      {/* Epic Animated Background */}
      <div className="absolute inset-0 z-0 bg-animated-gradient opacity-80"></div>
      
      {/* Volumetric Lights */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[150%] h-[80%] bg-amber-500/10 rounded-[100%] blur-[120px] animate-pulse-glow"></div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* --- LOGO PRINCIPAL --- */}
      <div className="relative z-10 flex flex-col items-center mb-16 animate-float">
        
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          {/* Glow behind Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400 blur-[80px] opacity-40 animate-pulse"></div>
          
          {/* IMAGEM DO LOGO */}
          <img 
             src="logo.png" 
             alt="Royal Merge Kingdom" 
             className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10 hover:scale-105 transition-transform duration-500"
          />
          
          {/* Partículas Decorativas */}
          <div className="absolute -top-4 -right-4">
             <Sparkles className="w-10 h-10 text-yellow-200 animate-pulse" style={{ animationDuration: '1.5s' }} />
          </div>
          <div className="absolute bottom-4 -left-4">
             <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      </div>
      {/* --- FIM DO LOGO --- */}

      <div className="flex flex-col gap-5 w-full max-w-xs z-10 px-6">
          {/* Google Button */}
          <button 
            onClick={onLogin}
            disabled={isLoading}
            className="group relative btn-game white py-5 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 active:scale-95 transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700"></div>
            {isLoading ? (
                <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            ) : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="G" />
                    <span className="text-slate-900 font-black text-xl tracking-wide">ENTRAR</span>
                </>
            )}
          </button>

          {/* Guest Button */}
          <button 
            onClick={onGuest}
            disabled={isLoading}
            className="group relative btn-game blue py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
             <User className="w-5 h-5 text-blue-200" />
             <span className="text-blue-50 font-bold tracking-wider">VISITANTE</span>
          </button>
      </div>
      
      <div className="absolute bottom-6 text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">
        2.0 Update • AI Powered
      </div>
    </div>
  );
};
