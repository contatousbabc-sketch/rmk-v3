
import React from 'react';
import { X, Zap, Coins, Package, Star, ShoppingCart } from 'lucide-react';
import { playSound } from '../utils/audio';

interface ShopModalProps {
  gems: number;
  onClose: () => void;
  onBuyEnergy: () => void;
  onBuyGold: () => void;
  onBuyChest: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ gems, onClose, onBuyEnergy, onBuyGold, onBuyChest }) => {
  const OFFERS = [
    {
      id: 'energy',
      title: 'Energia Total',
      desc: 'Recupere toda sua energia',
      cost: 5,
      icon: <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />,
      color: 'from-yellow-500 to-orange-600',
      action: onBuyEnergy
    },
    {
      id: 'gold',
      title: 'Saco de Ouro',
      desc: '+500 Moedas de Ouro',
      cost: 10,
      icon: <Coins className="w-8 h-8 text-amber-300 fill-amber-500" />,
      color: 'from-amber-400 to-yellow-600',
      action: onBuyGold
    },
    {
      id: 'chest',
      title: 'Baú de Suprimentos',
      desc: 'Itens aleatórios de alto nível',
      cost: 15,
      icon: <Package className="w-8 h-8 text-blue-200 fill-blue-400" />,
      color: 'from-blue-500 to-indigo-600',
      action: onBuyChest
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/30">
                <ShoppingCart className="w-5 h-5 text-fuchsia-400" />
             </div>
             <div>
                 <h2 className="text-xl font-black text-white uppercase tracking-wide">Loja Real</h2>
                 <p className="text-xs text-slate-400 font-bold">Gaste suas gemas com sabedoria</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
           <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-sm font-bold">Seu Saldo</span>
              <div className="flex items-center gap-1.5">
                 <Star className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
                 <span className="text-xl font-black text-white">{gems}</span>
              </div>
           </div>

           <div className="grid gap-4">
              {OFFERS.map((offer) => (
                <div key={offer.id} className="bg-slate-800 rounded-xl p-1 relative overflow-hidden group">
                    <div className="bg-slate-900/80 rounded-lg p-4 flex items-center justify-between border border-slate-700/50 relative z-10 h-full">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center shadow-lg`}>
                                {offer.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{offer.title}</h3>
                                <p className="text-slate-400 text-xs">{offer.desc}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => {
                                if (gems >= offer.cost) {
                                    playSound('success');
                                    offer.action();
                                } else {
                                    playSound('error');
                                }
                            }}
                            disabled={gems < offer.cost}
                            className={`
                                btn-3d min-w-[80px] py-2 rounded-xl flex flex-col items-center justify-center border-b-4
                                ${gems >= offer.cost 
                                    ? 'bg-fuchsia-600 text-white border-fuchsia-900 hover:bg-fuchsia-500' 
                                    : 'bg-slate-700 text-slate-500 border-slate-900 opacity-50 cursor-not-allowed'}
                            `}
                        >
                            <div className="flex items-center gap-1 text-sm font-black">
                                {offer.cost} <Star className="w-3 h-3 fill-current" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider">COMPRAR</span>
                        </button>
                    </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};
