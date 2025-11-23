
import React from 'react';
import { X, Volume2, RefreshCw, User } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onReset: () => void;
  onOpenProfile: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onReset, onOpenProfile }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
           <h2 className="text-lg font-bold text-white">Configurações</h2>
           <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="p-4 space-y-3">
            {/* Perfil Btn */}
            <button 
                onClick={onOpenProfile}
                className="w-full flex items-center justify-between p-3 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/30 rounded-xl transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500 rounded-lg">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-indigo-100 font-bold text-sm">Meu Perfil</span>
                </div>
            </button>

            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-indigo-400" />
                    <span className="text-white font-bold text-sm">Efeitos Sonoros</span>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-emerald-400 text-xs font-bold">LIGADO</span>
                </div>
            </div>

            <button 
                onClick={onReset}
                className="w-full flex items-center justify-between p-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-xl transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-red-400 group-hover:rotate-180 transition-transform" />
                    <span className="text-red-100 font-bold text-sm">Resetar Progresso</span>
                </div>
            </button>
            
            <div className="mt-4 p-4 text-center">
                <p className="text-xs text-slate-500">Royal Merge Kingdom v1.3.0</p>
            </div>
        </div>
      </div>
    </div>
  );
};
