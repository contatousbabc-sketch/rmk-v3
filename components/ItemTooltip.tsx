
import React from 'react';
import { GameItem, ItemType } from '../types';
import { ITEM_DEFINITIONS } from '../constants';
import { Coins, Zap, Sparkles } from 'lucide-react';

interface ItemTooltipProps {
  item: GameItem;
  position: { x: number; y: number };
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const sellValue = Math.floor(def.baseValue * Math.pow(2, item.level - 1));
  
  const getRarityColor = (level: number) => {
    if (level >= 8) return { border: 'border-fuchsia-500', text: 'text-fuchsia-400', bg: 'from-fuchsia-900/90 to-slate-900/95' };
    if (level >= 5) return { border: 'border-amber-400', text: 'text-amber-400', bg: 'from-amber-900/90 to-slate-900/95' };
    if (level >= 3) return { border: 'border-blue-400', text: 'text-blue-400', bg: 'from-blue-900/90 to-slate-900/95' };
    return { border: 'border-slate-600', text: 'text-slate-300', bg: 'from-slate-800/90 to-slate-900/95' };
  };

  const colors = getRarityColor(item.level);

  // Adjust position to stay on screen
  let top = position.y - 130; 
  let left = position.x - 80; 

  if (top < 10) top = position.y + 20;
  if (left < 10) left = 10;
  if (left > window.innerWidth - 170) left = window.innerWidth - 170;

  const style: React.CSSProperties = {
      top: top,
      left: left,
      position: 'fixed',
      zIndex: 100,
      pointerEvents: 'none'
  };

  return (
    <div style={style} className="animate-in fade-in zoom-in-95 duration-150">
      <div className={`
        w-48 rounded-xl border ${colors.border} bg-gradient-to-b ${colors.bg} 
        backdrop-blur-md p-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)]
        flex flex-col gap-2 relative overflow-hidden
      `}>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
           <div>
               <h4 className={`font-black text-sm uppercase tracking-wider ${colors.text} drop-shadow-sm`}>
                   {def.name}
               </h4>
               <span className="text-[10px] text-slate-400 font-bold">Nível {item.level}</span>
           </div>
           {item.level >= 5 && <Sparkles className={`w-4 h-4 ${colors.text} animate-pulse`} />}
        </div>

        <div className="h-px w-full bg-white/10"></div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
            <div className="bg-black/40 rounded p-1 flex flex-col items-center border border-white/5">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Venda</span>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Coins className="w-3 h-3" /> {sellValue}
                </div>
            </div>
            <div className="bg-black/40 rounded p-1 flex flex-col items-center border border-white/5">
                <span className="text-[9px] text-slate-500 uppercase font-bold">XP</span>
                <div className="flex items-center gap-1 text-blue-400 font-bold text-xs">
                    <Zap className="w-3 h-3" /> {item.level * 5}
                </div>
            </div>
        </div>

        {/* Flavor Text / Lore */}
        <div className="text-[10px] text-slate-300 italic leading-tight text-center opacity-90 font-serif">
            "{item.lore || (item.level >= 8 ? "Lendário e poderoso." : item.level >= 5 ? "Raro e valioso." : "Comum, mas útil.")}"
        </div>

      </div>
    </div>
  );
};
