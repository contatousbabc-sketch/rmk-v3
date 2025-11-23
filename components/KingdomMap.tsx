
import React from 'react';
import { Parcel, ItemType, GameItem } from '../types';
import { Lock, Hammer, CheckCircle, Coins } from 'lucide-react';
import { ItemVisual } from './ItemVisual';

interface KingdomMapProps {
  parcels: Parcel[];
  playerGold: number;
  inventoryGrid: (GameItem | null)[];
  onRestore: (parcelId: string) => void;
}

/*
  MANUAL DE SUBSTITUIÇÃO (TODO):
  Substitua as URLs abaixo por caminhos de imagens locais quando disponível.
  Recomendado: Imagens JPG de 800x400px.
  Ex: 'p1': '/assets/kingdom/gardens.jpg'
*/
const PARCEL_IMAGES: Record<string, string> = {
  'p1': 'https://images.unsplash.com/photo-1585320806297-117951826047?auto=format&fit=crop&q=80&w=600', // Gardens
  'p2': 'https://images.unsplash.com/photo-1599940824399-b87987ced72a?auto=format&fit=crop&q=80&w=600', // Tower
  'p3': 'https://images.unsplash.com/photo-1620421680010-0766ff230392?auto=format&fit=crop&q=80&w=600', // Market
  'p4': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600'  // Lab
};

export const KingdomMap: React.FC<KingdomMapProps> = ({ parcels, playerGold, inventoryGrid, onRestore }) => {
  
  const checkRequirements = (parcel: Parcel) => {
    if (playerGold < parcel.costGold) return false;
    
    for (const req of parcel.costItems) {
      const found = inventoryGrid.some(slot => slot && slot.type === req.type && slot.level >= req.level);
      if (!found) return false;
    }
    return true;
  };

  const totalIncome = parcels.filter(p => p.isUnlocked).reduce((acc, p) => acc + (p.incomePerTick || 0), 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">MEU REINO</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Restaure glória. Ganhe ouro.</p>
        {totalIncome > 0 && (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold mt-2 bg-emerald-900/20 py-1 px-3 rounded-full mx-auto w-fit border border-emerald-500/30">
                <Coins className="w-4 h-4" />
                <span>+{totalIncome} Ouro / 5s</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 px-2">
        {parcels.map((parcel) => {
          const canAfford = checkRequirements(parcel);
          
          return (
            <div 
              key={parcel.id} 
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-lg
                ${parcel.isUnlocked 
                  ? 'border-emerald-500/50 bg-slate-800' 
                  : 'border-slate-700 bg-slate-900'}
              `}
            >
              <div className="h-36 w-full relative group">
                <img 
                  src={PARCEL_IMAGES[parcel.id] || `https://picsum.photos/seed/${parcel.imageSeed}/600/200`} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${parcel.isUnlocked ? 'group-hover:scale-105' : 'grayscale opacity-50'}`}
                  alt={parcel.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-xl font-black text-white flex items-center gap-2 drop-shadow-md">
                    {parcel.name}
                    {parcel.isUnlocked && <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-900" />}
                  </h3>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-slate-300 text-xs leading-relaxed">{parcel.description}</p>

                {!parcel.isUnlocked ? (
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold">Requisitos</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <span>💰 {parcel.costGold.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {parcel.costItems.map((req, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded overflow-hidden border ${inventoryGrid.some(i => i?.type === req.type && i?.level >= req.level) ? 'border-emerald-500' : 'border-red-500'} bg-slate-800 relative`}>
                                <ItemVisual type={req.type} level={req.level} />
                                <div className="absolute bottom-0 right-0 bg-black/70 text-[8px] text-white px-1 font-bold">Nv{req.level}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                        <Coins className="w-3 h-3" /> Renda: +{parcel.incomePerTick}/ciclo
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => onRestore(parcel.id)}
                      className={`w-full mt-3 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all btn-3d
                        ${canAfford 
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-b-emerald-800 shadow-lg shadow-emerald-900/20' 
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed border-b-slate-900'}
                      `}
                    >
                      {canAfford ? <><Hammer className="w-4 h-4" /> Restaurar</> : <><Lock className="w-3 h-3" /> Bloqueado</>}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-900/20 border border-emerald-500/30 p-2 rounded flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    Gerando Renda (+{parcel.incomePerTick})
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
