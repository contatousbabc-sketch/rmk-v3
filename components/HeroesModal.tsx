
import React from 'react';
import { Hero } from '../types';
import { Swords, Zap, Shield, Heart } from 'lucide-react';
import { playSound } from '../utils/audio';

interface HeroesModalProps {
  unlockedHeroes: Hero[];
  selectedHeroId: string | null;
  onSelectHero: (heroId: string) => void;
  onClose: () => void;
}

export const HeroesModal: React.FC<HeroesModalProps> = ({ unlockedHeroes, selectedHeroId, onSelectHero, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-slate-900 border-2 border-slate-600 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
             <div className="bg-blue-900/50 p-2 rounded-xl border border-blue-500/30">
                 <Swords className="w-6 h-6 text-blue-400" />
             </div>
             <div>
                 <h2 className="text-xl font-black text-white uppercase tracking-wider fantasy-font">Salão de Heróis</h2>
                 <p className="text-xs text-slate-400 font-bold">Escolha seu campeão para a batalha</p>
             </div>
          </div>
          <button
            onClick={() => { playSound('pop'); onClose(); }}
            className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Hero List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

            {unlockedHeroes.map((hero) => {
                const isSelected = selectedHeroId === hero.id;

                return (
                    <div
                        key={hero.id}
                        onClick={() => {
                            if (!isSelected) {
                                playSound('pop');
                                onSelectHero(hero.id);
                            }
                        }}
                        className={`
                            relative group cursor-pointer transition-all duration-300 transform
                            ${isSelected
                                ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500 ring-2 ring-blue-500/50 scale-[1.02]'
                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                            }
                            border rounded-2xl p-3 flex gap-4 overflow-hidden
                        `}
                    >
                        {isSelected && <div className="absolute inset-0 bg-blue-500/10 animate-pulse-glow"></div>}

                        {/* Hero Icon */}
                        <div className={`
                            w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl shadow-lg relative overflow-hidden
                            ${isSelected ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-slate-700'}
                        `}>
                             {/* Placeholder for Hero Image - using emoji for now, could be replaced with images */}
                             <span className="relative z-10 filter drop-shadow-md">{hero.icon}</span>

                             {/* Elemental Indicator */}
                             <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-tl-lg flex items-center justify-center text-xs
                                 ${hero.element === 'fire' ? 'bg-red-500' :
                                   hero.element === 'water' ? 'bg-blue-500' :
                                   hero.element === 'earth' ? 'bg-emerald-500' : 'bg-yellow-500'}
                             `}>
                                 {hero.element === 'fire' && '🔥'}
                                 {hero.element === 'water' && '💧'}
                                 {hero.element === 'earth' && '🌿'}
                                 {hero.element === 'light' && '✨'}
                             </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-center relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-black text-lg ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>{hero.name}</h3>
                                {isSelected && <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full text-white font-bold tracking-wide shadow-lg shadow-blue-500/50">SELECIONADO</span>}
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-2 italic">"{hero.description}"</p>

                            <div className="flex gap-3 mt-auto">
                                <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md border border-slate-700/50">
                                    <Zap className="w-3 h-3 text-yellow-400" />
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{hero.abilityName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

      </div>
    </div>
  );
};
