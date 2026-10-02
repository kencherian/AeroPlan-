import React from 'react';
import { Heart, Sparkles, ArrowRight, RotateCcw, Coffee } from 'lucide-react';
import { Financials } from '../types.ts';

interface FailureDeficitCardProps {
  errorMessage?: string;
  financials: Financials;
  onAdjustBudget: (suggestedAmount: number) => void;
}

export const FailureDeficitCard: React.FC<FailureDeficitCardProps> = ({
  errorMessage,
  financials,
  onAdjustBudget,
}) => {
  const match = errorMessage?.match(/around \$([0-9,]+)/i);
  const minRequired = match ? Number(match[1].replace(/,/g, '')) : financials.total_budget + 350;

  return (
    <div className="bg-[#FAF4F0] border border-[#ECD9D4] rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[#E0A996]/25 border border-[#E0A996]/50 flex items-center justify-center text-[#C4736B] shrink-0 mt-0.5">
          <Heart className="w-5 h-5 fill-[#E0A996]/30" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-medium text-[#C4736B]">
              Gentle Guidance (Status: "error")
            </span>
          </div>
          <h3 className="text-base font-semibold text-[#3E3832] mb-2">
            Let's Harmonize Your Cozy Spending Goal
          </h3>
          <p className="text-xs text-[#524942] leading-relaxed bg-white/80 border border-[#ECD9D4] p-4 rounded-xl font-mono">
            {errorMessage || 'We lovingly looked through every option, but current travel rates for this season are just a little higher than our cozy spending goal.'}
          </p>

          <div className="mt-4 pt-4 border-t border-[#ECD9D4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-[#8C8279]">
              <span>Current Comfort Goal: </span>
              <span className="font-mono text-[#3E3832] font-semibold">${financials.total_budget.toLocaleString()} USD</span>
              <span className="mx-2">·</span>
              <span>Gentle Recommendation: </span>
              <span className="font-mono text-[#C4736B] font-semibold">${minRequired.toLocaleString()} USD</span>
            </div>

            <button
              onClick={() => onAdjustBudget(minRequired)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#C4736B] hover:bg-[#B7655D] rounded-xl transition-all flex items-center gap-2 shadow-xs whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Harmonize Goal to ${minRequired.toLocaleString()} & Re-craft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
