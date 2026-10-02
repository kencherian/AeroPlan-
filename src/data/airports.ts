export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
  { iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States' },
  { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
  { iata: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States' },
  { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States' },
  { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
  { iata: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan' },
  { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
  { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
  { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates' },
  { iata: 'FCO', name: 'Rome Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy' },
  { iata: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain' },
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
  { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States' },
  { iata: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States' },
  { iata: 'ICN', name: 'Seoul Incheon International', city: 'Seoul', country: 'South Korea' },
  { iata: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
];

export function getAirportByIata(iata: string): Airport | undefined {
  return AIRPORTS.find(a => a.iata.toUpperCase() === iata.toUpperCase());
}

export function getCityForIata(iata: string): string {
  const airport = getAirportByIata(iata);
  return airport ? airport.city : iata;
}
