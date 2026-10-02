import React, { useState } from 'react';
import { 
  Calendar, 
  Coffee, 
  MapPin, 
  Feather, 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Sparkles, 
  Shirt, 
  Thermometer,
  Droplets
} from 'lucide-react';
import { DailyItineraryDay, DailyWeatherForecast } from '../types.ts';

interface ItineraryTimelineProps {
  days: DailyItineraryDay[];
}

function renderWeatherIcon(icon?: string, className = "w-4 h-4") {
  switch (icon) {
    case 'sunny':
      return <Sun className={`${className} text-[#D98880]`} />;
    case 'partly_cloudy':
      return <CloudSun className={`${className} text-[#D98880]`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-[#8C8279]`} />;
    case 'rain':
      return <CloudRain className={`${className} text-[#73836F]`} />;
    case 'breeze':
      return <Wind className={`${className} text-[#8A9A86]`} />;
    default:
      return <Sun className={`${className} text-[#D98880]`} />;
  }
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ days }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  if (!days || days.length === 0) {
    return null;
  }

  const activeDay = days.find((d) => d.day_number === selectedDay) || days[0];
  const weather = activeDay.weather;

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#EFECE6] gap-2">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#D98880]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Your Gentle Daily Rhythm & Local Weather ({days.length} Days)
          </h3>
        </div>
        <div className="text-xs text-[#8C8279]">
          Forecasted atmospheric comfort and mindful pacing for each day
        </div>
      </div>

      {/* Day Selector Tabs with Mini Weather Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none border-b border-[#EFECE6]">
        {days.map((day) => {
          const isSelected = day.day_number === selectedDay;
          return (
            <button
              key={day.day_number}
              onClick={() => setSelectedDay(day.day_number)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-[#7E907B] text-white shadow-xs font-semibold'
                  : 'bg-[#F9F6F0] text-[#8C8279] hover:text-[#3E3832] border border-[#EFECE6]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Day {day.day_number}</span>
                {day.weather && (
                  <span className="shrink-0">
                    {renderWeatherIcon(day.weather.icon, "w-3 h-3")}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-[#E8EFE7]' : 'text-[#8C8279]'}`}>
                {day.weather ? `${day.weather.temp_high_c}°C` : day.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Container */}
      <div className="bg-[#F9F6F0] rounded-xl border border-[#EFECE6] p-5 space-y-4">
        {/* Day Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E4DC] gap-2">
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

        {/* Dedicated Weather Section for the Daily Card */}
        {weather && (
          <div className="bg-white rounded-xl border border-[#EFECE6] p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F9F6F0] border border-[#EFECE6] flex items-center justify-center shrink-0">
                  {renderWeatherIcon(weather.icon, "w-5 h-5")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#3E3832]">
                      {weather.condition}
                    </span>
                    <span className="text-[10px] text-[#73836F] bg-[#8A9A86]/15 px-2 py-0.5 rounded-full font-medium">
                      Atmospheric Forecast
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C8279] mt-0.5">
                    {weather.summary}
                  </p>
                </div>
              </div>

              {/* Temperature & Humidity Tag */}
              <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-12 md:pl-0">
                <div className="flex items-center gap-1.5 text-[#3E3832]">
                  <Thermometer className="w-3.5 h-3.5 text-[#D98880]" />
                  <span className="font-semibold text-sm">{weather.temp_high_c}°C</span>
                  <span className="text-[11px] text-[#8C8279]">/ {weather.temp_high_f}°F</span>
                  <span className="text-[11px] text-[#8C8279] ml-1">(Low {weather.temp_low_c}°C / {weather.temp_low_f}°F)</span>
                </div>
                {weather.humidity_pct && (
                  <div className="flex items-center gap-1 text-[#8C8279] text-[11px]">
                    <Droplets className="w-3 h-3 text-[#73836F]" />
                    <span>{weather.humidity_pct}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mindful Packing & Clothing Tip */}
            {weather.clothing_tip && (
              <div className="mt-2.5 pt-2.5 border-t border-[#F4EFE6] flex items-center gap-2 text-xs text-[#73836F]">
                <Shirt className="w-3.5 h-3.5 shrink-0 text-[#8A9A86]" />
                <span className="text-[11px] text-[#556B52]">
                  <strong>Attire & Comfort Tip:</strong> {weather.clothing_tip}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timeline Items */}
        <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#DED9D0]">
          {activeDay.agenda.map((item, idx) => {
            const timeSlots = ['Morning Awakening', 'Gentle Afternoon', 'Golden Hour & Sunset', 'Peaceful Evening', 'Night Rest'];
            const slotName = timeSlots[idx] || `Part ${idx + 1}`;

            return (
              <div key={idx} className="relative group">
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
