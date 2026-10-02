import React from 'react';
import { Compass, Sparkles, SlidersHorizontal, Code2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'planner' | 'tracer' | 'tools' | 'schema';
  onSelectTab: (tab: 'planner' | 'tracer' | 'tools' | 'schema') => void;
  onResetToSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onResetToSample }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            AeroPlan Autonomous
          </span>
        </div>

        {/* Zone 2: 4 Clean Nav Links / Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectTab('planner')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agentic Planner
          </button>
          <button
            onClick={() => onSelectTab('tracer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'tracer'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reasoning Trace
          </button>
          <button
            onClick={() => onSelectTab('tools')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Live Tools Explorer
          </button>
          <button
            onClick={() => onSelectTab('schema')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3 h-3" />
            JSON Schema Docs
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToSample}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Load Sample Trip
          </button>
        </div>
      </div>
    </header>
  );
};
