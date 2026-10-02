export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export const AIRPORTS: Airport[] = [
  { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781 },
  { iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States', lat: 37.6213, lng: -122.3790 },
  { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States', lat: 33.9416, lng: -118.4085 },
  { iata: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States', lat: 41.9742, lng: -87.9073 },
  { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States', lat: 25.7959, lng: -80.2870 },
  { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798 },
  { iata: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929 },
  { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543 },
  { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lng: 55.3657 },
  { iata: 'FCO', name: 'Rome Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389 },
  { iata: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', lat: 41.2974, lng: 2.0833 },
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683 },
  { iata: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany', lat: 52.3667, lng: 13.5033 },
  { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753 },
  { iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States', lat: 47.4502, lng: -122.3088 },
  { iata: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States', lat: 42.3656, lng: -71.0096 },
  { iata: 'ICN', name: 'Seoul Incheon International', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407 },
  { iata: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
];

export function getAirportByIata(iata: string): Airport | undefined {
  return AIRPORTS.find(a => a.iata.toUpperCase() === iata.toUpperCase());
}

export function getCoordinatesForIata(iata: string): [number, number] {
  const airport = getAirportByIata(iata);
  if (airport) {
    return [airport.lng, airport.lat];
  }
  // Deterministic fallback for unlisted IATA codes
  let hash = 0;
  for (let i = 0; i < iata.length; i++) {
    hash = (hash << 5) - hash + iata.charCodeAt(i);
  }
  const lng = ((Math.abs(hash * 37) % 360) - 180);
  const lat = ((Math.abs(hash * 19) % 120) - 50);
  return [lng, lat];
}

export function getCityForIata(iata: string): string {
  const airport = getAirportByIata(iata);
  return airport ? airport.city : iata;
}

