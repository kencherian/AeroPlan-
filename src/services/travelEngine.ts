import { FlightOption, HotelOption, SearchFlightsParams, SearchHotelsParams } from '../types.ts';
import { getCityForIata } from '../data/airports.ts';

// Deterministic seed helper based on string inputs
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Distance approximation for realistic flight pricing
function getApproxDistanceKm(origin: string, dest: string): number {
  const o = origin.toUpperCase();
  const d = dest.toUpperCase();
  if (o === d) return 500;
  
  // Transpacific
  if ((o === 'SFO' || o === 'LAX' || o === 'SEA') && (d === 'HND' || d === 'NRT' || d === 'ICN' || d === 'SIN')) return 8500;
  if ((d === 'SFO' || d === 'LAX' || d === 'SEA') && (o === 'HND' || o === 'NRT' || o === 'ICN' || o === 'SIN')) return 8500;
  
  // Transatlantic
  if ((o === 'JFK' || o === 'BOS' || o === 'ORD') && (d === 'LHR' || d === 'CDG' || d === 'AMS' || d === 'FCO' || d === 'BCN')) return 6000;
  if ((d === 'JFK' || d === 'BOS' || d === 'ORD') && (o === 'LHR' || o === 'CDG' || o === 'AMS' || o === 'FCO' || o === 'BCN')) return 6000;

  // US Domestic
  if (['JFK', 'BOS', 'ORD', 'MIA', 'SFO', 'LAX', 'SEA'].includes(o) && ['JFK', 'BOS', 'ORD', 'MIA', 'SFO', 'LAX', 'SEA'].includes(d)) {
    if ((o === 'ORD' && d === 'MIA') || (o === 'MIA' && d === 'ORD')) return 1900;
    if ((o === 'JFK' && d === 'MIA') || (o === 'MIA' && d === 'JFK')) return 1750;
    if ((o === 'LAX' && d === 'JFK') || (o === 'JFK' && d === 'LAX')) return 3980;
    return 2500;
  }

  return 5500;
}

export function search_flights(params: SearchFlightsParams): {
  success: boolean;
  count: number;
  origin: string;
  destination: string;
  flights: FlightOption[];
} {
  const { origin, destination, departure_date, return_date } = params;
  const o = origin.toUpperCase();
  const d = destination.toUpperCase();
  const dist = getApproxDistanceKm(o, d);
  const baseSeed = hashString(`${o}-${d}-${departure_date}-${return_date}`);

  const originCity = getCityForIata(o);
  const destCity = getCityForIata(d);

  // Determine realistic airlines based on route
  let airlines = [
    { name: 'Delta Air Lines', code: 'DL' },
    { name: 'United Airlines', code: 'UA' },
    { name: 'American Airlines', code: 'AA' },
  ];

  if (d === 'HND' || d === 'NRT' || o === 'HND' || o === 'NRT') {
    airlines = [
      { name: 'ZIPAIR Tokyo (Budget)', code: 'ZG' },
      { name: 'All Nippon Airways (ANA)', code: 'NH' },
      { name: 'Japan Airlines (JAL)', code: 'JL' },
    ];
  } else if (d === 'CDG' || o === 'CDG') {
    airlines = [
      { name: 'French Bee (Budget)', code: 'BF' },
      { name: 'Air France', code: 'AF' },
      { name: 'Delta Air Lines', code: 'DL' },
    ];
  } else if (d === 'LHR' || o === 'LHR') {
    airlines = [
      { name: 'Norse Atlantic (Budget)', code: 'N0' },
      { name: 'British Airways', code: 'BA' },
      { name: 'Virgin Atlantic', code: 'VS' },
    ];
  } else if (d === 'MIA' || o === 'MIA') {
    airlines = [
      { name: 'Spirit Airlines (Budget Saver)', code: 'NK' },
      { name: 'American Airlines', code: 'AA' },
      { name: 'United Airlines', code: 'UA' },
    ];
  }

  // Base pricing based on distance
  // Short haul domestic: $240 - $480
  // Medium transcon: $380 - $750
  // Long haul international: $680 - $1450
  const isDomestic = dist < 4200;
  const saverPrice = Math.round((isDomestic ? 180 + (dist * 0.05) : 480 + (dist * 0.04)) + (baseSeed % 40));
  const standardPrice = Math.round(saverPrice * 1.38 + (baseSeed % 50));
  const flexPrice = Math.round(saverPrice * 1.95 + (baseSeed % 70));

  const flights: FlightOption[] = [
    {
      pnr: `${airlines[0].code}-${Math.floor(1000 + (baseSeed % 8999))}S`,
      airline: airlines[0].name,
      flight_number: `${airlines[0].code} ${Math.floor(100 + (baseSeed % 899))}`,
      origin: o,
      origin_city: originCity,
      destination: d,
      destination_city: destCity,
      departure_date,
      return_date,
      departure_time: '06:15 AM',
      arrival_time: '02:40 PM',
      duration: isDomestic ? '3h 25m' : '11h 15m',
      stops: 'Nonstop',
      tier: 'economy_saver',
      price: saverPrice,
      cabin: 'Economy Saver (Light Bag / Fixed Seat)'
    },
    {
      pnr: `${airlines[1].code}-${Math.floor(2000 + (baseSeed % 7999))}M`,
      airline: airlines[1].name,
      flight_number: `${airlines[1].code} ${Math.floor(200 + (baseSeed % 799))}`,
      origin: o,
      origin_city: originCity,
      destination: d,
      destination_city: destCity,
      departure_date,
      return_date,
      departure_time: '10:45 AM',
      arrival_time: '06:30 PM',
      duration: isDomestic ? '3h 15m' : '10h 50m',
      stops: 'Nonstop',
      tier: 'standard_economy',
      price: standardPrice,
      cabin: 'Standard Main Cabin (Carry-on + Checked Included)'
    },
    {
      pnr: `${airlines[2].code}-${Math.floor(4000 + (baseSeed % 5999))}X`,
      airline: airlines[2].name,
      flight_number: `${airlines[2].code} ${Math.floor(300 + (baseSeed % 699))}`,
      origin: o,
      origin_city: originCity,
      destination: d,
      destination_city: destCity,
      departure_date,
      return_date,
      departure_time: '01:20 PM',
      arrival_time: '09:15 PM',
      duration: isDomestic ? '3h 10m' : '10h 45m',
      stops: 'Nonstop',
      tier: 'premium_flex',
      price: flexPrice,
      cabin: 'Premium Economy Flex (Priority + Lounge Access)'
    }
  ];

  return {
    success: true,
    count: flights.length,
    origin: o,
    destination: d,
    flights
  };
}

export function search_hotels(params: SearchHotelsParams): {
  success: boolean;
  city: string;
  check_in: string;
  check_out: string;
  nights: number;
  max_price_per_night: number;
  available_count: number;
  hotels: HotelOption[];
  cheapest_available_rate?: number;
  message?: string;
} {
  const { city, check_in, check_out, max_price_per_night } = params;
  
  // Calculate nights
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const cleanCity = city.trim();
  const seed = hashString(`${cleanCity.toLowerCase()}-${check_in}-${check_out}`);

  // Base catalog of representative hotels adapted for the given city
  const baseProperties: Array<{
    nameSuffix: string;
    stars: number;
    rating: number;
    baseRate: number;
    tier: 'budget' | 'comfort' | 'boutique' | 'luxury';
    addressTemplate: string;
    amenities: string[];
    image_tag: string;
  }> = [
    {
      nameSuffix: 'Smart Capsule & Pod Inn',
      stars: 2,
      rating: 4.3,
      baseRate: 58,
      tier: 'budget',
      addressTemplate: 'Station District Central',
      amenities: ['Free High-Speed Wi-Fi', 'Luggage Storage', 'Secure Pod Lockers', '24/7 Front Desk'],
      image_tag: 'budget_pod'
    },
    {
      nameSuffix: 'City Express & Suites',
      stars: 3,
      rating: 4.5,
      baseRate: 98,
      tier: 'comfort',
      addressTemplate: 'Downtown Transit Corridor',
      amenities: ['Buffet Breakfast Included', 'High-Speed Wi-Fi', 'Ensuite Bathroom', 'Air Conditioning', 'Elevator'],
      image_tag: 'city_express'
    },
    {
      nameSuffix: 'Boutique Heritage Hotel',
      stars: 4,
      rating: 4.8,
      baseRate: 165,
      tier: 'boutique',
      addressTemplate: 'Historic Arts Quarter',
      amenities: ['Artisanal Breakfast', 'Rooftop Lounge', 'King Bed', 'Concierge Service', 'Designer Toiletries'],
      image_tag: 'boutique_heritage'
    },
    {
      nameSuffix: 'Grand Palace & Spa',
      stars: 5,
      rating: 4.9,
      baseRate: 310,
      tier: 'luxury',
      addressTemplate: 'Prestige Promenade Avenue',
      amenities: ['Full Service Spa', 'Fine Dining Restaurant', 'Chauffeured Pickup', 'Panoramic City Views', 'Marble Bath'],
      image_tag: 'grand_luxury'
    }
  ];

  // Adjust rates based on city tier
  let cityMultiplier = 1.0;
  const lowerCity = cleanCity.toLowerCase();
  if (lowerCity.includes('tokyo') || lowerCity.includes('london') || lowerCity.includes('paris') || lowerCity.includes('new york')) {
    cityMultiplier = 1.25;
  } else if (lowerCity.includes('miami') || lowerCity.includes('san francisco') || lowerCity.includes('singapore')) {
    cityMultiplier = 1.15;
  } else if (lowerCity.includes('bangkok') || lowerCity.includes('berlin')) {
    cityMultiplier = 0.85;
  }

  const allHotels: HotelOption[] = baseProperties.map((prop, idx) => {
    const rate = Math.round(prop.baseRate * cityMultiplier + (seed % 15) - (idx * 3));
    return {
      id: `HTL-${cleanCity.substring(0, 3).toUpperCase()}-${100 + idx}`,
      name: `${cleanCity} ${prop.nameSuffix}`,
      city: cleanCity,
      stars: prop.stars,
      rating: prop.rating,
      review_count: 850 + (seed % 1400) + (idx * 210),
      price_per_night: rate,
      total_cost: rate * nights,
      nights,
      address: `${12 + (idx * 15)} ${prop.addressTemplate}, ${cleanCity}`,
      tier: prop.tier,
      amenities: prop.amenities,
      image_tag: prop.image_tag
    };
  });

  // Filter by maximum allowable per-night rate
  const matchingHotels = allHotels.filter(h => h.price_per_night <= max_price_per_night);
  const cheapestRate = Math.min(...allHotels.map(h => h.price_per_night));

  if (matchingHotels.length === 0) {
    return {
      success: false,
      city: cleanCity,
      check_in,
      check_out,
      nights,
      max_price_per_night,
      available_count: 0,
      hotels: [],
      cheapest_available_rate: cheapestRate,
      message: `No hotels found in ${cleanCity} within the ceiling of $${max_price_per_night}/night. The lowest available rate is $${cheapestRate}/night ($${cheapestRate * nights} for ${nights} nights).`
    };
  }

  // Sort by highest rating within budget
  matchingHotels.sort((a, b) => b.price_per_night - a.price_per_night);

  return {
    success: true,
    city: cleanCity,
    check_in,
    check_out,
    nights,
    max_price_per_night,
    available_count: matchingHotels.length,
    hotels: matchingHotels,
    cheapest_available_rate: cheapestRate
  };
}

export function get_weather_forecast(params: {
  city: string;
  start_date: string;
  end_date: string;
}): {
  success: boolean;
  city: string;
  start_date: string;
  end_date: string;
  forecasts: Array<{
    date: string;
    day_number: number;
    weather: import('../types.ts').DailyWeatherForecast;
  }>;
} {
  const { city, start_date, end_date } = params;
  const cleanCity = city.trim();
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const diffTime = endDate.getTime() - startDate.getTime();
  const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24))) + 1;

  const lowerCity = cleanCity.toLowerCase();
  const seed = hashString(`${lowerCity}-${start_date}-${end_date}`);

  // Base seasonal temperature and condition profiles
  interface CityProfile {
    baseHighC: number;
    baseLowC: number;
    conditions: Array<{
      condition: string;
      icon: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'breeze' | 'clear';
      summary: string;
      clothing_tip: string;
    }>;
  }

  let profile: CityProfile = {
    baseHighC: 20,
    baseLowC: 13,
    conditions: [
      {
        condition: 'Gentle Sunshine',
        icon: 'sunny',
        summary: 'Warm golden sunlight with pleasant daytime warmth.',
        clothing_tip: 'Breathable cotton shirts and a light layer for shade.'
      },
      {
        condition: 'Soft Scattered Clouds',
        icon: 'partly_cloudy',
        summary: 'Comfortable diffused light with calm, mild temperatures.',
        clothing_tip: 'Comfortable walking attire and sunglasses.'
      },
      {
        condition: 'Brisk Fresh Breeze',
        icon: 'breeze',
        summary: 'Crisp, invigorating air with clear visibility across the city.',
        clothing_tip: 'A cozy cardigan or light knit sweater.'
      },
      {
        condition: 'Gentle Passing Mist',
        icon: 'rain',
        summary: 'Brief gentle showers that leave the streets fresh and romantic.',
        clothing_tip: 'A lightweight water-resistant jacket or compact umbrella.'
      }
    ]
  };

  if (lowerCity.includes('tokyo')) {
    profile = {
      baseHighC: 21,
      baseLowC: 14,
      conditions: [
        {
          condition: 'Crisp Autumn Sun',
          icon: 'sunny',
          summary: 'Brilliant blue skies and mild gentle warmth over gardens.',
          clothing_tip: 'Light layers, comfortable slip-on walking shoes for temples.'
        },
        {
          condition: 'Mellow Twilight Skies',
          icon: 'partly_cloudy',
          summary: 'Soft cloud cover and pleasant evening breeze in the alleyways.',
          clothing_tip: 'A soft scarf and cozy cardigan for evening izakaya visits.'
        },
        {
          condition: 'Refreshing Seasonal Breeze',
          icon: 'breeze',
          summary: 'Clear air with distant glimpses of mountains.',
          clothing_tip: 'Light jacket and comfortable daypack.'
        },
        {
          condition: 'Delicate Garden Rain',
          icon: 'rain',
          summary: 'Atmospheric light mist enhancing the moss gardens and lantern glow.',
          clothing_tip: 'Compact umbrella and water-resistant footwear.'
        }
      ]
    };
  } else if (lowerCity.includes('paris')) {
    profile = {
      baseHighC: 18,
      baseLowC: 10,
      conditions: [
        {
          condition: 'Golden Parisian Light',
          icon: 'partly_cloudy',
          summary: 'Romantic diffused sunlight warming the stone boulevards.',
          clothing_tip: 'Classic trench coat or woolen blazer with comfortable loafers.'
        },
        {
          condition: 'Brisk Seine Breeze',
          icon: 'breeze',
          summary: 'Cool riverside air ideal for gallery visits and warm cafés.',
          clothing_tip: 'A cozy cashmere scarf and layered knit.'
        },
        {
          condition: 'Soft Autumn Sun',
          icon: 'sunny',
          summary: 'Clear afternoon light over Luxembourg Gardens.',
          clothing_tip: 'Light sweater and sunglasses for terrace seating.'
        },
        {
          condition: 'Gentle Cobblestone Drizzle',
          icon: 'rain',
          summary: 'Quiet raindrops dancing on zinc rooftops.',
          clothing_tip: 'Chic umbrella and waterproof coat.'
        }
      ]
    };
  } else if (lowerCity.includes('miami')) {
    profile = {
      baseHighC: 28,
      baseLowC: 22,
      conditions: [
        {
          condition: 'Warm Ocean Sun',
          icon: 'sunny',
          summary: 'Balmy tropical sunshine with gentle Atlantic trade winds.',
          clothing_tip: 'Linen shirts, polarized sunglasses, and breathable resort wear.'
        },
        {
          condition: 'Pleasant Coastal Breeze',
          icon: 'breeze',
          summary: 'Refreshing ocean air sweeping past the palm trees.',
          clothing_tip: 'Light cotton shorts and comfortable sandals.'
        },
        {
          condition: 'Sunlit Tropical Clouds',
          icon: 'partly_cloudy',
          summary: 'Warm dappled sunlight with warm, soothing evening temperatures.',
          clothing_tip: 'Sun hat, light cotton layers, and beach tote.'
        }
      ]
    };
  } else if (lowerCity.includes('london')) {
    profile = {
      baseHighC: 16,
      baseLowC: 9,
      conditions: [
        {
          condition: 'Overcast & Atmospheric',
          icon: 'cloudy',
          summary: 'Classic moody skies perfect for museum mornings and tea.',
          clothing_tip: 'Layered wool knit, tailored coat, and sturdy walking shoes.'
        },
        {
          condition: 'Gentle Sunlight Breaks',
          icon: 'partly_cloudy',
          summary: 'Warm sun patches illuminating the royal parks.',
          clothing_tip: 'Light jacket and comfortable scarf.'
        },
        {
          condition: 'Soft English Drizzle',
          icon: 'rain',
          summary: 'Quiet mist across historic mews and garden squares.',
          clothing_tip: 'Waxed jacket or trench with umbrella.'
        }
      ]
    };
  }

  const forecasts: Array<{
    date: string;
    day_number: number;
    weather: import('../types.ts').DailyWeatherForecast;
  }> = [];

  for (let d = 0; d < totalDays; d++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];

    const daySeed = (seed + d * 31) % profile.conditions.length;
    const cond = profile.conditions[daySeed];

    const tempOffset = ((seed + d * 13) % 5) - 2;
    const highC = profile.baseHighC + tempOffset;
    const lowC = profile.baseLowC + tempOffset;

    const highF = Math.round((highC * 9) / 5 + 32);
    const lowF = Math.round((lowC * 9) / 5 + 32);

    const humidity = 55 + ((seed + d * 7) % 30);

    forecasts.push({
      date: dateStr,
      day_number: d + 1,
      weather: {
        condition: cond.condition,
        temp_high_c: highC,
        temp_low_c: lowC,
        temp_high_f: highF,
        temp_low_f: lowF,
        icon: cond.icon,
        summary: cond.summary,
        clothing_tip: cond.clothing_tip,
        humidity_pct: humidity,
      }
    });
  }

  return {
    success: true,
    city: cleanCity,
    start_date,
    end_date,
    forecasts,
  };
}
