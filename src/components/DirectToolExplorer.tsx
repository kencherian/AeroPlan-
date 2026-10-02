import React, { useState } from 'react';
import { Plane, Building, Sun, Search, CloudSun, Shirt, Thermometer, Droplets } from 'lucide-react';
import { FlightOption, HotelOption, DailyWeatherForecast } from '../types.ts';

export const DirectToolExplorer: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'flights' | 'hotels' | 'weather'>('flights');

  // Flight Tool State
  const [flightOrigin, setFlightOrigin] = useState('SFO');
  const [flightDest, setFlightDest] = useState('HND');
  const [flightDep, setFlightDep] = useState('2026-10-15');
  const [flightRet, setFlightRet] = useState('2026-10-20');
  const [flightResults, setFlightResults] = useState<FlightOption[]>([]);
  const [flightLoading, setFlightLoading] = useState(false);

  // Hotel Tool State
  const [hotelCity, setHotelCity] = useState('Tokyo');
  const [hotelCheckIn, setHotelCheckIn] = useState('2026-10-15');
  const [hotelCheckOut, setHotelCheckOut] = useState('2026-10-20');
  const [hotelCeiling, setHotelCeiling] = useState<number>(250);
  const [hotelResults, setHotelResults] = useState<HotelOption[]>([]);
  const [hotelMsg, setHotelMsg] = useState<string>('');
  const [hotelLoading, setHotelLoading] = useState(false);

  // Weather Tool State
  const [weatherCity, setWeatherCity] = useState('Tokyo');
  const [weatherStart, setWeatherStart] = useState('2026-10-15');
  const [weatherEnd, setWeatherEnd] = useState('2026-10-20');
  const [weatherResults, setWeatherResults] = useState<Array<{ date: string; day_number: number; weather: DailyWeatherForecast }>>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const runFlightSearch = async () => {
    setFlightLoading(true);
    try {
      const res = await fetch('/api/tools/search_flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: flightOrigin,
          destination: flightDest,
          departure_date: flightDep,
          return_date: flightRet,
        }),
      });
      const data = await res.json();
      if (data.flights) {
        setFlightResults(data.flights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFlightLoading(false);
    }
  };

  const runHotelSearch = async () => {
    setHotelLoading(true);
    setHotelMsg('');
    try {
      const res = await fetch('/api/tools/search_hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: hotelCity,
          check_in: hotelCheckIn,
          check_out: hotelCheckOut,
          max_price_per_night: Number(hotelCeiling),
        }),
      });
      const data = await res.json();
      if (data.hotels) {
        setHotelResults(data.hotels);
      }
      if (data.message) {
        setHotelMsg(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHotelLoading(false);
    }
  };

  const runWeatherSearch = async () => {
    setWeatherLoading(true);
    try {
      const res = await fetch('/api/tools/get_weather_forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: weatherCity,
          start_date: weatherStart,
          end_date: weatherEnd,
        }),
      });
      const data = await res.json();
      if (data.forecasts) {
        setWeatherResults(data.forecasts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
      {/* Sub Header / Tabs */}
      <div className="px-6 py-4 border-b border-[#EFECE6] bg-[#FDFCF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Gentle Travel Tools Sandbox
          </h3>
          <p className="text-xs text-[#8C8279] mt-0.5">
            Query live airline pricing, hotel availability, and atmospheric weather forecasts independently.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F7F4EF] p-1 rounded-xl border border-[#EFECE6]">
          <button
            onClick={() => setActiveTool('flights')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTool === 'flights' ? 'bg-white text-[#3E3832] shadow-xs font-semibold' : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            <Plane className="w-3.5 h-3.5 rotate-45 text-[#8A9A86]" />
            search_flights
          </button>
          <button
            onClick={() => setActiveTool('hotels')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTool === 'hotels' ? 'bg-white text-[#3E3832] shadow-xs font-semibold' : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#D98880]" />
            search_hotels
          </button>
          <button
            onClick={() => setActiveTool('weather')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTool === 'weather' ? 'bg-white text-[#3E3832] shadow-xs font-semibold' : 'text-[#8C8279] hover:text-[#3E3832]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#D98880]" />
            get_weather_forecast
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTool === 'flights' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">origin (3-letter)</label>
                <input
                  type="text"
                  value={flightOrigin}
                  onChange={(e) => setFlightOrigin(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">destination (3-letter)</label>
                <input
                  type="text"
                  value={flightDest}
                  onChange={(e) => setFlightDest(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">departure_date</label>
                <input
                  type="date"
                  value={flightDep}
                  onChange={(e) => setFlightDep(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">return_date</label>
                <input
                  type="date"
                  value={flightRet}
                  onChange={(e) => setFlightRet(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runFlightSearch}
                  disabled={flightLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#7E907B] hover:bg-[#72836F] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Check Flights
                </button>
              </div>
            </div>

            {flightResults.length > 0 && (
              <div className="space-y-2.5 mt-4">
                <div className="text-xs font-semibold text-[#8C8279] font-mono">
                  Live Options ({flightResults.length} Flights Available):
                </div>
                {flightResults.map((f) => (
                  <div
                    key={f.pnr}
                    className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3E3832]">{f.airline}</span>
                        <span className="text-[11px] font-mono text-[#73836F]">{f.flight_number}</span>
                        <span className="text-[10px] font-mono text-[#8C8279]">PNR: {f.pnr}</span>
                      </div>
                      <div className="text-xs text-[#8C8279] mt-1 font-mono">
                        {f.departure_time} → {f.arrival_time} · {f.duration} · {f.stops}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-[#3E3832] tabular-nums">
                        ${f.price} USD
                      </div>
                      <span className="text-[10px] text-[#8C8279] block capitalize">{f.tier.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTool === 'hotels' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">city</label>
                <input
                  type="text"
                  value={hotelCity}
                  onChange={(e) => setHotelCity(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">check_in</label>
                <input
                  type="date"
                  value={hotelCheckIn}
                  onChange={(e) => setHotelCheckIn(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">check_out</label>
                <input
                  type="date"
                  value={hotelCheckOut}
                  onChange={(e) => setHotelCheckOut(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">max_price_per_night ($)</label>
                <input
                  type="number"
                  value={hotelCeiling}
                  onChange={(e) => setHotelCeiling(Number(e.target.value))}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runHotelSearch}
                  disabled={hotelLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#C4736B] hover:bg-[#B7655D] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Check Hotels
                </button>
              </div>
            </div>

            {hotelMsg && (
              <div className="p-3.5 bg-[#FAF4F0] border border-[#ECD9D4] rounded-xl text-xs text-[#C4736B] font-mono mb-4">
                {hotelMsg}
              </div>
            )}

            {hotelResults.length > 0 && (
              <div className="space-y-2.5 mt-4">
                <div className="text-xs font-semibold text-[#8C8279] font-mono">
                  Lodging Options ({hotelResults.length} properties within ceiling):
                </div>
                {hotelResults.map((h) => (
                  <div
                    key={h.id}
                    className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3E3832]">{h.name}</span>
                        <span className="text-[10px] text-[#C4736B] font-mono">{'★'.repeat(h.stars)}</span>
                        <span className="text-[10px] font-mono text-[#8C8279]">Rating: {h.rating}/5.0</span>
                      </div>
                      <div className="text-xs text-[#8C8279] mt-1">
                        {h.address} · {h.amenities.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-[#3E3832] tabular-nums">
                        ${h.price_per_night} / night
                      </div>
                      <span className="text-[10px] text-[#8C8279] block font-mono">
                        ${h.total_cost} total ({h.nights} nights)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTool === 'weather' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">city</label>
                <input
                  type="text"
                  value={weatherCity}
                  onChange={(e) => setWeatherCity(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">start_date</label>
                <input
                  type="date"
                  value={weatherStart}
                  onChange={(e) => setWeatherStart(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8C8279] mb-1">end_date</label>
                <input
                  type="date"
                  value={weatherEnd}
                  onChange={(e) => setWeatherEnd(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-mono text-[#3E3832] focus:outline-none focus:border-[#8A9A86] focus:bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runWeatherSearch}
                  disabled={weatherLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#D98880] hover:bg-[#C8766E] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Check Weather Forecast
                </button>
              </div>
            </div>

            {weatherResults.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="text-xs font-semibold text-[#8C8279] font-mono">
                  Forecasted Climate for {weatherCity} ({weatherResults.length} Days):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {weatherResults.map((item) => (
                    <div
                      key={item.date}
                      className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#3E3832]">Day {item.day_number}</span>
                          <span className="text-[11px] text-[#8C8279] font-mono">{item.date}</span>
                        </div>
                        <span className="text-xs font-bold font-mono text-[#3E3832]">
                          {item.weather.temp_high_c}°C / {item.weather.temp_high_f}°F
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#73836F] font-medium">
                        <Sun className="w-3.5 h-3.5 text-[#D98880]" />
                        <span>{item.weather.condition}</span>
                        <span className="text-[10px] text-[#8C8279] font-normal ml-auto">
                          Low: {item.weather.temp_low_c}°C ({item.weather.temp_low_f}°F)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C8279] leading-relaxed">
                        {item.weather.summary}
                      </p>
                      <div className="pt-2 border-t border-[#E8E4DC] flex items-center gap-1.5 text-[11px] text-[#556B52]">
                        <Shirt className="w-3.5 h-3.5 text-[#8A9A86] shrink-0" />
                        <span>Tip: {item.weather.clothing_tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
