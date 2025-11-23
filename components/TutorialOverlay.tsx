
import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TutorialOverlayProps {
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      title: "Bem-vindo, Soberano!",
      text: "Seu reino está em ruínas. Cabe a você restaurá-lo à sua glória antiga. Vamos aprender o básico.",
      image: "👑"
    },
    {
      title: "Combine para Melhorar",
      text: "Arraste itens idênticos juntos para fundi-los em versões melhores. Itens melhores valem mais ouro!",
      image: "✨"
    },
    {
      title: "Restaure o Reino",
      text: "Use o Mapa do Reino para encontrar construções que precisam de recursos. Restaure-as para ganhar ouro passivo automaticamente!",
      image: "🏰"
    },
    {
      title: "Vá em Aventuras",
      text: "Ficou sem recursos? Jogue mini-games de Batalha na aba de aventura para ganhar matérias-primas.",
      image: "⚔️"
    }
  ];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 shadow-[0_0_60px_rgba(79,70,229,0.3)] relative">
        
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl drop-shadow-lg animate-bounce">
            {STEPS[step].image}
        </div>

        <div className="mt-8 text-center space-y-4">
            <h2 className="text-2xl font-black text-white">{STEPS[step].title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{STEPS[step].text}</p>
            
            <div className="flex justify-center gap-2 pt-4">
                {STEPS.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-indigo-500 scale-125' : 'bg-slate-700'}`}></div>
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="w-full mt-4 btn-3d bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border-b-indigo-900"
            >
                {step === STEPS.length - 1 ? "Começar a Jogar" : "Próximo"} <ArrowRight className="w-4 h-4" />
            </button>
        </div>

        <button onClick={onClose} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white">
             <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
