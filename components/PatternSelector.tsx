import React from 'react';
import { BreathingPattern } from '../types';
import { Lock, Star } from 'lucide-react';

interface PatternSelectorProps {
  patterns: BreathingPattern[];
  selectedId: string;
  unlockedPatternIds: string[];
  onSelect: (pattern: BreathingPattern) => void;
  onUnlock: (pattern: BreathingPattern) => void;
}

const PatternSelector: React.FC<PatternSelectorProps> = ({ 
  patterns, 
  selectedId, 
  unlockedPatternIds, 
  onSelect,
  onUnlock 
}) => {
  return (
    <div className="w-full px-4 overflow-x-auto no-scrollbar pb-2">
      <div className="flex gap-3">
        {patterns.map((p) => {
          const isLocked = p.isPremium && !unlockedPatternIds.includes(p.id);
          const isSelected = selectedId === p.id;

          return (
            <div 
              key={p.id}
              onClick={() => isLocked ? onUnlock(p) : onSelect(p)}
              className={`
                relative flex-shrink-0 w-36 p-3 rounded-xl border transition-all cursor-pointer
                ${isSelected 
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {p.name}
                </h3>
                {isLocked && (
                  <Lock size={12} className="text-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mb-2 min-h-[2.5em] line-clamp-2">
                {p.description}
              </p>
              
              {isLocked ? (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md w-fit">
                  <Star size={8} fill="currentColor" /> {p.price}
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-slate-500 font-mono">
                  {p.phases.inhale}-{p.phases.holdIn}-{p.phases.exhale}-{p.phases.holdOut}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatternSelector;