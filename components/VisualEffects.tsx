
import React, { useEffect, useRef } from 'react';
import { VisualEffectType } from '../utils/events';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'sparkle' | 'coin' | 'confetti' | 'text' | 'trail' | 'shockwave';
  text?: string;
  gravity: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
}

export const VisualEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- Particle Factory ---
    const createParticle = (type: Particle['type'], x: number, y: number, options: any = {}): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = options.speed || Math.random() * 5 + 2;
      
      let color = options.color || '#fff';
      let size = options.size || Math.random() * 4 + 2;
      let gravity = 0.2;
      let life = 60 + Math.random() * 40;
      let alpha = 1;
      
      if (type === 'coin') {
          color = '#FFD700';
          size = 12;
          gravity = 0.8;
          life = 100;
      } else if (type === 'sparkle') {
          life = 20 + Math.random() * 20;
          gravity = 0.05;
          size = Math.random() * 3 + 1;
      } else if (type === 'text') {
          life = 60;
          gravity = -0.5;
          size = 30;
      } else if (type === 'trail') {
          life = 15;
          gravity = 0;
          size = Math.random() * 4 + 2;
          color = options.color || 'rgba(255, 215, 0, 0.5)';
      } else if (type === 'shockwave') {
          life = 20;
          gravity = 0;
          size = 10; // Initial radius
          color = options.color || '#fff';
      }

      return {
        id: particleIdCounter.current++,
        x, y,
        vx: type === 'shockwave' ? 0 : Math.cos(angle) * speed * (type === 'text' ? 0.2 : 1),
        vy: type === 'shockwave' ? 0 : Math.sin(angle) * speed * (type === 'text' ? 0.2 : 1) - (type === 'coin' ? 8 : 0),
        life,
        maxLife: life,
        size,
        color,
        type,
        text: options.text,
        gravity,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha
      };
    };

    const handleEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        const { type, x = window.innerWidth / 2, y = window.innerHeight / 2, text, color } = customEvent.detail;

        if (type === 'MERGE_EXPLOSION') {
            // Shockwave
            particlesRef.current.push(createParticle('shockwave', x, y, { color: color || '#FFD700' }));
            
            // Sparkles
            for (let i = 0; i < 20; i++) {
                particlesRef.current.push(createParticle('sparkle', x, y, { 
                    color: color || '#fff',
                    speed: Math.random() * 8 + 2
                }));
            }
        } else if (type === 'SHOCKWAVE') {
             particlesRef.current.push(createParticle('shockwave', x, y, { color: color || '#fff' }));
        } else if (type === 'DRAG_TRAIL') {
             // Emit fewer particles for trails to save perf
             if (Math.random() > 0.5) {
                 particlesRef.current.push(createParticle('trail', x, y, { 
                     color: color,
                     speed: 0.5 
                 }));
             }
        } else if (type === 'GOLD_RAIN') {
             for (let i = 0; i < 15; i++) {
                 setTimeout(() => {
                    particlesRef.current.push(createParticle('coin', Math.random() * canvas.width, -20, {
                        speed: Math.random() * 3
                    }));
                 }, i * 50);
             }
        } else if (type === 'CONFETTI') {
             const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];
             for (let i = 0; i < 60; i++) {
                 particlesRef.current.push(createParticle('confetti', canvas.width/2, canvas.height/2, {
                     color: colors[Math.floor(Math.random() * colors.length)],
                     speed: 15 + Math.random() * 10
                 }));
             }
        } else if (type === 'TEXT_POPUP') {
            particlesRef.current.push(createParticle('text', x, y, {
                text: text,
                color: color || '#fbbf24'
            }));
        }
    };

    window.addEventListener('rmk-visual-effect', handleEvent);

    // --- Render Loop ---
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Optimized loop reverse
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life--;

        if (p.type === 'shockwave') {
            // Shockwave expands rapidly
            p.size += 15; // Expansion speed
            p.alpha = p.life / p.maxLife;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.lineWidth = 10 * p.alpha;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.stroke();
            ctx.globalAlpha = 1;

        } else {
            // Physics
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotSpeed;

            // Floor bounce for coins
            if (p.type === 'coin' && p.y > canvas.height + 50) {
                 p.life = 0; // Kill off screen
            }

            if (p.life <= 0) {
                particlesRef.current.splice(i, 1);
                continue;
            }

            const alpha = Math.min(1, p.life / (p.maxLife * 0.5));
            ctx.globalAlpha = alpha;

            if (p.type === 'text' && p.text) {
                ctx.save();
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.font = `900 ${p.size}px 'Nunito', sans-serif`;
                ctx.textAlign = 'center';
                
                // Stroke
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.strokeText(p.text, p.x, p.y);
                
                // Fill
                ctx.fillStyle = p.color;
                ctx.fillText(p.text, p.x, p.y);
                ctx.restore();
            } 
            else if (p.type === 'trail') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
            else if (p.type === 'coin') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                // Gold coin
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#78350f';
                ctx.stroke();
                // Inner Shine
                ctx.beginPath();
                ctx.arc(-p.size*0.3, -p.size*0.3, p.size*0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.restore();
            } 
            else if (p.type === 'sparkle') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.fillStyle = p.color;
                // Draw diamond shape
                ctx.beginPath();
                ctx.moveTo(0, -p.size * 2);
                ctx.lineTo(p.size, 0);
                ctx.lineTo(0, p.size * 2);
                ctx.lineTo(-p.size, 0);
                ctx.fill();
                ctx.restore();
            }
            else {
                // Confetti
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 1);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('rmk-visual-effect', handleEvent);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};
