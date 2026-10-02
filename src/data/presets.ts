import { PresetScenario } from '../types.ts';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'tokyo-balanced',
    title: 'Tokyo Spring Adventure',
    subtitle: 'SFO → HND · 5 Days · $2,200 Budget',
    origin: 'SFO',
    destination: 'HND',
    destinationCity: 'Tokyo',
    departureDate: '2026-10-15',
    returnDate: '2026-10-20',
    budget: 2200,
    expectedOutcome: 'feasible',
    description: 'Ample budget allowing comfortable standard flights and prime central hotel in Shinjuku.'
  },
  {
    id: 'paris-reflection-test',
    title: 'Paris Autumn Getaway',
    subtitle: 'JFK → CDG · 4 Days · $1,550 Budget',
    origin: 'JFK',
    destination: 'CDG',
    destinationCity: 'Paris',
    departureDate: '2026-10-22',
    returnDate: '2026-10-26',
    budget: 1550,
    expectedOutcome: 'triggers_reflection',
    description: 'Tight budget triggers agentic self-correction: rejects standard airline fare to secure Saver flight and lower nightly hotel rate.'
  },
  {
    id: 'miami-weekend',
    title: 'Miami Coastal Break',
    subtitle: 'ORD → MIA · 3 Days · $850 Budget',
    origin: 'ORD',
    destination: 'MIA',
    destinationCity: 'Miami',
    departureDate: '2026-11-05',
    returnDate: '2026-11-08',
    budget: 850,
    expectedOutcome: 'feasible',
    description: 'Domestic weekend getaway balancing nonstop flight and beachfront boutique stay.'
  },
  {
    id: 'impossible-deficit-test',
    title: 'Deficit Stress Test (London)',
    subtitle: 'LAX → LHR · 6 Days · $450 Budget',
    origin: 'LAX',
    destination: 'LHR',
    destinationCity: 'London',
    departureDate: '2026-11-12',
    returnDate: '2026-11-18',
    budget: 450,
    expectedOutcome: 'fails_budget_deficit',
    description: 'Mathematically unviable scenario testing the agentic failure state: outputting status: "error" and detailed deficit analysis.'
  }
];
