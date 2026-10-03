import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Feather, 
  Calendar, 
  Plane, 
  Building, 
  Heart, 
  Sun, 
  Shirt, 
  CheckCircle2,
  Ticket
} from 'lucide-react';
import { AgentPlanOutput } from '../types.ts';
import { exportItineraryPdf } from '../services/pdfExporter.ts';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  output: AgentPlanOutput;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  destinationCity?: string;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  output,
  origin,
  destination,
  departureDate,
  returnDate,
  destinationCity,
}) => {
  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    exportItineraryPdf({
      output,
      origin,
      destination,
      departureDate,
      returnDate,
      destinationCity,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const { total_budget, total_spent, remaining_funds } = output.financials;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-[#EFECE6] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Control Bar (Hidden when printing via no-print class) */}
        <div className="px-6 py-4 border-b border-[#EFECE6] bg-[#FDFCF9] flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#73836F]" />
            <h3 className="text-sm font-semibold text-[#3E3832]">
              Printable Itinerary & Financial Summary Report
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7E907B] hover:bg-[#72836F] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Report
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#3E3832] bg-[#F9F6F0] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#8C8279]" />
              Print Report
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8C8279] hover:text-[#3E3832] rounded-lg hover:bg-[#F9F6F0] transition-colors"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-[#3E3832] bg-white font-sans">
          
          {/* Document Header */}
          <div className="border-b border-[#EFECE6] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8A9A86]/15 border border-[#8A9A86]/30 flex items-center justify-center text-[#73836F] shrink-0">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#3E3832]">
                  AeroPlan Sanctuary Travel Itinerary
                </h1>
                <p className="text-xs text-[#8C8279]">
                  Peaceful Journey Report & Financial Ledger · Prepared with Love
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-[#8C8279]">
              <div>Route: <strong className="text-[#3E3832]">{origin} → {destination}</strong></div>
              <div>Dates: <strong className="text-[#3E3832]">{departureDate} to {returnDate}</strong></div>
              <div>Status: <span className="text-[#556B52] font-semibold">Confirmed Balanced Plan</span></div>
            </div>
          </div>

          {/* Section 1: Financial Summary Ledger */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-[#D98880]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
                1. Financial Ledger & Cozy Spending Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
                <span className="text-xs text-[#8C8279] block">Total Cozy Goal</span>
                <span className="text-xl font-bold font-mono text-[#3E3832] tabular-nums">
                  ${total_budget.toLocaleString()} USD
                </span>
                <span className="text-[11px] text-[#8C8279] block mt-1">Pre-allocated travel budget</span>
              </div>

              <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
                <span className="text-xs text-[#8C8279] block">Total Committed</span>
                <span className="text-xl font-bold font-mono text-[#C4736B] tabular-nums">
                  ${total_spent.toLocaleString()} USD
                </span>
                <span className="text-[11px] text-[#8C8279] block mt-1">Flight + Accommodations</span>
              </div>

              <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
                <span className="text-xs text-[#8C8279] block">Remaining Pocket Funds</span>
                <span className="text-xl font-bold font-mono text-[#556B52] tabular-nums">
                  ${remaining_funds.toLocaleString()} USD
                </span>
                <span className="text-[11px] text-[#8C8279] block mt-1">For leisurely dining & activities</span>
              </div>
            </div>
          </div>

          {/* Section 2: Confirmed Bookings */}
          {output.bookings && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="w-4 h-4 text-[#73836F]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
                  2. Confirmed Travel Reservations
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Flight Card */}
                <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DC]">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#D98880] rotate-45" />
                      <span className="text-xs font-semibold text-[#3E3832]">Roundtrip Flight</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#3E3832]">
                      ${output.bookings.flight_cost.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-[#8C8279]">
                    <div>PNR Reference: <strong className="text-[#3E3832]">{output.bookings.flight_pnr}</strong></div>
                    <div>Route: <strong className="text-[#3E3832]">{origin} ↔ {destination}</strong></div>
                    <div>Travel Window: <strong className="text-[#3E3832]">{departureDate} to {returnDate}</strong></div>
                  </div>
                </div>

                {/* Hotel Card */}
                <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DC]">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#8A9A86]" />
                      <span className="text-xs font-semibold text-[#3E3832]">Tranquil Accommodation</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#3E3832]">
                      ${output.bookings.hotel_total_cost.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-[#8C8279]">
                    <div>Property: <strong className="text-[#3E3832]">{output.bookings.hotel_name}</strong></div>
                    <div>Stay: <strong className="text-[#3E3832]">Check-in {departureDate} → Check-out {returnDate}</strong></div>
                    <div>Balance: <strong className="text-[#556B52]">Locked within budget ceiling</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Daily Itinerary & Atmospheric Forecasts */}
          {output.daily_itinerary && output.daily_itinerary.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-[#D98880]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
                  3. Comprehensive Daily Itinerary & Mindful Atmospheric Forecasts
                </h2>
              </div>

              <div className="space-y-3.5">
                {output.daily_itinerary.map((day) => (
                  <div
                    key={day.day_number}
                    className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4.5 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E8E4DC] gap-1">
                      <span className="text-sm font-semibold text-[#3E3832]">
                        Day {day.day_number} · {day.date}
                      </span>
                      {day.weather && (
                        <div className="flex items-center gap-2 text-xs font-mono text-[#73836F]">
                          <Sun className="w-3.5 h-3.5 text-[#D98880]" />
                          <span>{day.weather.condition}</span>
                          <span className="text-[#8C8279]">
                            ({day.weather.temp_high_c}°C / {day.weather.temp_high_f}°F · Low {day.weather.temp_low_c}°C)
                          </span>
                        </div>
                      )}
                    </div>

                    {day.weather?.clothing_tip && (
                      <div className="flex items-center gap-1.5 text-xs text-[#556B52]">
                        <Shirt className="w-3.5 h-3.5 text-[#8A9A86] shrink-0" />
                        <span><strong>Attire Tip:</strong> {day.weather.clothing_tip}</span>
                      </div>
                    )}

                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-[#3E3832] leading-relaxed">
                      {day.agenda.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Sign-off */}
          <div className="pt-6 border-t border-[#EFECE6] text-center text-xs text-[#8C8279]">
            <p>
              Thank you for trusting AeroPlan Sanctuary. May your journey be serene, deeply restoring, and filled with wonder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
