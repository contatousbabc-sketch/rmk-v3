
import React, { useState, useEffect, useRef } from 'react';
import { GameTab, GridSlot, PlayerState, GameItem, ItemType, Parcel, Mission, Hero } from './types';
import { GRID_SIZE, INITIAL_PARCELS, MAX_ITEM_LEVEL, ITEM_DEFINITIONS, INITIAL_HEROES } from './constants';
import { MergeGrid } from './components/MergeGrid';
import { KingdomMap } from './components/KingdomMap';
import { AdventureMap } from './components/AdventureMap';
import { StartScreen } from './components/StartScreen';
import { LevelUpModal } from './components/LevelUpModal';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { Match3Board } from './components/Match3Board';
import { UserProfileModal } from './components/UserProfileModal';
import { VisualEffects } from './components/VisualEffects';
import { IntroVideo } from './components/IntroVideo';
import { DailyBonusModal } from './components/DailyBonusModal';
import { ParallaxBackground } from './components/ParallaxBackground';
import { HeroesModal } from './components/HeroesModal';
// Added Flame to imports
import { Zap, Coins, Map, Grid as GridIcon, Sword, Plus, Clock, LogOut, Sun, Moon, Flame, User } from 'lucide-react';
import { playSound } from './utils/audio';
import { auth, loginWithGoogle, logout, getMockSession, updateUserProfile, MOCK_SESSION_KEY } from './utils/firebase';
import { triggerVisualEffect } from './utils/events';
import { generateItemLore, generateDynamicMissions } from './utils/ai';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // --- Game State ---
  const [gameState, setGameState] = useState<'START' | 'PLAYING'>('START');
  const [activeTab, setActiveTab] = useState<GameTab>('merge');
  const [isShaking, setIsShaking] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [frenzyMode, setFrenzyMode] = useState(false);
  
  // Modals State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showHeroes, setShowHeroes] = useState(false);
  
  // Battle State
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showBattleTransition, setShowBattleTransition] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  
  // Heroes State
  const [unlockedHeroes, setUnlockedHeroes] = useState<Hero[]>(INITIAL_HEROES);
  const [selectedHeroId, setSelectedHeroId] = useState<string>('h1');

  // User Customization
  const [avatarFrame, setAvatarFrame] = useState('default');
  const [loginStreak, setLoginStreak] = useState(1);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  
  const INITIAL_PLAYER_STATE: PlayerState = {
    gold: 100,
    gems: 25,
    energy: 30,
    maxEnergy: 50,
    xp: 0,
    level: 1
  };

  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [incomeTimer, setIncomeTimer] = useState(0); 
  const [grid, setGrid] = useState<GridSlot[]>(() => 
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({ index: i, item: null }))
  );
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);

  // --- INITIALIZATION ---
  useEffect(() => {
      // Init Day/Night
      const hour = new Date().getHours();
      setIsNight(hour < 6 || hour > 18);

      // Load initial missions
      generateDynamicMissions(1).then(setMissions);
  }, []);

  // --- DAY/NIGHT CYCLE ---
  useEffect(() => {
      const interval = setInterval(() => {
          setIsNight(prev => !prev);
          triggerVisualEffect('TEXT_POPUP', { text: isNight ? "O Sol Nasce" : "A Noite Cai", color: '#fff' });
      }, 60000 * 5); // 5 min cycle
      return () => clearInterval(interval);
  }, [isNight]);

  // --- FRENZY MODE TIMER ---
  useEffect(() => {
      if (frenzyMode) {
          const timer = setTimeout(() => setFrenzyMode(false), 5000); // 5s of Frenzy
          return () => clearTimeout(timer);
      }
  }, [frenzyMode]);

  // --- VISUAL EVENT LISTENERS ---
  useEffect(() => {
      const handleShake = (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.type === 'SCREEN_SHAKE') {
              setIsShaking(true);
              setTimeout(() => setIsShaking(false), 400);
          }
      };
      window.addEventListener('rmk-visual-effect', handleShake);
      return () => window.removeEventListener('rmk-visual-effect', handleShake);
  }, []);

  // --- AUTH & PERSISTENCE ---
  useEffect(() => {
      let unsubscribe = () => {};
      if (auth) {
          unsubscribe = auth.onAuthStateChanged((u: any) => {
              if (u) handleUserLoggedIn(u);
          });
      } else {
          const mockSession = getMockSession();
          if (mockSession) handleUserLoggedIn(mockSession);
      }
      return () => unsubscribe();
  }, []);

  const handleUserLoggedIn = (u: any) => {
      setUser(u);
      loadGameData(u.uid);
      checkDailyLogin(u.uid);
      
      // Show intro video for first-time visitors
      const hasSeenIntro = localStorage.getItem(`intro_seen_${u.uid}`);
      if (!hasSeenIntro) {
        setShowIntroVideo(true);
        localStorage.setItem(`intro_seen_${u.uid}`, 'true');
      }
      
      setGameState('PLAYING');
  };

  const handleLogin = async () => {
      setIsAuthLoading(true);
      try {
          const userResult = await loginWithGoogle();
          if (userResult) handleUserLoggedIn(userResult);
      } catch (error) {
          alert("Não foi possível conectar. Tente novamente.");
      } finally {
          setIsAuthLoading(false);
      }
  };

  const handleGuestPlay = () => {
      const guestUser = { uid: 'guest_' + Date.now(), displayName: 'Visitante', photoURL: null, isGuest: true };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(guestUser));
      handleUserLoggedIn(guestUser);
      setTimeout(() => setShowTutorial(true), 1000);
  };

  const handleLogout = async () => {
      if (window.confirm("Tem certeza que deseja sair da conta?")) {
        await logout();
        window.location.reload();
      }
  };

  const handleUpdateProfileName = async (newName: string) => {
      if (!user) return;
      try {
          const updatedUser = await updateUserProfile(user, newName);
          setUser(updatedUser);
          playSound('success');
          triggerVisualEffect('CONFETTI');
      } catch (e) {
          alert("Erro ao atualizar perfil.");
      }
  };

  // --- DAILY LOGIN SYSTEM ---
  const checkDailyLogin = (uid: string) => {
      const loginData = localStorage.getItem(`daily_login_${uid}`);
      const today = new Date().toDateString();
      
      if (loginData) {
          const { lastLogin, streak, claimed } = JSON.parse(loginData);
          const lastLoginDate = new Date(lastLogin);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLogin === today) {
              // Already logged in today
              setLoginStreak(streak);
              setLastLoginDate(lastLogin);
              // Don't show bonus if already claimed today
              if (!claimed) {
                  setShowDailyBonus(true);
              }
              return;
          } else if (lastLoginDate.toDateString() === yesterday.toDateString()) {
              // Consecutive day
              const newStreak = streak + 1;
              setLoginStreak(newStreak);
              setLastLoginDate(today);
              setShowDailyBonus(true);
              localStorage.setItem(`daily_login_${uid}`, JSON.stringify({ lastLogin: today, streak: newStreak, claimed: false }));
          } else {
              // Streak broken, reset to 1
              setLoginStreak(1);
              setLastLoginDate(today);
              setShowDailyBonus(true);
              localStorage.setItem(`daily_login_${uid}`, JSON.stringify({ lastLogin: today, streak: 1, claimed: false }));
          }
      } else {
          // First time login
          setLoginStreak(1);
          setLastLoginDate(today);
          setShowDailyBonus(true);
          localStorage.setItem(`daily_login_${uid}`, JSON.stringify({ lastLogin: today, streak: 1, claimed: false }));
      }
  };

  const handleClaimDailyBonus = () => {
      if (!user) return;
      
      const rewards = [
        { day: 1, gold: 100, gems: 0 },
        { day: 2, gold: 200, gems: 0 },
        { day: 3, gold: 0, gems: 5 },
        { day: 4, gold: 400, gems: 0 },
        { day: 5, gold: 0, gems: 10 },
        { day: 6, gold: 800, gems: 0 },
        { day: 7, gold: 0, gems: 50 },
      ];
      
      const currentReward = rewards[(loginStreak - 1) % 7];
      
      // Update player rewards
      setPlayer(prev => ({
          ...prev,
          gold: prev.gold + currentReward.gold,
          gems: prev.gems + currentReward.gems,
      }));
      
      // Mark as claimed by updating the login data with claimed flag
      const today = new Date().toDateString();
      localStorage.setItem(`daily_login_${user.uid}`, JSON.stringify({ 
        lastLogin: today, 
        streak: loginStreak,
        claimed: true 
      }));
      
      playSound('success');
      triggerVisualEffect('CONFETTI');
      setShowDailyBonus(false);
  };

  // --- SAVE / LOAD SYSTEM ---
  const saveGameData = () => {
      if (!user) return;
      const saveData = { 
          player, 
          grid, 
          parcels, 
          avatarFrame,
          selectedHeroId,
          timestamp: Date.now() 
      };
      localStorage.setItem(`save_rmk_${user.uid}`, JSON.stringify(saveData));
  };

  const loadGameData = (uid: string) => {
      const saved = localStorage.getItem(`save_rmk_${uid}`);
      if (saved) {
          try {
              const data = JSON.parse(saved);
              setPlayer(data.player);
              setGrid(data.grid);
              setParcels(data.parcels);
              if (data.avatarFrame) setAvatarFrame(data.avatarFrame);
              if (data.selectedHeroId) setSelectedHeroId(data.selectedHeroId);
          } catch (e) {
              console.error("Erro no load:", e);
          }
      } else {
          setPlayer(INITIAL_PLAYER_STATE);
          setGrid(Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({ index: i, item: null })));
          setParcels(INITIAL_PARCELS);
          if (!uid.startsWith('guest_')) setTimeout(() => setShowTutorial(true), 500);
      }
  };

  // Auto-Save
  useEffect(() => {
      if (gameState === 'PLAYING' && user) {
          const timer = setTimeout(saveGameData, 1000);
          return () => clearTimeout(timer);
      }
  }, [player, grid, parcels, avatarFrame, selectedHeroId, user, gameState]);


  // --- XP & Level Up ---
  useEffect(() => {
    const xpThreshold = player.level * 100; 
    if (player.xp >= xpThreshold) {
       setPlayer(prev => ({
         ...prev,
         level: prev.level + 1,
         xp: prev.xp - xpThreshold,
         energy: prev.maxEnergy + 5, 
         maxEnergy: prev.maxEnergy + 5,
         gems: prev.gems + 5
       }));
       setShowLevelUp(true);
       playSound('success');
       triggerVisualEffect('CONFETTI');
       
       // Generate new AI missions for new level
       generateDynamicMissions(player.level + 1).then(newMissions => {
           setMissions(prev => [...prev, ...newMissions]);
       });
    }
  }, [player.xp, player.level]);

  // --- Game Loop ---
  useEffect(() => {
    const TICK_RATE_MS = 100; 
    const INCOME_CYCLE_MS = frenzyMode ? 2500 : 5000; // Faster income in Frenzy
    
    const interval = setInterval(() => {
      if (gameState !== 'PLAYING') return;

      setIncomeTimer(prev => {
        const next = prev + (TICK_RATE_MS / INCOME_CYCLE_MS) * 100;
        if (next >= 100) {
           setPlayer(p => {
               const rawIncome = parcels.filter(par => par.isUnlocked).reduce((acc, par) => acc + (par.incomePerTick || 0), 0);
               const income = frenzyMode ? rawIncome * 2 : rawIncome;
               
               if (income > 0) {
                   triggerVisualEffect('TEXT_POPUP', { 
                       text: `+${income}`, 
                       x: window.innerWidth / 2, 
                       y: 80,
                       color: '#FCD34D'
                   });
                   triggerVisualEffect('GOLD_RAIN');
               }
               return { ...p, gold: p.gold + income };
           });
           return 0;
        }
        return next;
      });

    }, TICK_RATE_MS);

    const energyInterval = setInterval(() => {
        if (gameState !== 'PLAYING') return;
        setPlayer(p => p.energy < p.maxEnergy ? { ...p, energy: p.energy + 1 } : p);
    }, 30000);

    return () => {
        clearInterval(interval);
        clearInterval(energyInterval);
    };
  }, [gameState, parcels, frenzyMode]);

  const resetGame = () => {
    if (window.confirm("Isso apagará todo o progresso atual deste usuário. Tem certeza?")) {
        if (user) localStorage.removeItem(`save_rmk_${user.uid}`);
        setPlayer(INITIAL_PLAYER_STATE);
        setGrid(Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({ index: i, item: null })));
        setParcels(INITIAL_PARCELS);
        setShowSettings(false);
        playSound('error');
    }
  };

  const spawnItem = (type: ItemType, level: number) => {
    const emptySlotIndex = grid.findIndex(s => s.item === null);
    if (emptySlotIndex === -1) return false;

    const newItem: GameItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      level,
      isNew: true,
      effectType: 'spawn'
    };

    setGrid(prev => {
      // Re-verify the slot is still empty in the latest state
      const safeIndex = prev[emptySlotIndex].item === null ? emptySlotIndex : prev.findIndex(s => s.item === null);
      if (safeIndex === -1) return prev;

      const newGrid = [...prev];
      newGrid[safeIndex] = { ...newGrid[safeIndex], item: newItem };
      return newGrid;
    });
    playSound('pop');
    return true;
  };

  const handleMerge = async (fromIndex: number, toIndex: number) => {
    if (!grid[fromIndex].item) return;

    setGrid(prev => {
      const newGrid = [...prev];
      const sourceSlot = newGrid[fromIndex];
      const targetSlot = newGrid[toIndex];

      // Item might have been moved/consumed by another event
      if (!sourceSlot.item) return prev;

      // Case 1: Move (target empty)
      if (!targetSlot.item) {
        newGrid[toIndex] = { ...targetSlot, item: sourceSlot.item };
        newGrid[fromIndex] = { ...sourceSlot, item: null };
        return newGrid;
      }

      // Case 2: Merge
      if (targetSlot.item.type === sourceSlot.item.type &&
          targetSlot.item.level === sourceSlot.item.level &&
          targetSlot.item.level < MAX_ITEM_LEVEL
      ) {
        const newLevel = targetSlot.item.level + 1;
        
        const newItem: GameItem = {
          ...targetSlot.item,
          id: Math.random().toString(36).substr(2, 9),
          level: newLevel,
          isNew: true,
          effectType: 'merge'
        };
        
        newGrid[toIndex] = { ...targetSlot, item: newItem };
        newGrid[fromIndex] = { ...sourceSlot, item: null };
        
        // Prepare to generate lore async
        if (newLevel >= 5) {
             generateItemLore(newItem.type, newLevel).then(lore => {
                 setGrid(curr => curr.map(s => 
                     (s.item && s.item.id === newItem.id) ? { ...s, item: { ...s.item!, lore } } : s
                 ));
             });
        }
        
        setPlayer(p => ({ ...p, xp: p.xp + (newItem.level * 10) }));
        playSound('merge');
        return newGrid;
      }

      // Case 3: Swap
      const tempItem = targetSlot.item;
      newGrid[toIndex] = { ...targetSlot, item: sourceSlot.item };
      newGrid[fromIndex] = { ...sourceSlot, item: tempItem };
      playSound('pop');
      return newGrid;
    });
  };

  const handleSell = (index: number) => {
    // We should re-check item existence inside updater, but for calculation we need it now.
    // However, if we calculate price based on stale item, it's a minor exploit/bug risk.
    // Better to just queue the update.

    setGrid(prev => {
      const slot = prev[index];
      if (!slot.item) return prev;

      const item = slot.item;
      const value = Math.floor(ITEM_DEFINITIONS[item.type].baseValue * Math.pow(2, item.level - 1));

      // Side effect in reducer is not ideal but needed for synchronous feedback loop in this architecture
      setPlayer(p => ({ ...p, gold: p.gold + value, xp: p.xp + 5 }));

      const newGrid = [...prev];
      newGrid[index] = { ...slot, item: null };
      return newGrid;
    });
  };
  
  const handleCombo = (count: number) => {
      if (count >= 3 && !frenzyMode) {
          setFrenzyMode(true);
          playSound('magic');
      }
  };

  const handleRestoreParcel = (parcelId: string) => {
    const parcel = parcels.find(p => p.id === parcelId);
    if (!parcel) return;
    
    let itemsFound = true;
    const itemsToConsume: number[] = [];
    const tempGrid = [...grid]; 

    for (const req of parcel.costItems) {
       const slotIndex = tempGrid.findIndex(s => s.item && s.item.type === req.type && s.item.level >= req.level && !itemsToConsume.includes(s.index));
       if (slotIndex === -1) {
         itemsFound = false;
         break;
       }
       itemsToConsume.push(slotIndex);
    }

    if (player.gold >= parcel.costGold && itemsFound) {
      setPlayer(prev => ({ ...prev, gold: prev.gold - parcel.costGold, xp: prev.xp + 250 })); 
      setGrid(prev => {
        const next = [...prev];
        itemsToConsume.forEach(idx => {
          // Immutable update
          next[idx] = { ...next[idx], item: null };
        });
        return next;
      });
      setParcels(prev => prev.map(p => p.id === parcelId ? { ...p, isUnlocked: true } : p));
      playSound('magic');
      triggerVisualEffect('CONFETTI');
    } else {
      playSound('error');
    }
  };

  const handleStartMission = (mission: Mission) => {
      if (player.energy >= mission.cost) {
          playSound('pop'); 
          setShowBattleTransition(true);
          
          setTimeout(() => {
            setPlayer(p => ({...p, energy: p.energy - mission.cost}));
            setActiveMission(mission);
            setShowBattleTransition(false);
          }, 1500);
      } else {
          setShowShop(true);
      }
  };

  const handleMatch3Complete = (success: boolean, score: number) => {
      if (success && activeMission) {
          const level = Math.floor(Math.random() * 3) + 1;
          spawnItem(activeMission.rewardType, level);
          setPlayer(p => ({ ...p, xp: p.xp + 100 }));
          playSound('success');
          triggerVisualEffect('CONFETTI');
      }
      setActiveMission(null);
  };

  const handleItemAck = (itemId: string) => {
    setGrid(prev => prev.map(slot => {
      if (slot.item && slot.item.id === itemId && slot.item.isNew) {
        return { ...slot, item: { ...slot.item, isNew: false } };
      }
      return slot;
    }));
  };

  // --- RENDER ---

  if (gameState === 'START') {
      return <StartScreen onLogin={handleLogin} onGuest={handleGuestPlay} isLoading={isAuthLoading} />;
  }

  const incomePerCycle = parcels.filter(p => p.isUnlocked).reduce((acc, p) => acc + (p.incomePerTick || 0), 0);
  const xpPercentage = Math.min(100, (player.xp / (player.level * 100)) * 100);

  return (
    <div className={`app-container ${isNight ? 'night-mode' : ''} ${frenzyMode ? 'frenzy-mode' : ''}`}>
      <VisualEffects />
      
      {/* Intro Video */}
      {showIntroVideo && <IntroVideo onClose={() => setShowIntroVideo(false)} />}
      
      {/* Daily Bonus Modal */}
      {showDailyBonus && (
        <DailyBonusModal 
          day={loginStreak} 
          onClaim={handleClaimDailyBonus}
          onClose={() => setShowDailyBonus(false)}
        />
      )}

      {/* Heroes Modal */}
      {showHeroes && (
        <HeroesModal
            unlockedHeroes={unlockedHeroes}
            selectedHeroId={selectedHeroId}
            onSelectHero={(id) => setSelectedHeroId(id)}
            onClose={() => setShowHeroes(false)}
        />
      )}
      
      {/* Shake Wrapper */}
      <div className={`screen-shaker ${isShaking ? 'is-shaking' : ''}`}>
        
        {/* Parallax Background */}
        <ParallaxBackground isNight={isNight} />

        {showBattleTransition && (
            <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-red-900/20 animate-pulse"></div>
                <div className="relative z-10 flex items-center justify-center gap-8 animate-clash-shake">
                   <Sword className="w-48 h-48 text-white fill-slate-300 animate-clash-left drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]" />
                   <Sword className="w-48 h-48 text-white fill-slate-300 animate-clash-right scale-x-[-1] drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]" />
                </div>
                <div className="absolute inset-0 bg-white animate-flash pointer-events-none mix-blend-overlay"></div>
            </div>
        )}

        {activeMission && (
            <Match3Board 
               moves={activeMission.moves}
               targetScore={activeMission.targetScore}
               difficulty={activeMission.difficulty}
               hero={unlockedHeroes.find(h => h.id === selectedHeroId)}
               onComplete={handleMatch3Complete}
               onExit={() => setActiveMission(null)}
            />
        )}
        
        {/* Modals */}
        {showLevelUp && <LevelUpModal level={player.level} onClose={() => setShowLevelUp(false)} />}
        {showShop && <ShopModal gems={player.gems} onClose={() => setShowShop(false)} onBuyEnergy={() => {setPlayer(p=>({...p, energy: p.maxEnergy, gems: p.gems-5})); setShowShop(false); triggerVisualEffect('CONFETTI');}} onBuyGold={() => {setPlayer(p=>({...p, gold: p.gold+500, gems: p.gems-10})); setShowShop(false); triggerVisualEffect('GOLD_RAIN');}} onBuyChest={() => {setPlayer(p=>({...p, gems: p.gems-15})); setShowShop(false); spawnItem(ItemType.WOOD, 4); triggerVisualEffect('CONFETTI');}} />}
        
        {showSettings && (
            <SettingsModal 
              onClose={() => setShowSettings(false)} 
              onReset={resetGame} 
              onOpenProfile={() => { setShowSettings(false); setShowProfile(true); }}
            />
        )}
        
        {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
        
        {showProfile && (
            <UserProfileModal 
              user={user} 
              playerState={player} 
              onClose={() => setShowProfile(false)} 
              onLogout={handleLogout} 
              onUpdateName={handleUpdateProfileName}
              avatarFrame={avatarFrame}
              onFrameChange={setAvatarFrame}
            />
        )}

        {/* --- Header --- */}
        <div className="relative z-10 p-2">
          <div className="glass-panel rounded-2xl flex items-center justify-between p-2 px-3">
               {/* Level & User */}
               <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => { playSound('pop'); setShowProfile(true); }}>
                   <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border-[3px] border-slate-800 flex items-center justify-center shadow-lg relative overflow-hidden ring-2 ring-blue-500/30">
                      {user?.photoURL ? (
                          <img src={user.photoURL} className="w-full h-full object-cover" alt="User" />
                      ) : (
                          <span className="text-white font-black text-lg">{user?.displayName?.charAt(0)}</span>
                      )}
                   </div>
                   <div className="flex flex-col w-24">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-200 font-bold uppercase truncate max-w-[60px]">{user?.displayName || `Visitante`}</span>
                        <span className="text-[9px] text-blue-300 font-black">NVL {player.level}</span>
                      </div>
                      <div className="h-2.5 bg-slate-900 rounded-full border border-slate-700 overflow-hidden relative mt-0.5">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-500 shadow-[0_0_10px_rgba(96,165,250,0.8)]" style={{width: `${xpPercentage}%`}}></div>
                      </div>
                   </div>
               </div>

               {/* Day/Night & Timer */}
               <div className="flex items-center gap-2">
                   <div className="bg-slate-900/50 p-1 rounded-full border border-slate-700">
                        {isNight ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                   </div>

                   {incomePerCycle > 0 && (
                       <div className="flex flex-col items-end mr-1">
                          <div className={`w-9 h-9 relative flex items-center justify-center bg-slate-900 rounded-full border ${frenzyMode ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}>
                              <svg className="w-full h-full rotate-[-90deg] drop-shadow-md absolute" viewBox="0 0 36 36">
                                  <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <path className={frenzyMode ? "text-red-500" : "text-emerald-400"} strokeDasharray={`${incomeTimer}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                              </svg>
                              <div className={`text-[9px] font-black relative z-10 ${frenzyMode ? 'text-red-500' : 'text-emerald-400'}`}>
                                  {frenzyMode ? '2x' : `+${incomePerCycle}`}
                              </div>
                          </div>
                       </div>
                   )}

                   <div onClick={() => setShowShop(true)} className="flex flex-col items-end cursor-pointer active:scale-95 transition-transform gap-1">
                       <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                           <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                           <span className="text-white font-black text-sm">{player.energy}</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                           <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                           <span className="text-amber-100 font-black text-sm">{Math.floor(player.gold).toLocaleString()}</span>
                       </div>
                   </div>
                   
                   <button onClick={() => setShowSettings(true)} className="bg-slate-800 p-2 rounded-xl border border-slate-600 ml-1 hover:bg-slate-700 hover:text-white transition-colors">
                      <Clock className="w-5 h-5 text-slate-300" />
                   </button>
               </div>
          </div>
        </div>

        {/* --- Content --- */}
        <div className="scroll-content">
           <div className="px-3">
              {activeTab === 'merge' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <MergeGrid 
                          grid={grid} 
                          onMerge={handleMerge}
                          onSell={handleSell}
                          onItemAck={handleItemAck}
                          onCombo={handleCombo}
                      />
                  </div>
              )}
              {activeTab === 'kingdom' && (
                  <KingdomMap 
                      parcels={parcels} 
                      playerGold={player.gold}
                      inventoryGrid={grid.map(g => g.item)}
                      onRestore={handleRestoreParcel}
                  />
              )}
              {activeTab === 'adventure' && (
                  <AdventureMap 
                      energy={player.energy}
                      missions={missions}
                      onStartMission={handleStartMission}
                  />
              )}
           </div>
        </div>

        {/* --- Footer Navigation --- */}
        <div className="relative z-20 px-4 pb-6 pt-2">
           <div className="glass-panel h-20 flex items-center justify-around px-2 relative rounded-3xl">
              <button onClick={() => {playSound('pop'); setActiveTab('kingdom')}} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'kingdom' ? 'scale-110 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] -translate-y-2' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Map className="w-6 h-6" strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Reino</span>
              </button>

              <div className="relative -top-8">
                  <button onClick={() => {playSound('pop'); setActiveTab('merge')}} className={`
                        w-20 h-20 rounded-2xl rotate-45 border-[4px] border-[#0f172a] shadow-2xl flex items-center justify-center group transition-all active:scale-95 relative overflow-hidden ring-2 ring-indigo-500/50
                        ${frenzyMode ? 'bg-gradient-to-b from-red-500 to-orange-600 shadow-red-500/50 animate-pulse' : 'bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-indigo-500/50'}
                  `}>
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="-rotate-45 relative z-10">
                          {frenzyMode ? <Flame className="w-10 h-10 text-white drop-shadow-lg animate-bounce" /> : <GridIcon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={3} />}
                      </div>
                  </button>
              </div>

              <div className="flex gap-4">
                  <button onClick={() => {playSound('pop'); setActiveTab('adventure')}} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'adventure' ? 'scale-110 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.6)] -translate-y-2' : 'text-slate-500 hover:text-slate-300'}`}>
                      <Sword className="w-6 h-6" strokeWidth={2.5} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Batalha</span>
                  </button>

                  {/* HERO BUTTON */}
                  <button onClick={() => {playSound('pop'); setShowHeroes(true)}} className={`flex flex-col items-center gap-1 transition-all duration-300 text-slate-500 hover:text-slate-300`}>
                      <User className="w-6 h-6" strokeWidth={2.5} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Heróis</span>
                  </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;
