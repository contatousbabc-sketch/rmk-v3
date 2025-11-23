
import React from 'react';
import { User, Sparkles, Crown } from 'lucide-react';

interface StartScreenProps {
  onLogin: () => void;
  onGuest: () => void;
  isLoading: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onLogin, onGuest, isLoading }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#2e1065]">
      
      {/* Epic Animated Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900 via-indigo-950 to-black opacity-90"></div>
      
      {/* Volumetric Lights */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[150%] h-[80%] bg-amber-500/20 rounded-[100%] blur-[120px] animate-pulse-glow"></div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* --- LOGO PRINCIPAL --- */}
      <div className="relative z-10 flex flex-col items-center mb-16 animate-float">
        
        <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
          {/* Glow behind Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400 blur-[100px] opacity-50 animate-pulse"></div>
          
          {/* IMAGEM DO LOGO */}
          <img 
             src="logo.png" 
             alt="Royal Merge Kingdom" 
             className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10 hover:scale-105 transition-transform duration-500"
          />
          
          {/* Partículas Decorativas */}
          <div className="absolute -top-8 -right-8">
             <Sparkles className="w-16 h-16 text-yellow-200 animate-pulse" style={{ animationDuration: '1.5s' }} />
          </div>
          <div className="absolute bottom-4 -left-4">
             <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
           <div className="absolute top-0 left-0 opacity-70">
             <Crown className="w-12 h-12 text-amber-300 rotate-[-15deg]" />
          </div>
        </div>
      </div>
      {/* --- FIM DO LOGO --- */}

      <div className="flex flex-col gap-5 w-full max-w-xs z-10 px-6">
          {/* Google Button */}
          <button 
            onClick={onLogin}
            disabled={isLoading}
            className="group relative btn-game white py-5 rounded-2xl shadow-[0_0_40px_rgba(255,215,0,0.2)] flex items-center justify-center gap-4 active:scale-95 transition-transform"
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
            className="group relative btn-game gold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
             <User className="w-5 h-5 text-amber-900" />
             <span className="text-amber-900 font-bold tracking-wider">VISITANTE</span>
          </button>
      </div>
      
      <div className="absolute bottom-8 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
        Tap to start your journey
      </div>
    </div>
  );
};
