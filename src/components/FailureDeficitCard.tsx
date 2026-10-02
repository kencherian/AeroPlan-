import React from 'react';
import { AlertOctagon, TrendingUp, ArrowRight, ShieldAlert, RotateCcw } from 'lucide-react';
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
  // Extract numbers if available from error message
  const match = errorMessage?.match(/Minimum required budget for .* is \$([0-9,]+)/i);
  const minRequired = match ? Number(match[1].replace(/,/g, '')) : financials.total_budget + 400;

  return (
    <div className="bg-rose-950/20 border border-rose-800/80 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400">
              Agent Execution Failure State (Status: "error")
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-100 mb-2">
            Strict Budget Deficit: Exhaustive Tool Combinations Unviable
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 border border-rose-900/50 p-3.5 rounded-lg font-mono">
            {errorMessage || 'Exhaustive tool calls yielded no viable flight and hotel combination within budget.'}
          </p>

          <div className="mt-4 pt-4 border-t border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              <span>Configured Budget: </span>
              <span className="font-mono text-slate-200 font-semibold">${financials.total_budget.toLocaleString()} USD</span>
              <span className="mx-2">·</span>
              <span>Calculated Minimum: </span>
              <span className="font-mono text-rose-300 font-semibold">${minRequired.toLocaleString()} USD</span>
            </div>

            <button
              onClick={() => onAdjustBudget(minRequired)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Adjust Budget to ${minRequired.toLocaleString()} & Re-run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
