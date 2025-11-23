
import React, { useState } from 'react';
import { X, Shield, Star, Coins, Crown, LogOut, Edit2, Save, Check } from 'lucide-react';
import { PlayerState } from '../types';

interface UserProfileModalProps {
  user: any;
  playerState: PlayerState;
  onClose: () => void;
  onLogout: () => void;
  onUpdateName: (newName: string) => void;
  avatarFrame?: string;
  onFrameChange?: (frameId: string) => void;
}

interface AvatarFrame {
  id: string;
  name: string;
  gradient: string;
  shadow: string;
  minLevel: number;
  borderWidth: string;
}

const FRAMES: AvatarFrame[] = [
  { id: 'default', name: 'Padrão', gradient: 'from-slate-500 to-slate-700', shadow: 'rgba(100,116,139,0.4)', minLevel: 1, borderWidth: '4px' },
  { id: 'silver', name: 'Prata Real', gradient: 'from-slate-300 to-slate-500', shadow: 'rgba(203,213,225,0.6)', minLevel: 5, borderWidth: '5px' },
  { id: 'emerald', name: 'Esmeralda', gradient: 'from-emerald-400 to-emerald-600', shadow: 'rgba(16,185,129,0.6)', minLevel: 10, borderWidth: '5px' },
  { id: 'void', name: 'Vazio', gradient: 'from-purple-600 to-indigo-900', shadow: 'rgba(124,58,237,0.7)', minLevel: 15, borderWidth: '6px' },
  { id: 'legend', name: 'Lenda Dourada', gradient: 'from-yellow-300 via-amber-500 to-yellow-600', shadow: 'rgba(245,158,11,0.8)', minLevel: 20, borderWidth: '6px' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, playerState, onClose, onLogout, onUpdateName, avatarFrame = 'default', onFrameChange }) => {
  const xpProgress = Math.min(100, (playerState.xp / (playerState.level * 100)) * 100);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [selectedFrame, setSelectedFrame] = useState(avatarFrame);

  const handleSave = () => {
      if (newName.trim().length > 0) {
          onUpdateName(newName);
          setIsEditing(false);
      }
  };

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrame(frameId);
    if (onFrameChange) {
      onFrameChange(frameId);
    }
  };

  const currentFrame = FRAMES.find(f => f.id === selectedFrame) || FRAMES[0];
  const availableFrames = FRAMES.filter(f => f.minLevel <= playerState.level);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm relative">
        
        <div className="gold-frame bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="h-32 bg-gradient-to-b from-indigo-900 to-slate-900 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Avatar */}
          <div className="relative -mt-16 flex flex-col items-center px-6 pb-6">
             <div 
                className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${currentFrame.gradient} p-[${currentFrame.borderWidth}] overflow-hidden relative z-10 group animate-pulse-glow`}
                style={{ boxShadow: `0 0 30px ${currentFrame.shadow}` }}
             >
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-800">
                  {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-4xl font-black">
                          {user?.displayName?.charAt(0) || "K"}
                      </div>
                  )}
                </div>
             </div>

             {/* Frame Selector */}
             <div className="mt-4 w-full">
                <p className="text-xs text-slate-400 font-bold mb-2 text-center uppercase">Molduras do Avatar</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {FRAMES.map(frame => {
                    const isUnlocked = frame.minLevel <= playerState.level;
                    const isSelected = frame.id === selectedFrame;
                    
                    return (
                      <button
                        key={frame.id}
                        onClick={() => isUnlocked && handleFrameSelect(frame.id)}
                        disabled={!isUnlocked}
                        className={`
                          w-12 h-12 rounded-lg bg-gradient-to-br ${frame.gradient} p-0.5 
                          ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
                          ${!isUnlocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                          transition-all duration-200 relative
                        `}
                        title={`${frame.name} (Nível ${frame.minLevel}+)`}
                      >
                        <div className="w-full h-full rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                          {isUnlocked ? (
                            isSelected ? <Check className="w-4 h-4" /> : frame.minLevel
                          ) : (
                            <Shield className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  {availableFrames.length}/{FRAMES.length} desbloqueadas
                </p>
             </div>
             
             {/* Name Editor */}
             <div className="mt-4 text-center w-full relative">
                 {isEditing ? (
                     <div className="flex items-center justify-center gap-2 animate-in fade-in">
                         <input 
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-slate-800 border border-indigo-500 text-white rounded px-2 py-1 text-center font-bold text-lg w-full max-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            autoFocus
                         />
                         <button onClick={handleSave} className="p-1.5 bg-emerald-600 rounded text-white hover:bg-emerald-500">
                             <Save className="w-4 h-4" />
                         </button>
                     </div>
                 ) : (
                     <div className="flex items-center justify-center gap-2 group">
                        <h2 className="text-2xl font-black text-white drop-shadow-md truncate max-w-[250px]">
                            {user?.displayName || "Soberano"}
                        </h2>
                        <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-4 h-4" />
                        </button>
                     </div>
                 )}

                 <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold bg-slate-900/50 py-1 px-3 rounded-full mt-2 border border-slate-700 w-fit mx-auto">
                    <Shield className="w-3 h-3" />
                    <span>ID: {user?.uid ? (user.uid.length > 10 ? user.uid.slice(0,8)+'...' : user.uid) : 'GUEST'}</span>
                 </div>
             </div>

             {/* Stats Grid */}
             <div className="grid grid-cols-3 gap-3 w-full mt-6">
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 flex flex-col items-center">
                    <Crown className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs text-slate-400 uppercase font-bold">Nível</span>
                    <span className="text-xl font-black text-white">{playerState.level}</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 flex flex-col items-center">
                    <Star className="w-5 h-5 text-fuchsia-400 mb-1" />
                    <span className="text-xs text-slate-400 uppercase font-bold">Gemas</span>
                    <span className="text-xl font-black text-white">{playerState.gems}</span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 flex flex-col items-center">
                    <Coins className="w-5 h-5 text-yellow-400 mb-1" />
                    <span className="text-xs text-slate-400 uppercase font-bold">Ouro</span>
                    <span className="text-sm font-black text-white truncate w-full text-center">{(playerState.gold / 1000).toFixed(1)}k</span>
                </div>
             </div>

             {/* XP Bar */}
             <div className="w-full mt-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>Progresso do Nível</span>
                    <span>{Math.floor(xpProgress)}%</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full border border-slate-700 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                    ></div>
                </div>
             </div>

             {/* Logout Button */}
             <button 
                onClick={onLogout}
                className="w-full mt-6 py-3 rounded-xl border border-red-900/50 bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
             >
                <LogOut className="w-4 h-4" />
                SAIR DA CONTA
             </button>

          </div>
        </div>
      </div>
    </div>
  );
};
