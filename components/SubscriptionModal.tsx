import React from 'react';
import { Star, X, Check } from 'lucide-react';
import { BreathingPattern } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: BreathingPattern | null;
  onPurchase: () => void;
  isLoading: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  pattern, 
  onPurchase, 
  isLoading 
}) => {
  if (!isOpen || !pattern) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-fade-in-up">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mb-4 text-amber-400">
            <Star size={32} fill="currentColor" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Unlock "{pattern.name}"
          </h2>
          
          <p className="text-slate-400 text-sm mb-6">
            Get lifetime access to this advanced breathing technique for deep relaxation and focus.
          </p>

          <div className="w-full bg-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Price</span>
              <span className="flex items-center gap-1 font-bold text-white">
                <Star size={14} className="text-amber-400" fill="currentColor"/> {pattern.price} Stars
              </span>
            </div>
            <div className="h-px bg-slate-700 my-2"></div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Check size={12} /> Lifetime access
            </div>
          </div>

          <button
            onClick={onPurchase}
            disabled={isLoading}
            className={`
              w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white
              ${isLoading ? 'bg-cyan-600/50 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all'}
            `}
          >
            {isLoading ? 'Processing...' : `Pay ${pattern.price} Stars`}
          </button>
          
          <p className="mt-4 text-xs text-slate-500">
            Secure payment via Telegram Stars
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;