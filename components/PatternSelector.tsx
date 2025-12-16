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
    <div className="w-full px-4 overflow-x-auto pb-4">
      <div className="flex gap-4">
        {patterns.map((p) => {
          const isLocked = p.isPremium && !unlockedPatternIds.includes(p.id);
          const isSelected = selectedId === p.id;

          return (
            <div 
              key={p.id}
              onClick={() => isLocked ? onUnlock(p) : onSelect(p)}
              className={`
                relative flex-shrink-0 w-40 p-4 rounded-2xl border transition-all cursor-pointer
                ${isSelected 
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {p.name}
                </h3>
                {isLocked && (
                  <Lock size={14} className="text-amber-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 leading-tight mb-3 min-h-[2.5em]">
                {p.description}
              </p>
              
              {isLocked ? (
                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md w-fit">
                  <Star size={10} fill="currentColor" /> {p.price}
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500 font-mono">
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