import React from 'react';
import { DollarSign, Wallet, ArrowDownRight, PiggyBank } from 'lucide-react';
import { Financials, Bookings } from '../types.ts';

interface FinancialSummaryProps {
  financials: Financials;
  bookings?: Bookings;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ financials, bookings }) => {
  const { total_budget, total_spent, remaining_funds } = financials;
  const flightCost = bookings?.flight_cost || 0;
  const hotelCost = bookings?.hotel_total_cost || 0;

  const flightPct = total_budget > 0 ? Math.min(100, Math.round((flightCost / total_budget) * 100)) : 0;
  const hotelPct = total_budget > 0 ? Math.min(100, Math.round((hotelCost / total_budget) * 100)) : 0;
  const surplusPct = Math.max(0, 100 - flightPct - hotelPct);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Financial Ledger & Budget Allocation
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          <span>Target Cap: </span>
          <span className="text-slate-200 font-semibold tabular-nums">${total_budget.toLocaleString()} USD</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Total Budget */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Budget</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            ${total_budget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Strict user-defined ceiling
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Committed</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
            ${total_spent.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Flight (${flightCost}) + Hotel (${hotelCost})
          </div>
        </div>

        {/* Remaining Funds */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Remaining Funds</span>
            <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums ${remaining_funds >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${remaining_funds.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {remaining_funds >= 0 ? 'Surplus for dining & activities' : 'Budget deficit'}
          </div>
        </div>
      </div>

      {/* Stacked Allocation Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono text-[11px]">
          <span>Allocation Breakdown</span>
          <span>{100 - surplusPct}% Allocated</span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${flightPct}%` }}
            className="bg-indigo-500 transition-all duration-500"
            title={`Flight: ${flightPct}%`}
          />
          <div
            style={{ width: `${hotelPct}%` }}
            className="bg-teal-500 transition-all duration-500"
            title={`Hotel: ${hotelPct}%`}
          />
          <div
            style={{ width: `${surplusPct}%` }}
            className="bg-emerald-500/40 transition-all duration-500"
            title={`Surplus: ${surplusPct}%`}
          />
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Flight: ${flightCost} ({flightPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            <span>Hotel: ${hotelCost} ({hotelPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/60 inline-block" />
            <span>Surplus: ${remaining_funds} ({surplusPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
