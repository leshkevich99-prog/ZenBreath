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
    name: 'Базовое',
    description: 'Равномерное дыхание (4-4) для восстановления баланса.',
    isPremium: false,
    phases: { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 }
  },
  {
    id: 'coherence',
    name: 'Ритм Сердца',
    description: 'Когерентное дыхание (5-5) для синхронизации сердца и мозга.',
    isPremium: false,
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
  },
  {
    id: 'triangle',
    name: 'Треугольник',
    description: 'Мягкая концентрация (4-4-4) перед началом работы.',
    isPremium: false,
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 }
  },
  {
    id: 'calm',
    name: 'Спокойствие',
    description: 'Удлиненный выдох (4-6) для мягкого, безопасного расслабления.',
    isPremium: false,
    phases: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
  },
  
  // PAID PATTERNS
  {
    id: 'energy',
    name: 'Энергия',
    description: 'Быстрый ритм (4-2) для мгновенной бодрости. Как эспрессо.',
    isPremium: true,
    price: 30,
    phases: { inhale: 4, holdIn: 0, exhale: 2, holdOut: 0 }
  },
  {
    id: 'antistress',
    name: 'Анти-Стресс',
    description: 'Длинный выдох мгновенно снижает уровень стресса.',
    isPremium: true,
    price: 25,
    phases: { inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 }
  },
  {
    id: 'box',
    name: 'Квадрат',
    description: 'Классическая техника "спецназа" для полного контроля.',
    isPremium: true,
    price: 50,
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
  },
  {
    id: 'box_pro',
    name: 'Квадрат PRO',
    description: 'Усложненная версия (6-6-6-6) для тренировки легких.',
    isPremium: true,
    price: 75,
    phases: { inhale: 6, holdIn: 6, exhale: 6, holdOut: 6 }
  },
  {
    id: 'relax',
    name: '4-7-8 Сон',
    description: 'Мощная техника доктора Вейла для быстрого засыпания.',
    isPremium: true,
    price: 75,
    phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
  },
  {
    id: 'deep_focus',
    name: 'Мастер Дзен',
    description: 'Продвинутая задержка для глубокой медитации.',
    isPremium: true,
    price: 100,
    phases: { inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 }
  },
  {
    id: 'pranayama',
    name: 'Йога (1:4:2)',
    description: 'Древняя техника (4-16-8) для полного контроля над умом.',
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

  // --- ВОТ ТУТ ГЛАВНОЕ ИЗМЕНЕНИЕ ---
  const handlePurchase = async () => {
    if (!selectedUnlockPattern) return;
    
    setIsPurchasing(true);
    
    // Мы передаем теперь 3 параметра: Цену, Название, Описание
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
  // --------------------------------

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans animate-gradient bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      
      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            ZenBreath
            </h1>
            <p className="text-xs text-slate-400">Telegram Stars Edition</p>
        </div>
        {aiAdvice && (
            <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-cyan-200 flex items-center gap-2">
                <Sparkles size={12} /> {aiAdvice.mood}
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center relative">
        
        {/* AI Quote */}
        {aiAdvice && (
            <div className="px-8 text-center mb-4 animate-pulse">
                <p className="text-slate-300 italic text-sm">"{aiAdvice.text}"</p>
            </div>
        )}

        {/* Breathing Circle */}
        <div className="flex-grow flex items-center">
            <BreathingCircle pattern={currentPattern} />
        </div>

      </main>

      {/* Footer / Controls */}
      <footer className="w-full bg-[#0f172a]/80 backdrop-blur-lg border-t border-white/5 pb-8 pt-4 rounded-t-3xl">
        <div className="px-6 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <span className="text-sm font-bold text-slate-200">Выберите технику</span>
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