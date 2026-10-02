import React, { useState } from 'react';
import { Plane, Calendar, DollarSign, ArrowRight, Play, RefreshCw, AlertCircle } from 'lucide-react';
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

  // Compute stay length
  const nights = Math.max(
    1,
    Math.round(
      (new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24)
    ) || 1
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Preset Quick Selectors */}
      <div className="mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Automated Test Scenarios
          </span>
          <span className="text-xs text-slate-500">
            Pick a scenario to test self-correction or deficit handling
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {preset.title}
                  </span>
                  {preset.expectedOutcome === 'triggers_reflection' && (
                    <span className="text-[10px] text-amber-400 font-mono">Self-Corrects</span>
                  )}
                  {preset.expectedOutcome === 'fails_budget_deficit' && (
                    <span className="text-[10px] text-rose-400 font-mono">Deficit Test</span>
                  )}
                  {preset.expectedOutcome === 'feasible' && (
                    <span className="text-[10px] text-emerald-400 font-mono">Feasible</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {preset.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Constraint Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Origin */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-slate-400 rotate-45" />
            Origin (IATA)
          </label>
          <div className="relative">
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
              onFocus={() => setShowAirportList('origin')}
              placeholder="e.g. SFO"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-semibold tracking-wider text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
            />
          </div>
          {showAirportList === 'origin' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto p-1">
              <div className="text-[10px] font-semibold text-slate-500 px-2 py-1">Major Hubs</div>
              {AIRPORTS.slice(0, 8).map((a) => (
                <button
                  key={a.iata}
                  type="button"
                  onClick={() => {
                    setOrigin(a.iata);
                    setShowAirportList(null);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center justify-between"
                >
                  <span className="font-mono font-semibold text-indigo-300">{a.iata}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{a.city}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAirportList(null)}
                className="w-full text-center py-1 text-[10px] text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-slate-400 rotate-90" />
            Destination (IATA)
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
              onFocus={() => setShowAirportList('dest')}
              placeholder="e.g. HND"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-semibold tracking-wider text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
            />
          </div>
          {showAirportList === 'dest' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto p-1">
              <div className="text-[10px] font-semibold text-slate-500 px-2 py-1">Destinations</div>
              {AIRPORTS.map((a) => (
                <button
                  key={a.iata}
                  type="button"
                  onClick={() => {
                    setDestination(a.iata);
                    setShowAirportList(null);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded flex items-center justify-between"
                >
                  <span className="font-mono font-semibold text-indigo-300">{a.iata}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{a.city}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAirportList(null)}
                className="w-full text-center py-1 text-[10px] text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Departure Date */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Departure Date
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Return Date ({nights}n)
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Strict Budget */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Strict Total Budget ($)
          </label>
          <input
            type="number"
            min={100}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Math.max(1, Number(e.target.value)))}
            placeholder="2200"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-semibold text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Constraint Target:</span>
          <span className="font-mono text-slate-200">{origin} → {destination}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-200">{departureDate} to {returnDate}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-emerald-400 font-semibold">${budget.toLocaleString()} USD</span>
        </div>

        <button
          onClick={onExecute}
          disabled={isLoading || !origin || !destination}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Agent Executing & Reflecting...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Run Autonomous Agent
            </>
          )}
        </button>
      </div>
    </div>
  );
};
