import React from 'react';
import { Gift, Coins, Gem, Sparkles, X } from 'lucide-react';

interface DailyBonusModalProps {
  day: number;
  onClaim: () => void;
  onClose: () => void;
}

interface Reward {
  day: number;
  type: 'gold' | 'gems' | 'epic';
  amount: number;
  label: string;
}

const REWARDS: Reward[] = [
  { day: 1, type: 'gold', amount: 100, label: '100 Ouro' },
  { day: 2, type: 'gold', amount: 200, label: '200 Ouro' },
  { day: 3, type: 'gems', amount: 5, label: '5 Gemas' },
  { day: 4, type: 'gold', amount: 400, label: '400 Ouro' },
  { day: 5, type: 'gems', amount: 10, label: '10 Gemas' },
  { day: 6, type: 'gold', amount: 800, label: '800 Ouro' },
  { day: 7, type: 'epic', amount: 50, label: 'Recompensa Épica!' },
];

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ day, onClaim, onClose }) => {
  const currentReward = REWARDS[(day - 1) % 7];

  const getIcon = (type: string) => {
    switch (type) {
      case 'gold':
        return <Coins className="w-12 h-12 text-amber-400 fill-amber-400" />;
      case 'gems':
        return <Gem className="w-12 h-12 text-cyan-400 fill-cyan-400" />;
      case 'epic':
        return <Sparkles className="w-12 h-12 text-purple-400 fill-purple-400" />;
      default:
        return <Gift className="w-12 h-12 text-white" />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'gold':
        return 'from-amber-600 to-yellow-700';
      case 'gems':
        return 'from-cyan-600 to-blue-700';
      case 'epic':
        return 'from-purple-600 to-pink-700';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn">
      <div className="glass-panel rounded-3xl max-w-md w-full p-8 relative animate__animated animate__bounceIn border-2 border-amber-500/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <Gift className="w-16 h-16 mx-auto text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-3xl font-black fantasy-font text-white mb-2">
            Bônus Diário
          </h2>
          
          <p className="text-slate-300 mb-6">
            Dia <span className="text-amber-400 font-bold">{day}</span> de sua jornada!
          </p>

          <div className={`bg-gradient-to-br ${getGradient(currentReward.type)} rounded-2xl p-8 mb-6 border-4 border-white/20 shadow-2xl`}>
            <div className="flex flex-col items-center gap-4">
              {getIcon(currentReward.type)}
              <div className="text-white">
                <p className="text-sm opacity-80 mb-1">Você ganhou:</p>
                <p className="text-3xl font-black fantasy-font drop-shadow-lg">
                  {currentReward.label}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {REWARDS.map((reward, index) => {
              const isPast = index + 1 < day;
              const isCurrent = index + 1 === day;
              const isFuture = index + 1 > day;

              return (
                <div
                  key={reward.day}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-xs font-bold
                    ${isPast ? 'bg-green-600/30 text-green-400 border-2 border-green-500/50' : ''}
                    ${isCurrent ? 'bg-amber-600/50 text-amber-300 border-2 border-amber-400 animate-pulse' : ''}
                    ${isFuture ? 'bg-slate-700/30 text-slate-500 border-2 border-slate-600/50' : ''}
                  `}
                >
                  {reward.day}
                </div>
              );
            })}
          </div>

          <button
            onClick={onClaim}
            className="btn-game blue w-full py-4 text-xl"
          >
            Coletar Recompensa
          </button>
        </div>
      </div>
    </div>
  );
};
