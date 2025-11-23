
import React, { useState, useRef, useEffect } from 'react';
import { GridSlot, GameItem, ItemType } from '../types';
import { ITEM_DEFINITIONS, MAX_ITEM_LEVEL } from '../constants';
import { Info, Sparkles, Flame } from 'lucide-react';
import { playSound } from '../utils/audio';
import { ItemVisual } from './ItemVisual';
import { triggerVisualEffect } from '../utils/events';
import { ItemTooltip } from './ItemTooltip';

interface MergeGridProps {
  grid: GridSlot[];
  onMerge: (fromIndex: number, toIndex: number) => void;
  onSell: (index: number) => void;
  onItemAck: (itemId: string) => void;
  onCombo?: (count: number) => void; // Callback para o App
}

export const MergeGrid: React.FC<MergeGridProps> = ({ grid, onMerge, onSell, onItemAck, onCombo }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  // Tooltip State
  const [hoveredItem, setHoveredItem] = useState<GameItem | null>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number}>({x:0, y:0});
  
  // Combo System Refs
  const lastMergeTime = useRef<number>(0);
  const comboCount = useRef<number>(0);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- COMBO LOGIC ---
  const registerMerge = () => {
      const now = Date.now();
      if (now - lastMergeTime.current < 2000) { // 2 segundos janela de combo
          comboCount.current++;
      } else {
          comboCount.current = 1;
      }
      lastMergeTime.current = now;
      
      if (comboCount.current >= 3 && onCombo) {
          onCombo(comboCount.current);
      }
      
      return comboCount.current;
  };

  // --- DRAG & DROP (MOUSE) ---

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setHoveredItem(null);
    e.dataTransfer.effectAllowed = "move";
    playSound('pop');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (Math.random() > 0.7) {
        triggerVisualEffect('DRAG_TRAIL', {
            x: e.clientX,
            y: e.clientY,
            color: '#fbbf24'
        });
    }
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex === toIndex) return;

    const fromSlot = grid[draggedIndex];
    const toSlot = grid[toIndex];

    // Check for Merge
    if (fromSlot.item && toSlot.item && fromSlot.item.type === toSlot.item.type && fromSlot.item.level === toSlot.item.level) {
        const rect = slotRefs.current[toIndex]?.getBoundingClientRect();
        if (rect) {
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            triggerVisualEffect('MERGE_EXPLOSION', { x: cx, y: cy });
            
            const combo = registerMerge();
            if (combo >= 3) {
                 triggerVisualEffect('TEXT_POPUP', { x: cx, y: cy - 50, text: `${combo}x COMBO!`, color: '#ef4444' });
            }
            
            triggerVisualEffect('SCREEN_SHAKE');
        }
    }

    onMerge(draggedIndex, toIndex);
    setDraggedIndex(null);
  };

  // --- MOUSE HOVER LOGIC ---
  const handleMouseEnter = (e: React.MouseEvent, item: GameItem | null) => {
      if (item && !draggedIndex) {
          setHoveredItem(item);
          setHoverPos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (hoveredItem) {
          setHoverPos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseLeave = () => {
      setHoveredItem(null);
  };

  // --- TOUCH INTERACTION ---

  const handleTouchStart = (index: number) => {
    playSound('pop');
    setHoveredItem(null);
    
    if (selectedSlot === index) {
        setSelectedSlot(null);
        return;
    }

    if (selectedSlot === null) {
      if (grid[index].item) {
        setSelectedSlot(index);
        const rect = slotRefs.current[index]?.getBoundingClientRect();
        if (rect) {
            triggerVisualEffect('SHOCKWAVE', { x: rect.left + rect.width/2, y: rect.top + rect.height/2, color: 'rgba(255,255,255,0.3)' });
        }
      }
      return;
    } 
    
    const fromSlot = grid[selectedSlot];
    const toSlot = grid[index];
    if (fromSlot.item && toSlot.item && fromSlot.item.type === toSlot.item.type && fromSlot.item.level === toSlot.item.level) {
         const rect = slotRefs.current[index]?.getBoundingClientRect();
         if (rect) {
             const cx = rect.left + rect.width/2;
             const cy = rect.top + rect.height/2;
             triggerVisualEffect('MERGE_EXPLOSION', { x: cx, y: cy });
             const combo = registerMerge();
             if (combo >= 3) {
                 triggerVisualEffect('TEXT_POPUP', { x: cx, y: cy - 50, text: `${combo}x COMBO!`, color: '#ef4444' });
             }
             triggerVisualEffect('SCREEN_SHAKE');
         }
    }

    onMerge(selectedSlot, index);
    setSelectedSlot(null);
  };

  const getSellValue = (type: ItemType, level: number) => {
    return Math.floor(ITEM_DEFINITIONS[type].baseValue * Math.pow(2, level - 1));
  };

  const getRarityClasses = (level: number) => {
    if (level >= 8) return 'border-fuchsia-500 shadow-[0_0_25px_rgba(217,70,239,0.8)] ring-2 ring-fuchsia-500/50';
    if (level >= 5) return 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] ring-1 ring-amber-400/50';
    if (level >= 3) return 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]';
    return 'border-slate-600/50';
  };

  return (
    <>
      {hoveredItem && <ItemTooltip item={hoveredItem} position={hoverPos} />}

      <div className="flex flex-col h-full gap-4">
        <div className="relative bg-[#0f172a] p-3 rounded-3xl border-[3px] border-amber-900/50 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="grid grid-cols-6 gap-2 relative z-10">
            {grid.map((slot, i) => (
              <div
                key={i}
                ref={el => { slotRefs.current[i] = el; }}
                className={`
                  aspect-square relative rounded-xl transition-all duration-150
                  ${selectedSlot === i 
                    ? 'bg-indigo-500/20 ring-2 ring-amber-400 z-20 scale-105' 
                    : 'bg-slate-900/80 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-white/5'}
                  ${draggedIndex === i ? 'opacity-30' : 'opacity-100'}
                `}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onClick={() => handleTouchStart(i)}
              >
                {slot.item && (
                  <div
                    key={slot.item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onMouseEnter={(e) => handleMouseEnter(e, slot.item)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onAnimationEnd={() => {
                      if (slot.item?.isNew) {
                        onItemAck(slot.item.id);
                      }
                    }}
                    className={`
                      w-full h-full p-1 cursor-grab active:cursor-grabbing rounded-xl border-b-[3px] active:border-b-0 active:translate-y-0.5 transition-transform duration-100
                      bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-visible group hover:-translate-y-0.5
                      ${getRarityClasses(slot.item.level)}
                      ${slot.item.isNew ? (slot.item.effectType === 'merge' ? 'animate-merge z-30' : 'animate-pop-in z-30') : ''}
                    `}
                  >
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                       <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                      <ItemVisual type={slot.item.type} level={slot.item.level} />
                    </div>
                    
                    <div className="absolute -bottom-1.5 -right-1.5 bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-700 z-10 shadow-lg min-w-[18px] text-center">
                      {slot.item.level}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-none animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-[#1e293b] rounded-2xl p-0.5 border border-slate-600 shadow-2xl relative">
              <div className="absolute inset-x-0 -bottom-4 h-4 bg-black/50 blur-xl -z-10"></div>
              
              <div className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-2xl p-4 flex items-center justify-between">
                  {selectedSlot !== null && grid[selectedSlot].item ? (
                      <>
                          <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 bg-slate-900 rounded-xl border-2 flex items-center justify-center shadow-lg overflow-hidden relative ${getRarityClasses(grid[selectedSlot].item!.level)}`}>
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                  <div className="w-full h-full p-1 z-10">
                                      <ItemVisual type={grid[selectedSlot].item!.type} level={grid[selectedSlot].item!.level} />
                                  </div>
                              </div>
                              <div>
                                  <h3 className="text-white font-black text-xl leading-none mb-1 tracking-wide drop-shadow-md">
                                      {ITEM_DEFINITIONS[grid[selectedSlot].item!.type].name}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border
                                          ${grid[selectedSlot].item!.level >= 5 ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-700 text-slate-300 border-slate-600'}
                                      `}>
                                          Nível {grid[selectedSlot].item!.level}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          
                          <button 
                              onClick={(e) => {
                                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                                  const val = getSellValue(grid[selectedSlot].item!.type, grid[selectedSlot].item!.level);
                                  
                                  triggerVisualEffect('TEXT_POPUP', { 
                                      x: rect.left + rect.width/2, 
                                      y: rect.top,
                                      text: `+${val}`,
                                      color: '#FCD34D'
                                  });
                                  triggerVisualEffect('GOLD_RAIN'); 
                                  playSound('coin');
                                  onSell(selectedSlot);
                                  setSelectedSlot(null);
                              }}
                              className="btn-game red px-6 py-4 rounded-xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 flex flex-col items-center leading-none gap-1"
                          >
                              <span>VENDER</span>
                              <span className="text-[10px] text-red-200">+{getSellValue(grid[selectedSlot].item!.type, grid[selectedSlot].item!.level)} <span className="text-yellow-300">●</span></span>
                          </button>
                      </>
                  ) : (
                      <div className="w-full flex items-center justify-center text-slate-500 gap-3 py-2 opacity-50">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <span className="text-sm font-bold uppercase tracking-widest">Selecione para Detalhes</span>
                          <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                  )}
              </div>
          </div>
        </div>
      </div>
    </>
  );
};
