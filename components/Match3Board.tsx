
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
    switch(type) {
        case 0: // RED (Ruby - Square)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md filter brightness-110">
                    <defs>
                        <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff5252" />
                            <stop offset="100%" stopColor="#b71c1c" />
                        </linearGradient>
                    </defs>
                    <path d="M20 20 L80 20 L80 80 L20 80 Z" fill="url(#redGrad)" stroke="#7f0000" strokeWidth="2" />
                    <rect x="35" y="35" width="30" height="30" fill="#ff8a80" opacity="0.5" />
                    <path d="M20 20 L35 35 M80 20 L65 35 M80 80 L65 65 M20 80 L35 65" stroke="#7f0000" strokeWidth="1" />
                    <circle cx="40" cy="40" r="5" fill="white" opacity="0.6" />
                </svg>
            );
        case 1: // BLUE (Sapphire - Diamond)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md filter brightness-110">
                    <defs>
                        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#448aff" />
                            <stop offset="100%" stopColor="#0d47a1" />
                        </linearGradient>
                    </defs>
                    <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="url(#blueGrad)" stroke="#01579b" strokeWidth="2" />
                    <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="#82b1ff" opacity="0.4" />
                    <path d="M50 5 L50 95 M5 50 L95 50" stroke="#01579b" strokeWidth="1" opacity="0.5"/>
                    <circle cx="40" cy="35" r="4" fill="white" opacity="0.7" />
                </svg>
            );
        case 2: // GREEN (Emerald - Hexagon)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md filter brightness-110">
                    <defs>
                        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#69f0ae" />
                            <stop offset="100%" stopColor="#1b5e20" />
                        </linearGradient>
                    </defs>
                    <path d="M30 5 L70 5 L95 50 L70 95 L30 95 L5 50 Z" fill="url(#greenGrad)" stroke="#1b5e20" strokeWidth="2" />
                    <path d="M35 25 L65 25 L80 50 L65 75 L35 75 L20 50 Z" fill="#b9f6ca" opacity="0.3" />
                    <path d="M30 5 L35 25 M70 5 L65 25 M95 50 L80 50 M70 95 L65 75 M30 95 L35 75 M5 50 L20 50" stroke="#004d40" strokeWidth="1" />
                    <circle cx="35" cy="30" r="4" fill="white" opacity="0.6" />
                </svg>
            );
        case 3: // YELLOW (Topaz - Triangle Inverted)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md filter brightness-110">
                     <defs>
                        <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffff00" />
                            <stop offset="100%" stopColor="#f57f17" />
                        </linearGradient>
                    </defs>
                    <path d="M10 10 L90 10 L50 90 Z" fill="url(#yellowGrad)" stroke="#e65100" strokeWidth="2" />
                    <path d="M30 25 L70 25 L50 65 Z" fill="#fff9c4" opacity="0.5" />
                    <path d="M10 10 L30 25 M90 10 L70 25 M50 90 L50 65" stroke="#e65100" strokeWidth="1" />
                    <circle cx="40" cy="25" r="5" fill="white" opacity="0.8" />
                </svg>
            );
        case 4: // PURPLE (Amethyst - Round)
            return (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md filter brightness-110">
                    <defs>
                        <radialGradient id="purpleGrad" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#ea80fc" />
                            <stop offset="100%" stopColor="#4a148c" />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill="url(#purpleGrad)" stroke="#4a148c" strokeWidth="2" />
                    <circle cx="50" cy="50" r="25" fill="#f3e5f5" opacity="0.2" />
                    <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke="#7b1fa2" strokeWidth="1" opacity="0.4"/>
                    <circle cx="35" cy="35" r="6" fill="white" opacity="0.7" />
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

            // Chain reactions?
            // await new Promise(r => setTimeout(r, 300));
            // await processBoard(currentBoard, false);

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
        
        <div className="w-full h-full max-w-md flex flex-col relative bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            
            <div className="h-28 bg-slate-900/95 border-b-4 border-amber-600 flex items-center justify-between px-4 shadow-2xl z-20 pt-2 pb-2">
                <div className="flex flex-col gap-1">
                    <span className="text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-1">Pontuação</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white font-[Cinzel] drop-shadow-lg">{score}</span>
                    </div>
                    <div className="w-32 h-2 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
                        <div className="h-full bg-amber-500" style={{width: `${Math.min(100, (score/targetScore)*100)}%`}}></div>
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
                                    ? 'border-blue-400 bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse scale-110'
                                    : 'border-slate-600 bg-slate-800 opacity-80'
                                }
                            `}
                         >
                            <div className="absolute inset-0 rounded-full overflow-hidden" style={{ clipPath: `inset(${100 - (heroCharge/hero.chargeRequired)*100}% 0 0 0)` }}>
                                <div className="w-full h-full bg-blue-500/50"></div>
                            </div>
                            <span className="text-2xl relative z-10">{hero.icon}</span>
                         </button>
                         <span className="text-[9px] font-black text-blue-300 mt-1 uppercase tracking-tighter">
                             {heroCharge >= hero.chargeRequired ? 'PRONTO!' : `${heroCharge}/${hero.chargeRequired}`}
                         </span>
                    </div>
                )}

                <div className="flex flex-col items-center bg-slate-800 p-2 rounded-xl border border-slate-700 w-16">
                    <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest">Moves</span>
                    <span className={`text-2xl font-black ${movesLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{movesLeft}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-2 relative overflow-hidden">
                
                {startScreen ? (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                         <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                         <h2 className="text-4xl text-white font-[Cinzel] mb-2 text-center font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-orange-500">BATALHA</h2>
                         <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-600 text-center max-w-[80%] mb-8">
                            <p className="text-slate-300 text-sm mb-2 uppercase tracking-widest font-bold">Objetivo</p>
                            <p className="text-white text-2xl font-black mb-4">{targetScore} Pontos</p>
                            {hero && (
                                <div className="border-t border-slate-600 pt-4 mt-2">
                                    <p className="text-slate-400 text-xs mb-1">Herói Selecionado</p>
                                    <div className="flex items-center justify-center gap-2 text-blue-300 font-bold">
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
                        className="grid gap-1.5 p-3 bg-slate-900/40 rounded-2xl border-2 border-slate-700/50 backdrop-blur-sm mt-2"
                        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: '100%', maxWidth: '400px', aspectRatio: `${COLS}/${ROWS}` }}
                    >
                        {board.map((row, r) => row.map((type, c) => (
                            <div 
                                key={`${r}-${c}`}
                                onClick={() => handleInteraction(r, c)}
                                className={`
                                    relative rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200
                                    ${selected?.r === r && selected?.c === c ? 'scale-90 brightness-125 ring-2 ring-white z-10' : 'hover:scale-105'}
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

            <button onClick={onExit} className="absolute top-2 right-2 z-50 bg-red-900/50 p-2 rounded-full border border-red-500/50 text-red-300 hover:bg-red-900">
                <X size={16} />
            </button>

        </div>
    </div>
  );
};
