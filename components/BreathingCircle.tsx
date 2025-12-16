import React, { useState, useEffect, useRef } from 'react';
import { BreathingPhase, BreathingPattern } from '../types';
import { hapticImpact } from '../services/telegramService';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface BreathingCircleProps {
  pattern: BreathingPattern;
  onSessionComplete?: () => void;
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({ pattern }) => {
  const [phase, setPhase] = useState<BreathingPhase>(BreathingPhase.IDLE);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [instruction, setInstruction] = useState("Press Start");
  
  // Use refs for timer logic to avoid stale closures in intervals
  const patternRef = useRef(pattern);
  const phaseRef = useRef(BreathingPhase.IDLE);

  // Update ref when prop changes
  useEffect(() => {
    patternRef.current = pattern;
    if (isActive) {
        stopSession(); // Reset if pattern changes mid-session
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern]);

  const getPhaseDuration = (p: BreathingPhase): number => {
    switch (p) {
      case BreathingPhase.INHALE: return patternRef.current.phases.inhale;
      case BreathingPhase.HOLD_IN: return patternRef.current.phases.holdIn;
      case BreathingPhase.EXHALE: return patternRef.current.phases.exhale;
      case BreathingPhase.HOLD_OUT: return patternRef.current.phases.holdOut;
      default: return 0;
    }
  };

  const getInstruction = (p: BreathingPhase): string => {
    switch (p) {
      case BreathingPhase.INHALE: return "Inhale";
      case BreathingPhase.HOLD_IN: return "Hold";
      case BreathingPhase.EXHALE: return "Exhale";
      case BreathingPhase.HOLD_OUT: return "Hold";
      default: return "Ready?";
    }
  };

  const nextPhase = (current: BreathingPhase): BreathingPhase => {
    switch (current) {
      case BreathingPhase.IDLE: return BreathingPhase.INHALE;
      case BreathingPhase.INHALE: 
        return patternRef.current.phases.holdIn > 0 ? BreathingPhase.HOLD_IN : BreathingPhase.EXHALE;
      case BreathingPhase.HOLD_IN: return BreathingPhase.EXHALE;
      case BreathingPhase.EXHALE: 
        return patternRef.current.phases.holdOut > 0 ? BreathingPhase.HOLD_OUT : BreathingPhase.INHALE;
      case BreathingPhase.HOLD_OUT: return BreathingPhase.INHALE;
      default: return BreathingPhase.IDLE;
    }
  };

  const startSession = () => {
    setIsActive(true);
    const initialPhase = BreathingPhase.INHALE;
    setPhase(initialPhase);
    phaseRef.current = initialPhase;
    setInstruction(getInstruction(initialPhase));
    setTimeLeft(getPhaseDuration(initialPhase));
    hapticImpact('medium');
  };

  const stopSession = () => {
    setIsActive(false);
    setPhase(BreathingPhase.IDLE);
    phaseRef.current = BreathingPhase.IDLE;
    setInstruction("Press Start");
    setTimeLeft(0);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Phase transition
            const next = nextPhase(phaseRef.current);
            setPhase(next);
            phaseRef.current = next;
            setInstruction(getInstruction(next));
            hapticImpact('light');
            return getPhaseDuration(next);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  // Determine scale and color based on phase for animation
  const getCircleStyle = () => {
    let scale = 'scale-100';
    let opacity = 'opacity-80';
    
    if (phase === BreathingPhase.INHALE) scale = 'scale-150';
    if (phase === BreathingPhase.HOLD_IN) scale = 'scale-150'; // Stay expanded
    if (phase === BreathingPhase.EXHALE) scale = 'scale-100';
    if (phase === BreathingPhase.HOLD_OUT) scale = 'scale-100'; // Stay contracted

    // Dynamic duration based on current phase time
    const duration = phase === BreathingPhase.IDLE ? 500 : getPhaseDuration(phase) * 1000;
    
    return {
      transform: phase === BreathingPhase.INHALE || phase === BreathingPhase.HOLD_IN ? 'scale(1.5)' : 'scale(1)',
      transition: `transform ${duration}ms linear`,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Animated Background Circle */}
        <div 
          className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 blur-xl opacity-40 animate-pulse"
        ></div>

        {/* Main Breathing Circle */}
        <div 
          className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center z-10"
          style={getCircleStyle()}
        >
          {/* Inner Text (Doesn't scale with parent to remain readable, so we counter-scale or just put it on top) */}
        </div>

        {/* Text Overlay - Centered Absolute */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <span className="text-2xl font-bold text-white drop-shadow-md tracking-widest uppercase">
            {instruction}
          </span>
          {isActive && (
            <span className="text-sm text-cyan-100 mt-1 font-mono">
              {timeLeft}s
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex gap-6">
        {!isActive ? (
          <button 
            onClick={startSession}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white px-8 py-3 rounded-full backdrop-blur-md border border-white/10 font-medium"
          >
            <Play size={20} fill="currentColor" /> Start
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 active:scale-95 transition-all text-red-100 px-8 py-3 rounded-full backdrop-blur-md border border-red-500/30 font-medium"
          >
            <Pause size={20} fill="currentColor" /> Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default BreathingCircle;