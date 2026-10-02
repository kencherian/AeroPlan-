/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { TripForm } from './components/TripForm.tsx';
import { AgentExecutionTracer } from './components/AgentExecutionTracer.tsx';
import { FinancialSummary } from './components/FinancialSummary.tsx';
import { BookingsCard } from './components/BookingsCard.tsx';
import { ItineraryTimeline } from './components/ItineraryTimeline.tsx';
import { JsonViewer } from './components/JsonViewer.tsx';
import { FailureDeficitCard } from './components/FailureDeficitCard.tsx';
import { DirectToolExplorer } from './components/DirectToolExplorer.tsx';
import { SchemaDocumentation } from './components/SchemaDocumentation.tsx';
import { FlightRouteMap } from './components/FlightRouteMap.tsx';
import { AgentExecutionResult, PresetScenario } from './types.ts';
import { PRESET_SCENARIOS } from './data/presets.ts';
import { Bot, Sparkles, Terminal, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'map' | 'tracer' | 'tools' | 'schema'>('planner');
  
  // Trip constraint states
  const defaultPreset = PRESET_SCENARIOS[0];
  const [origin, setOrigin] = useState(defaultPreset.origin);
  const [destination, setDestination] = useState(defaultPreset.destination);
  const [departureDate, setDepartureDate] = useState(defaultPreset.departureDate);
  const [returnDate, setReturnDate] = useState(defaultPreset.returnDate);
  const [budget, setBudget] = useState(defaultPreset.budget);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(defaultPreset.id);

  const [isLoading, setIsLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentExecutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Execute Agent
  const handleExecuteAgent = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate,
          totalBudget: budget,
        }),
      });

      const data: AgentExecutionResult = await response.json();
      setAgentResult(data);

      if (data.output.status === 'error') {
        setErrorMessage(data.output.error_message || 'Agent failed to find viable combination.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to reach agent execution service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Preset Selector Handler
  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setDepartureDate(preset.departureDate);
    setReturnDate(preset.returnDate);
    setBudget(preset.budget);
  };

  const handleResetToSample = () => {
    handleSelectPreset(defaultPreset);
  };

  // Run automatically on first mount
  useEffect(() => {
    handleExecuteAgent();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetToSample={handleResetToSample}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Intro Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-indigo-400">
              <Bot className="w-4 h-4" />
              <span>Autonomous Agent Workflow · Real-Time Flight & Hotel APIs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Budget-Optimized Autonomous Itinerary Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Iteratively queries live flight options via <code className="text-slate-300 font-mono">search_flights</code>, computes remaining accommodation ceilings, queries <code className="text-slate-300 font-mono">search_hotels</code>, and performs agentic reflection and parameter self-correction to satisfy strict budget constraints.
            </p>
          </div>
        </div>

        {/* Trip Constraints Form */}
        <TripForm
          origin={origin}
          setOrigin={(val) => { setOrigin(val); setSelectedPresetId(undefined); }}
          destination={destination}
          setDestination={(val) => { setDestination(val); setSelectedPresetId(undefined); }}
          departureDate={departureDate}
          setDepartureDate={(val) => { setDepartureDate(val); setSelectedPresetId(undefined); }}
          returnDate={returnDate}
          setReturnDate={(val) => { setReturnDate(val); setSelectedPresetId(undefined); }}
          budget={budget}
          setBudget={(val) => { setBudget(val); setSelectedPresetId(undefined); }}
          onExecute={handleExecuteAgent}
          isLoading={isLoading}
          selectedPresetId={selectedPresetId}
          onSelectPreset={(p) => {
            handleSelectPreset(p);
          }}
        />

        {/* Tab 1: Planner Overview */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            {/* Quick Status Bar */}
            {agentResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${agentResult.output.status === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">
                      {agentResult.output.status === 'success'
                        ? 'Mathematically Viable Plan Formulated'
                        : 'Budget Deficit Detected (Failure State)'}
                    </span>
                    <span className="text-xs text-slate-400 block font-mono">
                      {agentResult.traces.length} Reasoning & Tool Steps Executed · {agentResult.executionTimeMs}ms
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('tracer')}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  View Full Step-by-Step Reasoning Trace
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Failure State Notice */}
            {agentResult && agentResult.output.status === 'error' && (
              <FailureDeficitCard
                errorMessage={agentResult.output.error_message}
                financials={agentResult.output.financials}
                onAdjustBudget={(amt) => {
                  setBudget(amt);
                  setSelectedPresetId(undefined);
                }}
              />
            )}

            {/* Success State Content */}
            {agentResult && agentResult.output.status === 'success' && (
              <>
                {/* Financial Ledger */}
                <FinancialSummary
                  financials={agentResult.output.financials}
                  bookings={agentResult.output.bookings}
                />

                {/* Confirmed Bookings */}
                {agentResult.output.bookings && (
                  <BookingsCard
                    bookings={agentResult.output.bookings}
                    origin={origin}
                    destination={destination}
                    departureDate={departureDate}
                    returnDate={returnDate}
                  />
                )}

                {/* D3 Great Circle Flight Path Map */}
                <FlightRouteMap
                  originIata={origin}
                  destinationIata={destination}
                  flightNumber={agentResult.output.bookings?.flight_pnr}
                />

                {/* Daily Itinerary */}
                {agentResult.output.daily_itinerary && (
                  <ItineraryTimeline days={agentResult.output.daily_itinerary} />
                )}
              </>
            )}

            {/* Strict JSON Output Schema Block */}
            {agentResult && (
              <JsonViewer data={agentResult.output} />
            )}
          </div>
        )}

        {/* Tab: Dedicated Flight Map View */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-200">
                Interactive Flight Path & Geodesic Navigation
              </h2>
              <p className="text-xs text-slate-400">
                Spherical great-circle route plotting between origin ({origin}) and destination ({destination}) rendered with D3.js.
              </p>
            </div>

            <FlightRouteMap
              originIata={origin}
              destinationIata={destination}
              flightNumber={agentResult?.output.bookings?.flight_pnr}
            />
          </div>
        )}

        {/* Tab 2: Reasoning Trace */}
        {activeTab === 'tracer' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-200">
                  Agentic Step-by-Step Reasoning Trace
                </h2>
                <p className="text-xs text-slate-400">
                  Detailed inspection of tool invocations, ceiling calculations, and self-correction reflection loops.
                </p>
              </div>
            </div>

            <AgentExecutionTracer
              traces={agentResult?.traces || []}
              isLoading={isLoading}
              executionTimeMs={agentResult?.executionTimeMs}
            />
          </div>
        )}

        {/* Tab 3: Direct Tools Explorer */}
        {activeTab === 'tools' && (
          <DirectToolExplorer />
        )}

        {/* Tab 4: JSON Schema Docs */}
        {activeTab === 'schema' && (
          <SchemaDocumentation />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>AeroPlan Autonomous Planner</span>
            <span aria-hidden="true">·</span>
            <span>Iterative Tool Execution & Self-Correction</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Response MIME: application/json</span>
            <span aria-hidden="true">·</span>
            <span>Model: models/gemini-3.8-flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
