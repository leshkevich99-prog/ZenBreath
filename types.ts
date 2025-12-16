export enum BreathingPhase {
  IDLE = 'IDLE',
  INHALE = 'INHALE',
  HOLD_IN = 'HOLD_IN',
  EXHALE = 'EXHALE',
  HOLD_OUT = 'HOLD_OUT',
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  price?: number; // In Telegram Stars
  phases: {
    inhale: number; // seconds
    holdIn: number;
    exhale: number;
    holdOut: number;
  };
}

export interface UserState {
  unlockedPatternIds: string[];
  starsBalance: number;
}

export interface AIAdvice {
  text: string;
  mood: string;
}