import React, { useState } from 'react';
import { Plane, Calendar, Heart, Play, RefreshCw, Sparkles, MapPin, Feather } from 'lucide-react';
import { AIRPORTS } from '../data/airports.ts';
import { PRESET_SCENARIOS } from '../data/presets.ts';
import { PresetScenario } from '../types.ts';

interface TripFormProps {
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  departureDate: string;
  setDepartureDate: (val: string) => void;
  returnDate: string;
  setReturnDate: (val: string) => void;
  budget: number;
  setBudget: (val: number) => void;
  onExecute: () => void;
  isLoading: boolean;
  selectedPresetId?: string;
  onSelectPreset: (preset: PresetScenario) => void;
}

export const TripForm: React.FC<TripFormProps> = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  departureDate,
  setDepartureDate,
  returnDate,
  setReturnDate,
  budget,
  setBudget,
  onExecute,
  isLoading,
  selectedPresetId,
  onSelectPreset,
}) => {
  const [showAirportList, setShowAirportList] = useState<'origin' | 'dest' | null>(null);

  const nights = Math.max(
    1,
    Math.round(
      (new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-sm">
      {/* Preset Quick Selectors */}
      <div className="mb-6 pb-5 border-b border-[#EFECE6]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D98880]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
              Thoughtfully Curated Getaways
            </span>
          </div>
          <span className="text-xs text-[#8C8279]">
            Pick a gentle inspiration to test how we harmonize your budget
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#8A9A86]/10 border-[#8A9A86] ring-1 ring-[#8A9A86]/30 shadow-xs'
                    : 'bg-[#F9F6F0] border-[#EFECE6] hover:border-[#DED9D0] hover:bg-[#F4EFE6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3E3832] truncate">
                    {preset.title}
                  </span>
                  {preset.expectedOutcome === 'triggers_reflection' && (
                    <span className="text-[10px] text-[#C4736B] font-medium bg-[#E0A996]/20 px-1.5 py-0.5 rounded">
                      Harmonizes
                    </span>
                  )}
                  {preset.expectedOutcome === 'fails_budget_deficit' && (
                    <span className="text-[10px] text-[#A66E69] font-medium bg-[#D98880]/15 px-1.5 py-0.5 rounded">
                      Gentle Advice
                    </span>
                  )}
                  {preset.expectedOutcome === 'feasible' && (
                    <span className="text-[10px] text-[#556B52] font-medium bg-[#8A9A86]/20 px-1.5 py-0.5 rounded">
                      Balanced
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8C8279] mt-1 truncate">
                  {preset.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Constraint Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Origin */}
        <div className="relative">
          <label className="block text-xs font-medium text-[#8C8279] mb-1.5 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-[#8A9A86] rotate-45" />
            Departing From (IATA)
          </label>
          <div className="relative">
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
              onFocus={() => setShowAirportList('origin')}
              placeholder="e.g. SFO"
              className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold tracking-wider text-[#3E3832] placeholder:text-[#BBB4AA] focus:outline-none focus:border-[#8A9A86] focus:bg-white transition-all uppercase"
            />
          </div>
          {showAirportList === 'origin' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EFECE6] rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto p-1.5">
              <div className="text-[10px] font-semibold text-[#8C8279] px-2 py-1">Popular Departure Cities</div>
              {AIRPORTS.slice(0, 8).map((a) => (
                <button
                  key={a.iata}
                  type="button"
                  onClick={() => {
                    setOrigin(a.iata);
                    setShowAirportList(null);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-[#3E3832] hover:bg-[#F9F6F0] rounded-lg flex items-center justify-between"
                >
                  <span className="font-mono font-semibold text-[#73836F]">{a.iata}</span>
                  <span className="text-[#8C8279] text-[11px] truncate max-w-[120px]">{a.city}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAirportList(null)}
                className="w-full text-center py-1 text-[10px] text-[#8C8279] hover:text-[#3E3832]"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="relative">
          <label className="block text-xs font-medium text-[#8C8279] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D98880]" />
            Your Sanctuary (IATA)
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
              onFocus={() => setShowAirportList('dest')}
              placeholder="e.g. HND"
              className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold tracking-wider text-[#3E3832] placeholder:text-[#BBB4AA] focus:outline-none focus:border-[#8A9A86] focus:bg-white transition-all uppercase"
            />
          </div>
          {showAirportList === 'dest' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EFECE6] rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto p-1.5">
              <div className="text-[10px] font-semibold text-[#8C8279] px-2 py-1">Welcoming Destinations</div>
              {AIRPORTS.map((a) => (
                <button
                  key={a.iata}
                  type="button"
                  onClick={() => {
                    setDestination(a.iata);
                    setShowAirportList(null);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-[#3E3832] hover:bg-[#F9F6F0] rounded-lg flex items-center justify-between"
                >
                  <span className="font-mono font-semibold text-[#73836F]">{a.iata}</span>
                  <span className="text-[#8C8279] text-[11px] truncate max-w-[120px]">{a.city}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAirportList(null)}
                className="w-full text-center py-1 text-[10px] text-[#8C8279] hover:text-[#3E3832]"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Departure Date */}
        <div>
          <label className="block text-xs font-medium text-[#8C8279] mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8A9A86]" />
            Departure Date
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white transition-all"
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-xs font-medium text-[#8C8279] mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8A9A86]" />
            Return Date ({nights} peaceful nights)
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white transition-all"
          />
        </div>

        {/* Cozy Spending Goal */}
        <div>
          <label className="block text-xs font-medium text-[#8C8279] mb-1.5 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#D98880]" />
            Our Cozy Spending Goal ($)
          </label>
          <input
            type="number"
            min={100}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Math.max(1, Number(e.target.value)))}
            placeholder="2200"
            className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-5 border-t border-[#EFECE6] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#8C8279] flex items-center gap-2">
          <span>We're preparing for:</span>
          <span className="font-mono text-[#3E3832] font-medium">{origin} → {destination}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[#3E3832] font-medium">{departureDate} to {returnDate}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[#73836F] font-semibold">${budget.toLocaleString()} USD goal</span>
        </div>

        <button
          onClick={onExecute}
          disabled={isLoading || !origin || !destination}
          className="w-full sm:w-auto px-7 py-3 text-xs font-semibold text-white bg-[#7E907B] hover:bg-[#72836F] active:bg-[#667663] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Thoughtfully Harmonizing Your Trip...
            </>
          ) : (
            <>
              <Feather className="w-4 h-4" />
              Craft My Peaceful Getaway
            </>
          )}
        </button>
      </div>
    </div>
  );
};
