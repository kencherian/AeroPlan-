import React from 'react';
import { Code2, Braces, Sparkles, CheckCircle, Terminal } from 'lucide-react';

export const SchemaDocumentation: React.FC = () => {
  const schemaCode = `{
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["success", "error"] },
    "error_message": { "type": "string" },
    "financials": {
      "type": "object",
      "properties": {
        "total_budget": { "type": "number" },
        "total_spent": { "type": "number" },
        "remaining_funds": { "type": "number" }
      }
    },
    "bookings": {
      "type": "object",
      "properties": {
        "flight_pnr": { "type": "string" },
        "flight_cost": { "type": "number" },
        "hotel_name": { "type": "string" },
        "hotel_total_cost": { "type": "number" }
      }
    },
    "daily_itinerary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "day_number": { "type": "integer" },
          "date": { "type": "string" },
          "agenda": { 
            "type": "array", 
            "items": { "type": "string" } 
          }
        }
      }
    }
  },
  "required": ["status", "financials"]
}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Agentic Function Declarations & Structured JSON Schema
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          The autonomous agent utilizes these function declarations to pull live flight and hotel data and outputs strictly adhering to the schema.
        </p>
      </div>

      {/* Tools Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool 1 */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-indigo-300">Tool 1: search_flights</span>
            <span className="text-[10px] font-mono text-slate-500">Live Airline API</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Queries live airline pricing and availability.</p>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
            <div><span className="text-slate-300">origin</span> <span className="text-slate-500">(string)</span>: 3-letter IATA code</div>
            <div><span className="text-slate-300">destination</span> <span className="text-slate-500">(string)</span>: 3-letter IATA code</div>
            <div><span className="text-slate-300">departure_date</span> <span className="text-slate-500">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-slate-300">return_date</span> <span className="text-slate-500">(string)</span>: YYYY-MM-DD</div>
          </div>
        </div>

        {/* Tool 2 */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-teal-300">Tool 2: search_hotels</span>
            <span className="text-[10px] font-mono text-slate-500">Live Hotel API</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Queries live hotel pricing and availability for a specific city.</p>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
            <div><span className="text-slate-300">city</span> <span className="text-slate-500">(string)</span>: Destination city name</div>
            <div><span className="text-slate-300">check_in</span> <span className="text-slate-500">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-slate-300">check_out</span> <span className="text-slate-500">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-slate-300">max_price_per_night</span> <span className="text-slate-500">(number)</span>: Maximum allowable nightly rate in USD</div>
          </div>
        </div>
      </div>

      {/* JSON Schema */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Enforced Structured Output Schema</span>
          <span className="text-[10px] font-mono text-emerald-400">Response MIME: application/json</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{schemaCode}</pre>
        </div>
      </div>
    </div>
  );
};
