import React from 'react';
import { Heart, Sparkles, SlidersHorizontal, Code2, MapPin, Feather, FileDown, Printer } from 'lucide-react';

interface HeaderProps {
  activeTab: 'planner' | 'map' | 'tracer' | 'tools' | 'schema';
  onSelectTab: (tab: 'planner' | 'map' | 'tracer' | 'tools' | 'schema') => void;
  onResetToSample: () => void;
  onExportPdf?: () => void;
  canExportPdf?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onSelectTab, 
  onResetToSample,
  onExportPdf,
  canExportPdf,
}) => {
  return (
    <header className="border-b border-[#EFECE6] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element Brand wordmark with warm sanctuary spirit */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#8A9A86]/15 border border-[#8A9A86]/30 flex items-center justify-center text-[#73836F]">
            <Feather className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-[#3E3832]">
            AeroPlan Sanctuary
          </span>
        </div>

        {/* Zone 2: Warm, gentle Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F7F4EF] p-1 rounded-xl border border-[#EFECE6]">
          <button
            onClick={() => onSelectTab('planner')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-white text-[#3E3832] shadow-sm font-semibold'
                : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            Peaceful Planner
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-white text-[#3E3832] shadow-sm font-semibold'
                : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            Gentle Flight Path
          </button>
          <button
            onClick={() => onSelectTab('tracer')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'tracer'
                ? 'bg-white text-[#3E3832] shadow-sm font-semibold'
                : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            Thoughtful Trace
          </button>
          <button
            onClick={() => onSelectTab('tools')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'bg-white text-[#3E3832] shadow-sm font-semibold'
                : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Live Travel Tools
          </button>
          <button
            onClick={() => onSelectTab('schema')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-white text-[#3E3832] shadow-sm font-semibold'
                : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Structured Output
          </button>
        </nav>

        {/* Zone 3: Primary Warm Companion Action */}
        <div className="flex items-center gap-2">
          {canExportPdf && onExportPdf && (
            <button
              onClick={onExportPdf}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#7E907B] hover:bg-[#72836F] rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export PDF Report
            </button>
          )}

          <button
            onClick={onResetToSample}
            className="px-3.5 py-2 text-xs font-medium text-[#3E3832] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all whitespace-nowrap flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D98880]" />
            Sample Cozy Getaway
          </button>
        </div>
      </div>
    </header>
  );
};
