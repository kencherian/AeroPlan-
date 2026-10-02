import React from 'react';
import { Plane, Building, Ticket, Check, ArrowRight, Heart, Feather } from 'lucide-react';
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
    <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-[#EFECE6]">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[#8A9A86]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Your Confirmed Journey Bookings
          </h3>
        </div>
        <div className="text-xs text-[#8C8279] font-mono">
          <span>Combined Total: </span>
          <span className="text-[#3E3832] font-semibold tabular-nums">
            ${(flight_cost + hotel_total_cost).toLocaleString()} USD
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flight Booking Card */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E0A996]/20 border border-[#E0A996]/40 flex items-center justify-center text-[#C4736B]">
                  <Plane className="w-4 h-4 rotate-45" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#3E3832] block">Comfortable Roundtrip Flight</span>
                  <span className="text-[11px] text-[#8C8279] font-mono">Reservation: {flight_pnr}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-[#3E3832] tabular-nums">
                  ${flight_cost.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8C8279] block">Total Flight Fare</span>
              </div>
            </div>

            {/* Flight Route Visualizer */}
            <div className="bg-white rounded-xl p-3.5 border border-[#EFECE6] mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-bold font-mono text-[#3E3832]">{origin}</span>
                  <span className="text-[11px] text-[#8C8279] block">{departureDate || 'Outbound'}</span>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-[#8C8279] mb-1">Smooth Return Transit</span>
                  <div className="w-full h-px bg-[#DED9D0] relative flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5 text-[#D98880] absolute rotate-90" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-[#3E3832]">{destination}</span>
                  <span className="text-[11px] text-[#8C8279] block">{returnDate || 'Inbound'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#8C8279]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#556B52] shrink-0" />
                <span>Real-time flight seat and fare verified via <code className="text-[#3E3832] font-mono">search_flights</code></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#556B52] shrink-0" />
                <span>Price mindfully chosen to protect your accommodation funds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Booking Card */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8A9A86]/20 border border-[#8A9A86]/40 flex items-center justify-center text-[#556B52]">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#3E3832] block truncate max-w-[180px]">
                    {hotel_name}
                  </span>
                  <span className="text-[11px] text-[#8C8279] font-mono">Tranquil Lodging</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-[#3E3832] tabular-nums">
                  ${hotel_total_cost.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8C8279] block">Total Stay Cost</span>
              </div>
            </div>

            {/* Hotel Details Box */}
            <div className="bg-white rounded-xl p-3.5 border border-[#EFECE6] mb-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#3E3832]">
                <span className="text-[#8C8279]">Welcoming Stay:</span>
                <span className="font-medium text-[#3E3832]">{hotel_name}</span>
              </div>
              <div className="flex items-center justify-between text-[#3E3832]">
                <span className="text-[#8C8279]">Stay Length:</span>
                <span className="font-mono text-[#3E3832]">
                  {departureDate && returnDate ? `${departureDate} → ${returnDate}` : 'Entire Stay'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#8C8279]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#556B52] shrink-0" />
                <span>Found using our cozy per-night ceiling via <code className="text-[#3E3832] font-mono">search_hotels</code></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#556B52] shrink-0" />
                <span>Balanced for your comfort, warmth, and peaceful rest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
