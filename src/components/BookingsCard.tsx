import React from 'react';
import { Plane, Building, Ticket, MapPin, Calendar, Check, ArrowRight } from 'lucide-react';
import { Bookings } from '../types.ts';

interface BookingsCardProps {
  bookings: Bookings;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
}

export const BookingsCard: React.FC<BookingsCardProps> = ({
  bookings,
  origin = 'ORIGIN',
  destination = 'DEST',
  departureDate,
  returnDate,
}) => {
  const { flight_pnr, flight_cost, hotel_name, hotel_total_cost } = bookings;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Confirmed Agent Bookings
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          <span>Total Combined: </span>
          <span className="text-indigo-300 font-semibold tabular-nums">
            ${(flight_cost + hotel_total_cost).toLocaleString()} USD
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flight Booking Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Plane className="w-4 h-4 rotate-45" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Roundtrip Flight</span>
                  <span className="text-[11px] text-slate-400 font-mono">PNR: {flight_pnr}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-indigo-300 tabular-nums">
                  ${flight_cost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">Total Fare</span>
              </div>
            </div>

            {/* Flight Route Visualizer */}
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800/80 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-bold font-mono text-slate-100">{origin}</span>
                  <span className="text-[11px] text-slate-400 block">{departureDate || 'Outbound'}</span>
                </div>
                <div className="flex-1 px-3 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-500 mb-0.5">Roundtrip Confirmed</span>
                  <div className="w-full h-px bg-slate-700 relative flex items-center justify-center">
                    <Plane className="w-3 h-3 text-indigo-400 absolute rotate-90" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-100">{destination}</span>
                  <span className="text-[11px] text-slate-400 block">{returnDate || 'Inbound'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Real-time availability locked via <code className="text-slate-300 font-mono">search_flights</code></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Price mathematically verified against budget threshold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Booking Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[180px]">
                    {hotel_name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Destination Accommodation</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-teal-300 tabular-nums">
                  ${hotel_total_cost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">Total Stay Cost</span>
              </div>
            </div>

            {/* Hotel Details Box */}
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800/80 mb-3 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Property:</span>
                <span className="font-medium text-slate-100">{hotel_name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Duration:</span>
                <span className="font-mono text-slate-200">
                  {departureDate && returnDate ? `${departureDate} → ${returnDate}` : 'Full Stay'}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Queried using dynamically calculated nightly ceiling via <code className="text-slate-300 font-mono">search_hotels</code></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Self-corrected rating tier to satisfy total budget constraint</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
