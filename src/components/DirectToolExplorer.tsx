import React, { useState } from 'react';
import { Plane, Building, Search, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { FlightOption, HotelOption } from '../types.ts';

export const DirectToolExplorer: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'flights' | 'hotels'>('flights');

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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Sub Header / Tabs */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Function Calling & Tool Sandbox
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Query the underlying flight and hotel engines directly to simulate individual agent steps.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTool('flights')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTool === 'flights' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane className="w-3.5 h-3.5 rotate-45" />
            Tool 1: search_flights
          </button>
          <button
            onClick={() => setActiveTool('hotels')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTool === 'hotels' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Tool 2: search_hotels
          </button>
        </div>
      </div>

      <div className="p-5">
        {activeTool === 'flights' ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">origin (3-letter)</label>
                <input
                  type="text"
                  value={flightOrigin}
                  onChange={(e) => setFlightOrigin(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">destination (3-letter)</label>
                <input
                  type="text"
                  value={flightDest}
                  onChange={(e) => setFlightDest(e.target.value.toUpperCase().slice(0, 3))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">departure_date</label>
                <input
                  type="date"
                  value={flightDep}
                  onChange={(e) => setFlightDep(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">return_date</label>
                <input
                  type="date"
                  value={flightRet}
                  onChange={(e) => setFlightRet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runFlightSearch}
                  disabled={flightLoading}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Execute Tool
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {flightResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="text-xs font-semibold text-slate-400 font-mono">
                  Live API Output ({flightResults.length} Flights Available):
                </div>
                {flightResults.map((f) => (
                  <div
                    key={f.pnr}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{f.airline}</span>
                        <span className="text-[11px] font-mono text-indigo-400">{f.flight_number}</span>
                        <span className="text-[10px] font-mono text-slate-500">PNR: {f.pnr}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        {f.departure_time} → {f.arrival_time} · {f.duration} · {f.stops}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-indigo-300 tabular-nums">
                        ${f.price} USD
                      </div>
                      <span className="text-[10px] text-slate-500 block capitalize">{f.tier.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">city</label>
                <input
                  type="text"
                  value={hotelCity}
                  onChange={(e) => setHotelCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">check_in</label>
                <input
                  type="date"
                  value={hotelCheckIn}
                  onChange={(e) => setHotelCheckIn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">check_out</label>
                <input
                  type="date"
                  value={hotelCheckOut}
                  onChange={(e) => setHotelCheckOut(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">max_price_per_night ($)</label>
                <input
                  type="number"
                  value={hotelCeiling}
                  onChange={(e) => setHotelCeiling(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runHotelSearch}
                  disabled={hotelLoading}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Execute Tool
                </button>
              </div>
            </div>

            {hotelMsg && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs text-amber-300 font-mono mb-3">
                {hotelMsg}
              </div>
            )}

            {/* Results Grid */}
            {hotelResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="text-xs font-semibold text-slate-400 font-mono">
                  Live API Output ({hotelResults.length} Hotels under ${hotelCeiling}/night ceiling):
                </div>
                {hotelResults.map((h) => (
                  <div
                    key={h.id}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{h.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono">{'★'.repeat(h.stars)}</span>
                        <span className="text-[10px] font-mono text-slate-500">Rating: {h.rating}/5.0</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {h.address} · {h.amenities.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-teal-300 tabular-nums">
                        ${h.price_per_night} / night
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        ${h.total_cost} total ({h.nights} nights)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
