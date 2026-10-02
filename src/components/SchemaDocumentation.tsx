import React from 'react';
import { Code2, Feather, Heart, Sun } from 'lucide-react';

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
          },
          "weather": {
            "type": "object",
            "properties": {
              "condition": { "type": "string" },
              "temp_high_c": { "type": "number" },
              "temp_low_c": { "type": "number" },
              "temp_high_f": { "type": "number" },
              "temp_low_f": { "type": "number" },
              "icon": { "type": "string" },
              "summary": { "type": "string" },
              "clothing_tip": { "type": "string" },
              "humidity_pct": { "type": "number" }
            }
          }
        }
      }
    }
  },
  "required": ["status", "financials"]
}`;

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Feather className="w-4 h-4 text-[#73836F]" />
          <h3 className="text-sm font-semibold text-[#3E3832]">
            Programmatic Tools & Structured JSON Contract
          </h3>
        </div>
        <p className="text-xs text-[#8C8279]">
          Our gentle companion queries real-time travel APIs—including flights, lodging, and atmospheric weather forecasts—and delivers strictly structured results for your peace of mind.
        </p>
      </div>

      {/* Tools Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tool 1 */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#73836F]">Tool 1: search_flights</span>
            <span className="text-[10px] font-mono text-[#8C8279]">Airlines</span>
          </div>
          <p className="text-xs text-[#8C8279] mb-3">Queries live airline pricing and availability with care.</p>
          <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-lg border border-[#EFECE6]">
            <div><span className="text-[#3E3832]">origin</span> <span className="text-[#8C8279]">(string)</span>: 3-letter IATA</div>
            <div><span className="text-[#3E3832]">destination</span> <span className="text-[#8C8279]">(string)</span>: 3-letter IATA</div>
            <div><span className="text-[#3E3832]">departure_date</span> <span className="text-[#8C8279]">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-[#3E3832]">return_date</span> <span className="text-[#8C8279]">(string)</span>: YYYY-MM-DD</div>
          </div>
        </div>

        {/* Tool 2 */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#C4736B]">Tool 2: search_hotels</span>
            <span className="text-[10px] font-mono text-[#8C8279]">Lodgings</span>
          </div>
          <p className="text-xs text-[#8C8279] mb-3">Queries live hotel availability within your comfortable nightly ceiling.</p>
          <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-lg border border-[#EFECE6]">
            <div><span className="text-[#3E3832]">city</span> <span className="text-[#8C8279]">(string)</span>: City name</div>
            <div><span className="text-[#3E3832]">check_in</span> <span className="text-[#8C8279]">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-[#3E3832]">check_out</span> <span className="text-[#8C8279]">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-[#3E3832]">max_price_per_night</span> <span className="text-[#8C8279]">(number)</span>: USD</div>
          </div>
        </div>

        {/* Tool 3 */}
        <div className="bg-[#F9F6F0] border border-[#EFECE6] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#D98880]">Tool 3: get_weather_forecast</span>
            <span className="text-[10px] font-mono text-[#8C8279]">Climate</span>
          </div>
          <p className="text-xs text-[#8C8279] mb-3">Queries destination weather forecasts, temperature, and packing tips.</p>
          <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-lg border border-[#EFECE6]">
            <div><span className="text-[#3E3832]">city</span> <span className="text-[#8C8279]">(string)</span>: Destination city</div>
            <div><span className="text-[#3E3832]">start_date</span> <span className="text-[#8C8279]">(string)</span>: YYYY-MM-DD</div>
            <div><span className="text-[#3E3832]">end_date</span> <span className="text-[#8C8279]">(string)</span>: YYYY-MM-DD</div>
          </div>
        </div>
      </div>

      {/* JSON Schema */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#3E3832]">Strict Programmatic Schema Contract</span>
          <span className="text-[10px] font-mono text-[#556B52]">Response MIME: application/json</span>
        </div>
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EFECE6] font-mono text-xs text-[#3E3832] overflow-x-auto leading-relaxed">
          <pre>{schemaCode}</pre>
        </div>
      </div>
    </div>
  );
};
