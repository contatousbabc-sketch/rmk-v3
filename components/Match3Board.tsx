
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { playSound } from '../utils/audio';
import { Hero } from '../types';
import { triggerVisualEffect } from '../utils/events';

interface Match3BoardProps {
  moves: number;
  targetScore: number;
  difficulty: string;
  hero: Hero | undefined;
  onComplete: (success: boolean, score: number) => void;
  onExit: () => void;
}

const ROWS = 7;
const COLS = 6; 

// --- GEM VISUAL COMPONENTS (SVG) ---
const GemVisual = ({ type }: { type: number }) => {
    // More "juicy" SVGs with better gradients and highlights
    switch(type) {
        case 0: // RED (Ruby - Square)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg filter brightness-110">
                    <defs>
                        <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#991b1b" />
                        </linearGradient>
                        <linearGradient id="redShine" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <rect x="10" y="10" width="80" height="80" rx="15" fill="url(#redGrad)" stroke="#7f1d1d" strokeWidth="3" />
                    <path d="M20 20 L50 50 L20 80" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
                    <rect x="20" y="20" width="30" height="30" rx="5" fill="url(#redShine)" opacity="0.6" />
                    <circle cx="70" cy="70" r="5" fill="white" opacity="0.4" />
                </svg>
            );
        case 1: // BLUE (Sapphire - Diamond)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg filter brightness-110">
                    <defs>
                        <linearGradient id="blueGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1e3a8a" />
                        </linearGradient>
                    </defs>
                    <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="url(#blueGrad)" stroke="#172554" strokeWidth="3" />
                    <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M50 5 L50 35 L20 50" fill="rgba(255,255,255,0.4)" />
                    <circle cx="50" cy="35" r="4" fill="white" opacity="0.9" />
                </svg>
            );
        case 2: // GREEN (Emerald - Hexagon)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg filter brightness-110">
                    <defs>
                        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#14532d" />
                        </linearGradient>
                    </defs>
                    <path d="M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z" fill="url(#greenGrad)" stroke="#064e3b" strokeWidth="3" />
                    <path d="M30 20 L70 20 L85 50 L70 80 L30 80 L15 50 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    <path d="M25 10 L35 30 L15 50" fill="rgba(255,255,255,0.3)" />
                    <circle cx="35" cy="30" r="3" fill="white" opacity="0.8" />
                </svg>
            );
        case 3: // YELLOW (Topaz - Triangle)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg filter brightness-110">
                     <defs>
                        <linearGradient id="yellowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                    </defs>
                    <path d="M50 10 L90 85 L10 85 Z" fill="url(#yellowGrad)" stroke="#78350f" strokeWidth="3" />
                    <path d="M50 25 L75 75 L25 75 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <circle cx="50" cy="40" r="8" fill="white" opacity="0.4" filter="blur(2px)" />
                </svg>
            );
        case 4: // PURPLE (Amethyst - Round)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg filter brightness-110">
                    <defs>
                        <radialGradient id="purpleGrad" cx="35%" cy="35%" r="60%">
                            <stop offset="0%" stopColor="#d8b4fe" />
                            <stop offset="100%" stopColor="#581c87" />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="url(#purpleGrad)" stroke="#3b0764" strokeWidth="3" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle cx="35" cy="35" r="8" fill="white" opacity="0.7" />
                    <circle cx="65" cy="65" r="4" fill="white" opacity="0.2" />
                </svg>
            );
        default:
            return null;
    }
};

const GEM_COUNT = 5;

export const Match3Board: React.FC<Match3BoardProps> = ({ moves: initialMoves, targetScore, difficulty, hero, onComplete, onExit }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const boardRef = useRef<number[][]>([]); // Ref to hold the latest board state for async access
  const [selected, setSelected] = useState<{r: number, c: number} | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(initialMoves);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchedCells, setMatchedCells] = useState<string[]>([]);
  const [startScreen, setStartScreen] = useState(true);
  
  // Hero Ability State
  const [heroCharge, setHeroCharge] = useState(0);

  // Update ref whenever board changes
  useEffect(() => {
      boardRef.current = board;
  }, [board]);

  useEffect(() => {
    const newBoard = [];
    for(let r=0; r<ROWS; r++) {
        const row = [];
        for(let c=0; c<COLS; c++) row.push(Math.floor(Math.random() * GEM_COUNT));
        newBoard.push(row);
    }
    setBoard(newBoard);
  }, []);

  const handleInteraction = async (r: number, c: number) => {
    if (isProcessing || movesLeft <= 0) return;
    playSound('pop');

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    if (selected.r === r && selected.c === c) {
        setSelected(null);
        return;
    }

    const isAdj = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;
    
    if (isAdj) {
        setIsProcessing(true);
        // Store previous state for revert
        const prevBoard = JSON.parse(JSON.stringify(board));

        const temp = JSON.parse(JSON.stringify(board));
        const val = temp[selected.r][selected.c];
        temp[selected.r][selected.c] = temp[r][c];
        temp[r][c] = val;
        
        setBoard(temp);
        setSelected(null);

        await new Promise(r => setTimeout(r, 300));
        
        await processBoard(temp, true, prevBoard);
    } else {
        setSelected({r, c});
    }
  };

  const processBoard = async (currentBoard: number[][], decrementMove: boolean, prevBoardToRevert?: number[][]) => {
        const matches = new Set<string>();
        // Hrz
        for(let i=0; i<ROWS; i++) {
            for(let j=0; j<COLS-2; j++) {
                if(currentBoard[i][j] !== -1 && currentBoard[i][j] === currentBoard[i][j+1] && currentBoard[i][j] === currentBoard[i][j+2]) {
                    matches.add(`${i},${j}`); matches.add(`${i},${j+1}`); matches.add(`${i},${j+2}`);
                }
            }
        }
        // Vert
        for(let j=0; j<COLS; j++) {
            for(let i=0; i<ROWS-2; i++) {
                if(currentBoard[i][j] !== -1 && currentBoard[i][j] === currentBoard[i+1][j] && currentBoard[i][j] === currentBoard[i+2][j]) {
                    matches.add(`${i},${j}`); matches.add(`${i+1},${j}`); matches.add(`${i+2},${j}`);
                }
            }
        }

        if (matches.size > 0) {
            if (decrementMove) setMovesLeft(m => m - 1);
            playSound('merge');
            setMatchedCells(Array.from(matches));

            // Charge Hero
            if (hero) {
                setHeroCharge(prev => Math.min(hero.chargeRequired, prev + matches.size));
            }

            await new Promise(r => setTimeout(r, 400));
            
            matches.forEach(key => {
                const [rr, cc] = key.split(',').map(Number);
                currentBoard[rr][cc] = -1;
            });
            
            setScore(s => s + (matches.size * 100));
            setMatchedCells([]);

            // Drop
            for(let j=0; j<COLS; j++) {
                let empty = 0;
                for(let i=ROWS-1; i>=0; i--) {
                    if(currentBoard[i][j] === -1) empty++;
                    else if(empty > 0) {
                        currentBoard[i+empty][j] = currentBoard[i][j];
                        currentBoard[i][j] = -1;
                    }
                }
                for(let i=0; i<empty; i++) currentBoard[i][j] = Math.floor(Math.random() * GEM_COUNT);
            }
            setBoard([...currentBoard]);

            // Chain reactions logic could be added here

            setIsProcessing(false);
        } else {
            if (decrementMove && prevBoardToRevert) {
                 // Invalid move, swap back
                 playSound('error');
                 setBoard(prevBoardToRevert);
                 // We don't process further if it was a revert
            }
            setIsProcessing(false);
        }
  };

  const activateHeroAbility = () => {
      if (!hero || heroCharge < hero.chargeRequired || isProcessing) return;

      setIsProcessing(true);
      playSound('magic');
      triggerVisualEffect('HERO_SUMMON', { x: window.innerWidth/2, y: window.innerHeight/2 });

      setHeroCharge(0); // Reset charge

      setTimeout(async () => {
          // Use Ref to get the LATEST board state, preventing race conditions or stale closures
          const temp = JSON.parse(JSON.stringify(boardRef.current));

          if (hero.element === 'fire') {
              // Destroy random 3x3
              const r = Math.floor(Math.random() * (ROWS - 2)) + 1;
              const c = Math.floor(Math.random() * (COLS - 2)) + 1;

              for(let i = r-1; i <= r+1; i++) {
                  for(let j = c-1; j <= c+1; j++) {
                      if (temp[i] && temp[i][j] !== undefined) temp[i][j] = -1;
                  }
              }
              setScore(s => s + 500);
          } else if (hero.element === 'water') {
               // Remove all red gems (0)
               for(let i=0; i<ROWS; i++) {
                   for(let j=0; j<COLS; j++) {
                       if (temp[i][j] === 0) {
                           temp[i][j] = -1;
                           setScore(s => s + 50);
                       }
                   }
               }
          } else if (hero.element === 'earth') {
              // Shuffle
               for(let i=0; i<ROWS; i++) {
                   for(let j=0; j<COLS; j++) {
                        const r2 = Math.floor(Math.random() * ROWS);
                        const c2 = Math.floor(Math.random() * COLS);
                        const t = temp[i][j];
                        temp[i][j] = temp[r2][c2];
                        temp[r2][c2] = t;
                   }
               }
          }

          setBoard(temp);
          await new Promise(r => setTimeout(r, 500));

          // Drop mechanics for ability
          for(let j=0; j<COLS; j++) {
                let empty = 0;
                for(let i=ROWS-1; i>=0; i--) {
                    if(temp[i][j] === -1) empty++;
                    else if(empty > 0) {
                        temp[i+empty][j] = temp[i][j];
                        temp[i][j] = -1;
                    }
                }
                for(let i=0; i<empty; i++) temp[i][j] = Math.floor(Math.random() * GEM_COUNT);
          }
          setBoard(temp);
          setIsProcessing(false);

      }, 1000);
  };

  useEffect(() => {
      if (!startScreen && (movesLeft <= 0 || score >= targetScore)) {
          setTimeout(() => {
              onComplete(score >= targetScore, score);
          }, 1000);
      }
  }, [movesLeft, score, startScreen]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center touch-none">
        
        {/* Updated Background for Match 3 */}
        <div className="w-full h-full max-w-md flex flex-col relative bg-[#2e1065] overflow-hidden">
            {/* Ambient Light */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none"></div>
            
            <div className="h-28 bg-purple-900/90 border-b-4 border-amber-600 flex items-center justify-between px-4 shadow-2xl z-20 pt-2 pb-2 relative backdrop-blur-md">
                <div className="flex flex-col gap-1">
                    <span className="text-amber-400 font-bold text-[10px] uppercase tracking-widest mb-1">Pontuação</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white font-[Cinzel] drop-shadow-lg">{score}</span>
                    </div>
                    <div className="w-32 h-2 bg-purple-950 rounded-full border border-purple-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300" style={{width: `${Math.min(100, (score/targetScore)*100)}%`}}></div>
                    </div>
                </div>
                
                {/* HERO ABILITY BUTTON */}
                {hero && (
                    <div className="flex flex-col items-center">
                         <button
                            disabled={heroCharge < hero.chargeRequired || isProcessing}
                            onClick={activateHeroAbility}
                            className={`
                                w-14 h-14 rounded-full border-4 flex items-center justify-center relative transition-all duration-300
                                ${heroCharge >= hero.chargeRequired
                                    ? 'border-amber-400 bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse scale-110'
                                    : 'border-slate-600 bg-slate-800 opacity-80'
                                }
                            `}
                         >
                            <div className="absolute inset-0 rounded-full overflow-hidden" style={{ clipPath: `inset(${100 - (heroCharge/hero.chargeRequired)*100}% 0 0 0)` }}>
                                <div className="w-full h-full bg-amber-500/50"></div>
                            </div>
                            <span className="text-2xl relative z-10">{hero.icon}</span>
                         </button>
                         <span className="text-[9px] font-black text-amber-300 mt-1 uppercase tracking-tighter">
                             {heroCharge >= hero.chargeRequired ? 'PRONTO!' : `${heroCharge}/${hero.chargeRequired}`}
                         </span>
                    </div>
                )}

                <div className="flex flex-col items-center bg-purple-900/80 p-2 rounded-xl border border-purple-700 w-16 shadow-inner">
                    <span className="text-blue-300 font-bold text-[10px] uppercase tracking-widest">Moves</span>
                    <span className={`text-2xl font-black ${movesLeft < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{movesLeft}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                
                {startScreen ? (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                         <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                         <h2 className="text-4xl text-white font-[Cinzel] mb-2 text-center font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-orange-500">BATALHA</h2>
                         <div className="bg-purple-900/50 p-6 rounded-2xl border border-purple-500/30 text-center max-w-[80%] mb-8 shadow-2xl">
                            <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest font-bold">Objetivo</p>
                            <p className="text-white text-2xl font-black mb-4">{targetScore} Pontos</p>
                            {hero && (
                                <div className="border-t border-purple-500/30 pt-4 mt-2">
                                    <p className="text-slate-400 text-xs mb-1">Herói Selecionado</p>
                                    <div className="flex items-center justify-center gap-2 text-amber-300 font-bold">
                                        <span>{hero.icon}</span>
                                        <span>{hero.name}</span>
                                    </div>
                                </div>
                            )}
                         </div>
                         <button onClick={() => setStartScreen(false)} className="btn-game red px-10 py-4 text-xl font-bold shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
                            LUTAR
                         </button>
                    </div>
                ) : (
                    <div 
                        className="grid gap-1.5 p-3 bg-purple-950/40 rounded-2xl border-2 border-purple-500/20 backdrop-blur-sm mt-2 shadow-xl"
                        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: '100%', maxWidth: '400px', aspectRatio: `${COLS}/${ROWS}` }}
                    >
                        {board.map((row, r) => row.map((type, c) => (
                            <div 
                                key={`${r}-${c}`}
                                onClick={() => handleInteraction(r, c)}
                                className={`
                                    relative rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200
                                    ${selected?.r === r && selected?.c === c ? 'scale-90 brightness-125 ring-2 ring-amber-400 z-10 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'hover:scale-105'}
                                    ${matchedCells.includes(`${r},${c}`) ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100'}
                                `}
                            >
                                <div className="w-full h-full p-0.5">
                                    <GemVisual type={type} />
                                </div>
                            </div>
                        )))}
                    </div>
                )}
            </div>

            <button onClick={onExit} className="absolute top-2 right-2 z-50 bg-red-900/50 p-2 rounded-full border border-red-500/50 text-red-300 hover:bg-red-900 active:scale-95">
                <X size={16} />
            </button>

        </div>
    </div>
  );
};
