import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyItineraryDay } from '../types.ts';

interface ItineraryTimelineProps {
  days: DailyItineraryDay[];
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ days }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  if (!days || days.length === 0) {
    return null;
  }

  const activeDay = days.find((d) => d.day_number === selectedDay) || days[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Comprehensive Daily Itinerary ({days.length} Days)
          </h3>
        </div>
        <div className="text-xs text-slate-400">
          Curated around confirmed arrival & lodging anchors
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-800/60">
        {days.map((day) => {
          const isSelected = day.day_number === selectedDay;
          return (
            <button
              key={day.day_number}
              onClick={() => setSelectedDay(day.day_number)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="font-semibold">Day {day.day_number}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                {day.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Agenda */}
      <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              Day {activeDay.day_number} Schedule
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Date: {activeDay.date}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {activeDay.agenda.length} Scheduled Activities
          </span>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
          {activeDay.agenda.map((item, idx) => {
            const timeSlots = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Night'];
            const slotName = timeSlots[idx] || `Activity ${idx + 1}`;

            return (
              <div key={idx} className="relative group">
                {/* Node marker */}
                <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-indigo-400" />
                
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-medium text-indigo-300">
                      {slotName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Step {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {item}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
