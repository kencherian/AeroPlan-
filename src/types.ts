export interface FlightOption {
  pnr: string;
  airline: string;
  flight_number: string;
  origin: string;
  origin_city: string;
  destination: string;
  destination_city: string;
  departure_date: string;
  return_date: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops: 'Nonstop' | '1 Stop';
  tier: 'economy_saver' | 'standard_economy' | 'premium_flex';
  price: number;
  cabin: string;
}

export interface HotelOption {
  id: string;
  name: string;
  city: string;
  stars: number;
  rating: number;
  review_count: number;
  price_per_night: number;
  total_cost: number;
  nights: number;
  address: string;
  tier: 'budget' | 'comfort' | 'boutique' | 'luxury';
  amenities: string[];
  image_tag: string;
}

export interface SearchFlightsParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
}

export interface SearchHotelsParams {
  city: string;
  check_in: string;
  check_out: string;
  max_price_per_night: number;
}

export interface Financials {
  total_budget: number;
  total_spent: number;
  remaining_funds: number;
}

export interface Bookings {
  flight_pnr: string;
  flight_cost: number;
  hotel_name: string;
  hotel_total_cost: number;
}

export interface DailyItineraryDay {
  day_number: number;
  date: string;
  agenda: string[];
}

export interface AgentPlanOutput {
  status: 'success' | 'error';
  error_message?: string;
  financials: Financials;
  bookings?: Bookings;
  daily_itinerary?: DailyItineraryDay[];
}

export type AgentStepType = 
  | 'constraint_parsing'
  | 'flight_search'
  | 'budget_deduction'
  | 'hotel_search'
  | 'agentic_reflection'
  | 'plan_compilation'
  | 'failure_deficit';

export interface AgentTraceStep {
  id: string;
  timestamp: string;
  type: AgentStepType;
  title: string;
  description: string;
  details?: {
    tool_name?: string;
    params?: Record<string, any>;
    result_summary?: string;
    budget_math?: {
      total_budget: number;
      flight_cost: number;
      remaining_for_hotel: number;
      nights: number;
      max_nightly_ceiling: number;
      hotel_total_cost?: number;
      total_spent?: number;
      net_balance?: number;
    };
    reflection_notes?: string[];
    is_correction?: boolean;
    attempt_number?: number;
  };
  status: 'pending' | 'active' | 'completed' | 'warning' | 'error';
}

export interface AgentExecutionRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  totalBudget: number;
}

export interface AgentExecutionResult {
  output: AgentPlanOutput;
  traces: AgentTraceStep[];
  executionTimeMs: number;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  origin: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  returnDate: string;
  budget: number;
  expectedOutcome: 'feasible' | 'triggers_reflection' | 'fails_budget_deficit';
  description: string;
}
