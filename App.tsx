import React, { useState, useEffect } from 'react';
import { BreathingPattern, UserState, AIAdvice } from './types';
import { initTelegram, buyStars, tg } from './services/telegramService';
import { generateDailyWisdom } from './services/geminiService';
import BreathingCircle from './components/BreathingCircle';
import PatternSelector from './components/PatternSelector';
import SubscriptionModal from './components/SubscriptionModal';
import { Sparkles, Activity } from 'lucide-react';

// Define available patterns
const PATTERNS: BreathingPattern[] = [
  // FREE PATTERNS
  {
    id: 'basic',
    name: 'Basic',
    description: 'Even breathing (4-4) to restore balance.',
    isPremium: false,
    phases: { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 }
  },
  {
    id: 'coherence',
    name: 'Heart Rhythm',
    description: 'Coherent breathing (5-5) to sync heart and mind.',
    isPremium: false,
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
  },
  {
    id: 'triangle',
    name: 'Triangle',
    description: 'Soft focus (4-4-4) before starting work.',
    isPremium: false,
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 }
  },
  {
    id: 'calm',
    name: 'Calm',
    description: 'Extended exhale (4-6) for soft, safe relaxation.',
    isPremium: false,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  },
  
  // PAID PATTERNS
  {
    id: 'energy',
    name: 'Energy',
    description: 'Fast rhythm (4-2) for instant alertness. Like espresso.',
    isPremium: true,
    price: 30,
    phases: { inhale: 4, holdIn: 0, exhale: 2, holdOut: 0 }
  },
  {
    id: 'antistress',
    name: 'Anti-Stress',
    description: 'Long exhale instantly lowers cortisol levels.',
    isPremium: true,
    price: 25,
    phases: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 }
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Classic "Navy SEAL" technique for total control.',
    isPremium: true,
    price: 50,
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
  },
  {
    id: 'box_pro',
    name: 'Box Pro',
    description: 'Advanced version (6-6-6-6) for lung capacity training.',
    isPremium: true,
    price: 75,
    phases: { inhale: 6, holdIn: 6, exhale: 6, holdOut: 6 }
  },
  {
    id: 'relax',
    name: '4-7-8 Sleep',
    description: 'Dr. Weil\'s powerful technique for falling asleep fast.',
    isPremium: true,
    price: 75,
    phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
  },
  {
    id: 'deep_focus',
    name: 'Zen Master',
    description: 'Advanced retention for deep meditation.',
    isPremium: true,
    price: 100,
    phases: { inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 }
  },
  {
    id: 'pranayama',
    name: 'Yogic Breath',
    description: 'Ancient 1:4:2 ratio (4-16-8) for mind mastery.',
    isPremium: true,
    price: 150,
    phases: { inhale: 4, holdIn: 16, exhale: 8, holdOut: 0 }
  }
];

const App: React.FC = () => {
  const [currentPattern, setCurrentPattern] = useState<BreathingPattern>(PATTERNS[0]);
  
  // Initialize with all free patterns unlocked
  const [userState, setUserState] = useState<UserState>({ 
    unlockedPatternIds: ['basic', 'coherence', 'triangle', 'calm'], 
    starsBalance: 0 
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnlockPattern, setSelectedUnlockPattern] = useState<BreathingPattern | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);

  useEffect(() => {
    initTelegram();
    // Set theme color
    if (tg) {
        tg.setHeaderColor('#0f172a');
        tg.setBackgroundColor('#0f172a');
    }

    // Load AI advice on mount
    const fetchAdvice = async () => {
        try {
            const advice = await generateDailyWisdom();
            setAiAdvice(advice);
        } catch (e) {
            console.error("Failed to load advice");
        }
    };
    fetchAdvice();

  }, []);

  const handlePatternSelect = (pattern: BreathingPattern) => {
    setCurrentPattern(pattern);
  };

  const handleUnlockRequest = (pattern: BreathingPattern) => {
    if (userState.unlockedPatternIds.includes(pattern.id)) {
      setCurrentPattern(pattern);
      return;
    }
    setSelectedUnlockPattern(pattern);
    setModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedUnlockPattern) return;
    
    setIsPurchasing(true);
    
    // We pass 3 parameters: Price, Name, Description
    const success = await buyStars(
        selectedUnlockPattern.price || 50,
        selectedUnlockPattern.name,
        selectedUnlockPattern.description
    );
    
    if (success) {
      setUserState(prev => ({
        ...prev,
        // Add the new pattern ID to the list of unlocked items
        unlockedPatternIds: [...prev.unlockedPatternIds, selectedUnlockPattern.id]
      }));
      setCurrentPattern(selectedUnlockPattern);
      setModalOpen(false);
    }
    setIsPurchasing(false);
  };

  return (
    // Changed min-h-screen to h-screen and added overflow-hidden to fit perfectly
    <div className="h-screen w-full overflow-hidden bg-[#0f172a] text-white flex flex-col font-sans animate-gradient bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      
      {/* Header - Compact padding */}
      <header className="shrink-0 px-4 py-3 flex justify-between items-center z-10">
        <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            ZenBreath
            </h1>
        </div>
        {aiAdvice && (
            <div className="bg-white/5 border border-white/10 rounded-full px-2 py-1 text-[10px] text-cyan-200 flex items-center gap-1">
                <Sparkles size={10} /> {aiAdvice.mood}
            </div>
        )}
      </header>

      {/* Main Content - Flex-1 to take available space, center content */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden w-full">
        
        {/* AI Quote - Reduced margins */}
        {aiAdvice && (
            <div className="px-6 text-center mb-2 absolute top-4 w-full">
                <p className="text-slate-300 italic text-xs opacity-70">"{aiAdvice.text}"</p>
            </div>
        )}

        {/* Breathing Circle - Centered */}
        <BreathingCircle pattern={currentPattern} />

      </main>

      {/* Footer / Controls - Compact padding */}
      <footer className="shrink-0 w-full bg-[#0f172a]/80 backdrop-blur-lg border-t border-white/5 pb-6 pt-2 rounded-t-2xl z-20">
        <div className="px-4 mb-2 flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Select technique</span>
        </div>
        
        <PatternSelector 
          patterns={PATTERNS}
          selectedId={currentPattern.id}
          unlockedPatternIds={userState.unlockedPatternIds}
          onSelect={handlePatternSelect}
          onUnlock={handleUnlockRequest}
        />
      </footer>

      {/* Modals */}
      <SubscriptionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pattern={selectedUnlockPattern}
        onPurchase={handlePurchase}
        isLoading={isPurchasing}
      />
    </div>
  );
};

export default App;