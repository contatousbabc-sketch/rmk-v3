
import React from 'react';
import { Gift, Skull, Swords, Mountain, Trees, Castle } from 'lucide-react';
import { ItemType, Mission } from '../types';

interface AdventureMapProps {
  energy: number;
  missions: Mission[]; // Now accepts dynamic missions
  onStartMission: (mission: Mission) => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({ energy, missions, onStartMission }) => {

  const getBgColor = (color: string) => {
      const map: any = {
          emerald: 'bg-emerald-900',
          stone: 'bg-slate-800',
          yellow: 'bg-yellow-900',
          purple: 'bg-purple-900',
          green: 'bg-green-950',
          red: 'bg-red-950',
          cyan: 'bg-cyan-950'
      };
      return map[color] || 'bg-slate-900';
  };
  
  const getIcon = (color: string) => {
      if (color === 'emerald' || color === 'green') return <Trees />;
      if (color === 'stone' || color === 'red') return <Mountain />;
      if (color === 'purple') return <Skull />;
      if (color === 'cyan') return <Castle />;
      return <Gift />;
  };

  return (
    <div className="space-y-6 h-full px-2 pb-32">
      
      <div className="text-center space-y-1 my-6 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <Swords className="w-32 h-32 text-red-500" />
        </div>
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-orange-600 drop-shadow-sm fantasy-font relative z-10">
            Mapa de Batalha
        </h2>
        <p className="text-slate-400 text-sm font-bold relative z-10 bg-slate-900/80 inline-block px-2 rounded">
            Missões geradas pelo Oráculo Real (AI)
        </p>
      </div>

      <div className="grid gap-6">
        {missions.map((mission, index) => (
          <div key={mission.id} className="group relative animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index*100}ms` }}>
             {/* Connector Line */}
             {index < missions.length - 1 && (
                 <div className="absolute left-8 top-full h-6 w-1 bg-slate-700 -z-10"></div>
             )}
             
             <div className={`
                gold-frame overflow-hidden relative transition-all duration-300
                ${energy >= mission.cost ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-80 grayscale'}
             `}
             onClick={() => energy >= mission.cost && onStartMission(mission)}
             >
                 <div className={`${getBgColor(mission.color)} p-4 flex items-stretch gap-4 relative`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    
                    {/* Icon Box */}
                    <div className="w-20 bg-black/30 rounded-xl border-2 border-white/10 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                        <div className="text-white/20 absolute inset-0 flex items-center justify-center scale-150 blur-sm">
                            {getIcon(mission.color)}
                        </div>
                        <div className="relative z-10 text-white">
                            {getIcon(mission.color)}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center text-white font-bold py-0.5">
                            Nvl {index + 1}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-center z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">{mission.name}</h3>
                                {mission.description && <p className="text-[9px] text-white/60 italic line-clamp-1">{mission.description}</p>}
                            </div>
                            <span className={`text-[10px] uppercase font-black px-2 py-1 rounded border bg-black/40
                                ${mission.difficulty === 'Fácil' ? 'text-green-400 border-green-900' :
                                  mission.difficulty === 'Médio' ? 'text-yellow-400 border-yellow-900' :
                                  'text-red-400 border-red-900'}
                            `}>
                                {mission.difficulty}
                            </span>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
                            <div className="flex items-center gap-1">
                                <Gift className="w-3 h-3 text-amber-400" />
                                <span>Prêmio: <strong>{mission.rewardType.toUpperCase()}</strong></span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Skull className="w-3 h-3 text-red-400" />
                                <span>Alvo: <strong>{mission.targetScore}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button (Visual Only, whole card is clickable) */}
                    <div className="flex flex-col items-center justify-center pl-2 border-l border-white/10">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg
                            ${energy >= mission.cost ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-700 border-slate-600 text-slate-500'}
                        `}>
                            <Swords className="w-6 h-6" />
                        </div>
                        <div className="mt-1 text-[10px] font-black text-yellow-400 flex items-center gap-0.5">
                            -{mission.cost} <span className="text-xs">⚡</span>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
