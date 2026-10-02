import React from 'react';
import { Heart, Sparkles, Coffee, ShieldCheck } from 'lucide-react';
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
    <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#D98880]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Cozy Spending Balance & Peace of Mind
          </h3>
        </div>
        <div className="text-xs text-[#8C8279] font-mono">
          <span>Target Goal: </span>
          <span className="text-[#3E3832] font-semibold tabular-nums">${total_budget.toLocaleString()} USD</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        {/* Total Budget */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
          <div className="text-xs text-[#8C8279] mb-1 flex items-center justify-between">
            <span>Our Cozy Goal</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A9A86]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#3E3832] tabular-nums">
            ${total_budget.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8C8279] mt-1">
            Carefully respected throughout
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
          <div className="text-xs text-[#8C8279] mb-1 flex items-center justify-between">
            <span>Comfortably Reserved</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D98880]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#3E3832] tabular-nums">
            ${total_spent.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8C8279] mt-1">
            Flight (${flightCost}) + Accommodations (${hotelCost})
          </div>
        </div>

        {/* Remaining Funds */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
          <div className="text-xs text-[#8C8279] mb-1 flex items-center justify-between">
            <span>Relaxation Pocket Funds</span>
            <Coffee className="w-3.5 h-3.5 text-[#73836F]" />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums ${remaining_funds >= 0 ? 'text-[#556B52]' : 'text-[#C4736B]'}`}>
            ${remaining_funds.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8C8279] mt-1">
            {remaining_funds >= 0 ? 'For warm tea, local feasts & souvenirs' : 'Gentle deficit'}
          </div>
        </div>
      </div>

      {/* Stacked Allocation Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-[#8C8279] mb-2 font-mono text-[11px]">
          <span>Peaceful Balance Breakdown</span>
          <span>{100 - surplusPct}% Dedicated to Journey</span>
        </div>
        <div className="h-2.5 w-full bg-[#F4EFE6] rounded-full overflow-hidden flex border border-[#E8E4DC]">
          <div
            style={{ width: `${flightPct}%` }}
            className="bg-[#D98880] transition-all duration-500"
            title={`Flight: ${flightPct}%`}
          />
          <div
            style={{ width: `${hotelPct}%` }}
            className="bg-[#8A9A86] transition-all duration-500"
            title={`Hotel: ${hotelPct}%`}
          />
          <div
            style={{ width: `${surplusPct}%` }}
            className="bg-[#DFD9CE] transition-all duration-500"
            title={`Surplus: ${surplusPct}%`}
          />
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#8C8279] mt-2.5 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D98880] inline-block" />
            <span>Flight: ${flightCost} ({flightPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A9A86] inline-block" />
            <span>Hotel: ${hotelCost} ({hotelPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BBB4AA] inline-block" />
            <span>Pocket Funds: ${remaining_funds} ({surplusPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
