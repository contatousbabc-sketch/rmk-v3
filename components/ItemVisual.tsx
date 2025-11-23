
import React from 'react';
import { ItemType } from '../types';

interface ItemVisualProps {
  type: ItemType;
  level: number;
  className?: string;
}

export const ItemVisual: React.FC<ItemVisualProps> = ({ type, level, className = '' }) => {
  
  const isRare = level >= 5;
  const isEpic = level >= 8;

  // Helper for background colors
  const getBgColor = () => {
    switch (type) {
      case ItemType.WOOD: return 'bg-[#3E2723]';
      case ItemType.STONE: return 'bg-[#37474F]';
      case ItemType.CROP: return 'bg-[#1B5E20]';
      case ItemType.POTION: return 'bg-[#311B92]';
      default: return 'bg-slate-800';
    }
  };

  /* 
     MANUAL DE SUBSTITUIÇÃO (TODO):
     Futuramente, substituir o switch renderIcon abaixo por uma tag <img />.
     Exemplo:
     const imageName = `${type}_${level}.png`; // ex: wood_1.png
     return <img src={`/assets/items/${imageName}`} className="w-full h-full object-contain" />;
  */

  const renderIcon = () => {
    switch (type) {
      case ItemType.WOOD:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 drop-shadow-md">
             {/* Logs Stack */}
             <g transform={level > 5 ? "scale(0.9) translate(5,5)" : ""}>
                <path d="M20 70 L80 70 A 10 10 0 0 0 80 50 L20 50 A 10 10 0 0 0 20 70" fill="#795548" stroke="#3E2723" strokeWidth="3"/>
                <circle cx="20" cy="60" r="10" fill="#D7CCC8" stroke="#3E2723" strokeWidth="3"/>
                <path d="M20 60 L25 60" stroke="#3E2723" strokeWidth="2"/>
                
                <path d="M25 55 L85 55 A 10 10 0 0 0 85 35 L25 35 A 10 10 0 0 0 25 55" fill="#8D6E63" stroke="#3E2723" strokeWidth="3"/>
                <circle cx="25" cy="45" r="10" fill="#D7CCC8" stroke="#3E2723" strokeWidth="3"/>
                
                {level > 2 && (
                  <>
                    <path d="M15 40 L75 40 A 10 10 0 0 0 75 20 L15 20 A 10 10 0 0 0 15 40" fill="#A1887F" stroke="#3E2723" strokeWidth="3"/>
                    <circle cx="15" cy="30" r="10" fill="#D7CCC8" stroke="#3E2723" strokeWidth="3"/>
                  </>
                )}
             </g>
             {level >= 8 && <path d="M60 10 L70 30 L50 30 Z" fill="#FFD700" className="animate-pulse"/>} {/* Gold trim */}
          </svg>
        );
      
      case ItemType.STONE:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 drop-shadow-md">
            {/* Stone Block / Rune */}
            <rect x="20" y="20" width="60" height="60" rx="10" fill="#90A4AE" stroke="#263238" strokeWidth="4"/>
            <rect x="25" y="15" width="50" height="60" rx="8" fill="#CFD8DC" className="opacity-50"/>
            
            {/* Rune Symbol */}
            <path d="M35 35 L65 35 L50 65 Z" fill="none" stroke={level > 5 ? "#0288D1" : "#546E7A"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={level > 5 ? "animate-pulse" : ""}/>
            <circle cx="50" cy="50" r="20" stroke="#37474F" strokeWidth="2" fill="none" opacity="0.3"/>
            
            {level > 5 && <path d="M50 20 L50 80" stroke="#0288D1" strokeWidth="2" opacity="0.5"/>}
          </svg>
        );

      case ItemType.CROP:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 drop-shadow-md">
            {/* Wheat Bundle */}
            <g transform="translate(10,10)">
                <path d="M40 80 Q 20 40 10 10" stroke="#FFEB3B" strokeWidth="6" fill="none" strokeLinecap="round"/>
                <path d="M40 80 Q 40 30 40 0" stroke="#FDD835" strokeWidth="6" fill="none" strokeLinecap="round"/>
                <path d="M40 80 Q 60 40 70 10" stroke="#FFEB3B" strokeWidth="6" fill="none" strokeLinecap="round"/>
                
                {/* Tie */}
                <rect x="30" y="55" width="20" height="10" fill="#D84315" rx="2"/>
                
                {level > 3 && <circle cx="40" cy="30" r="5" fill="#FFF176" className="animate-ping" style={{animationDuration: '3s'}}/>}
            </g>
          </svg>
        );

      case ItemType.POTION:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 drop-shadow-md">
             {/* Bottle */}
             <path d="M40 20 L60 20 L60 35 L80 60 C 85 75 70 90 50 90 C 30 90 15 75 20 60 L 40 35 Z" fill="#673AB7" stroke="#311B92" strokeWidth="3"/>
             {/* Liquid */}
             <path d="M42 40 L58 40 L75 62 C 78 72 68 85 50 85 C 32 85 22 72 25 62 Z" fill={level > 5 ? "#E040FB" : "#9575CD"} className="animate-pulse"/>
             {/* Cork */}
             <rect x="42" y="10" width="16" height="10" fill="#8D6E63" stroke="#3E2723" strokeWidth="2"/>
             {/* Bubbles */}
             {level > 2 && <circle cx="55" cy="55" r="3" fill="white" opacity="0.6" className="animate-bounce"/>}
             {level > 5 && <circle cx="45" cy="70" r="2" fill="white" opacity="0.4"/>}
          </svg>
        );
    }
  };

  return (
    <div className={`relative w-full h-full rounded-lg shadow-inner flex items-center justify-center overflow-hidden border-2 border-white/10 ${getBgColor()} ${className}`}>
      {/* Radial Highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]"></div>
      
      {/* Icon */}
      <div className={`w-full h-full transform transition-transform duration-200 ${isEpic ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'scale-90'}`}>
        {renderIcon()}
      </div>

      {/* Level Badge */}
      <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] font-bold px-1 rounded border border-white/20 backdrop-blur-sm">
         Lvl {level}
      </div>

      {/* Rare Shine */}
      {isRare && (
        <div className="absolute inset-0 shine-effect opacity-30 pointer-events-none"></div>
      )}
    </div>
  );
};
