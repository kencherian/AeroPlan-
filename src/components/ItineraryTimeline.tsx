import React, { useState } from 'react';
import { Calendar, Coffee, MapPin, Feather, Sun, Sparkles } from 'lucide-react';
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
    <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#EFECE6] gap-2">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#D98880]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Your Gentle Daily Rhythm ({days.length} Days)
          </h3>
        </div>
        <div className="text-xs text-[#8C8279]">
          Designed for slow exploration, delightful meals & restorative rest
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none border-b border-[#EFECE6]">
        {days.map((day) => {
          const isSelected = day.day_number === selectedDay;
          return (
            <button
              key={day.day_number}
              onClick={() => setSelectedDay(day.day_number)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#7E907B] text-white shadow-xs font-semibold'
                  : 'bg-[#F9F6F0] text-[#8C8279] hover:text-[#3E3832] border border-[#EFECE6]'
              }`}
            >
              <span>Day {day.day_number}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-[#E8EFE7]' : 'text-[#8C8279]'}`}>
                {day.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Agenda */}
      <div className="bg-[#F9F6F0] rounded-xl border border-[#EFECE6] p-5">
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#E8E4DC]">
          <div>
            <h4 className="text-sm font-semibold text-[#3E3832]">
              Day {activeDay.day_number} Experiences
            </h4>
            <span className="text-xs text-[#8C8279] font-mono">
              Date: {activeDay.date}
            </span>
          </div>
          <span className="text-xs text-[#8C8279] font-mono">
            {activeDay.agenda.length} Mindful Stops
          </span>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#DED9D0]">
          {activeDay.agenda.map((item, idx) => {
            const timeSlots = ['Morning Awakening', 'Gentle Afternoon', 'Golden Hour & Sunset', 'Peaceful Evening', 'Night Rest'];
            const slotName = timeSlots[idx] || `Part ${idx + 1}`;

            return (
              <div key={idx} className="relative group">
                {/* Node marker */}
                <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#8A9A86]" />
                
                <div className="bg-white border border-[#EFECE6] rounded-xl p-3.5 hover:border-[#DED9D0] transition-all shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-medium text-[#73836F]">
                      {slotName}
                    </span>
                    <span className="text-[10px] text-[#8C8279] font-mono">
                      Stop {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-[#3E3832] leading-relaxed">
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
