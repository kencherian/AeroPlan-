import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { AgentPlanOutput, AgentTraceStep, SearchFlightsParams, SearchHotelsParams, DailyItineraryDay } from '../types.ts';
import { search_flights, search_hotels, get_weather_forecast } from './travelEngine.ts';
import { getCityForIata } from '../data/airports.ts';

// Tools definition according to exact specifications
const searchFlightsTool: FunctionDeclaration = {
  name: 'search_flights',
  description: 'Queries live airline pricing and availability.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      origin: {
        type: Type.STRING,
        description: '3-letter IATA code.',
      },
      destination: {
        type: Type.STRING,
        description: '3-letter IATA code.',
      },
      departure_date: {
        type: Type.STRING,
        description: 'YYYY-MM-DD.',
      },
      return_date: {
        type: Type.STRING,
        description: 'YYYY-MM-DD.',
      },
    },
    required: ['origin', 'destination', 'departure_date', 'return_date'],
  },
};

const searchHotelsTool: FunctionDeclaration = {
  name: 'search_hotels',
  description: 'Queries live hotel pricing and availability for a specific city.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: {
        type: Type.STRING,
        description: 'Destination city name.',
      },
      check_in: {
        type: Type.STRING,
        description: 'YYYY-MM-DD.',
      },
      check_out: {
        type: Type.STRING,
        description: 'YYYY-MM-DD.',
      },
      max_price_per_night: {
        type: Type.NUMBER,
        description: 'Maximum allowable nightly rate in USD.',
      },
    },
    required: ['city', 'check_in', 'check_out', 'max_price_per_night'],
  },
};

const getWeatherForecastTool: FunctionDeclaration = {
  name: 'get_weather_forecast',
  description: 'Queries live weather forecast and atmospheric conditions for the destination city during travel dates.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: {
        type: Type.STRING,
        description: 'Destination city name.',
      },
      start_date: {
        type: Type.STRING,
        description: 'Departure/start date (YYYY-MM-DD).',
      },
      end_date: {
        type: Type.STRING,
        description: 'Return/end date (YYYY-MM-DD).',
      },
    },
    required: ['city', 'start_date', 'end_date'],
  },
};

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

export async function runAutonomousTravelPlanner(req: AgentExecutionRequest): Promise<AgentExecutionResult> {
  const startTime = Date.now();
  const traces: AgentTraceStep[] = [];
  const addTrace = (step: Omit<AgentTraceStep, 'id' | 'timestamp'>) => {
    traces.push({
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...step,
    });
  };

  const origin = req.origin.trim().toUpperCase();
  const destination = req.destination.trim().toUpperCase();
  const departureDate = req.departureDate;
  const returnDate = req.returnDate;
  const totalBudget = Number(req.totalBudget);

  const destCity = getCityForIata(destination);
  const checkIn = departureDate;
  const checkOut = returnDate;

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  // STEP 1: Thoughtful Listening
  addTrace({
    type: 'constraint_parsing',
    title: '1. Thoughtful Listening & Welcoming Your Journey',
    description: `Gently noting your travel wishes: from ${origin} to ${destCity} (${destination}), across ${departureDate} to ${returnDate} (${nights} peaceful nights). Our cozy spending goal together is $${totalBudget.toLocaleString()} USD.`,
    details: {
      params: { origin, destination, departureDate, returnDate, totalBudget, nights, destCity },
      budget_math: {
        total_budget: totalBudget,
        flight_cost: 0,
        remaining_for_hotel: totalBudget,
        nights,
        max_nightly_ceiling: Math.floor(totalBudget / nights),
      }
    },
    status: 'completed',
  });

  // STEP 2: Exploring Flights with Care
  addTrace({
    type: 'flight_search',
    title: '2. Exploring Flights with Care: search_flights',
    description: `Quietly checking gentle, reliable flight paths from ${origin} to ${destination} for ${departureDate} to ${returnDate}...`,
    details: {
      tool_name: 'search_flights',
      params: { origin, destination, departure_date: departureDate, return_date: returnDate },
    },
    status: 'active',
  });

  const flightResult = search_flights({
    origin,
    destination,
    departure_date: departureDate,
    return_date: returnDate,
  });

  if (!flightResult.success || flightResult.flights.length === 0) {
    const deficitMsg = `We gently checked all airline routes between ${origin} and ${destination}, but none are currently running on your chosen dates.`;
    addTrace({
      type: 'failure_deficit',
      title: 'Gentle Notice: Route Unavailable',
      description: deficitMsg,
      status: 'error',
    });
    return {
      output: {
        status: 'error',
        error_message: deficitMsg,
        financials: { total_budget: totalBudget, total_spent: 0, remaining_funds: totalBudget },
      },
      traces,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Evaluate candidate flights in order of preference (Standard preferred first if budget permits, else Saver)
  let selectedFlight = flightResult.flights.find(f => f.tier === 'standard_economy') || flightResult.flights[0];
  let attemptNumber = 1;

  let viableFound = false;
  let finalFlight = selectedFlight;
  let finalHotel: any = null;
  let finalRemaining = 0;
  let finalSpent = 0;

  const flightsToTry = [
    flightResult.flights.find(f => f.tier === 'standard_economy'),
    flightResult.flights.find(f => f.tier === 'economy_saver'),
  ].filter(Boolean);

  for (const candidateFlight of flightsToTry) {
    if (!candidateFlight) continue;

    // Check if flight alone exceeds or matches budget
    if (candidateFlight.price >= totalBudget) {
      addTrace({
        type: 'agentic_reflection',
        title: `Calm Reflection & Mindful Adjusting (Step ${attemptNumber})`,
        description: `This flight with ${candidateFlight.airline} is $${candidateFlight.price}, which uses our entire cozy spending goal. Don't worry at all—I'm softly looking for a lighter, more economical flight so you have ample funds for relaxing accommodations.`,
        details: {
          is_correction: true,
          attempt_number: attemptNumber,
          reflection_notes: [
            `Flight price $${candidateFlight.price} leaves little room for cozy lodging within our $${totalBudget} goal.`,
            `Gently switching to an alternative flight option for your peace of mind...`,
          ],
          budget_math: {
            total_budget: totalBudget,
            flight_cost: candidateFlight.price,
            remaining_for_hotel: totalBudget - candidateFlight.price,
            nights,
            max_nightly_ceiling: 0,
          }
        },
        status: 'warning',
      });
      attemptNumber++;
      continue;
    }

    const remainingForHotel = totalBudget - candidateFlight.price;
    const maxNightlyCeiling = Math.floor(remainingForHotel / nights);

    addTrace({
      type: 'budget_deduction',
      title: `3. Thoughtful Lodging Allowance (Step ${attemptNumber})`,
      description: `We've spotted a lovely flight with ${candidateFlight.airline} for $${candidateFlight.price}. This leaves a comfortable $${remainingForHotel} for your retreat accommodations (a cozy ceiling of $${maxNightlyCeiling}/night across ${nights} nights).`,
      details: {
        budget_math: {
          total_budget: totalBudget,
          flight_cost: candidateFlight.price,
          remaining_for_hotel: remainingForHotel,
          nights,
          max_nightly_ceiling: maxNightlyCeiling,
        }
      },
      status: 'completed',
    });

    // STEP 4: Hotel Tool Invocation
    addTrace({
      type: 'hotel_search',
      title: `4. Finding Peaceful Accommodations: search_hotels (Step ${attemptNumber})`,
      description: `Looking for peaceful, welcoming places to stay in ${destCity} up to $${maxNightlyCeiling}/night...`,
      details: {
        tool_name: 'search_hotels',
        params: { city: destCity, check_in: checkIn, check_out: checkOut, max_price_per_night: maxNightlyCeiling },
      },
      status: 'active',
    });

    const hotelResult = search_hotels({
      city: destCity,
      check_in: checkIn,
      check_out: checkOut,
      max_price_per_night: maxNightlyCeiling,
    });

    // Check if any hotels match the calculated ceiling
    if (!hotelResult.success || hotelResult.hotels.length === 0) {
      const minRate = hotelResult.cheapest_available_rate || 65;
      const minHotelTotal = minRate * nights;
      const deficit = candidateFlight.price + minHotelTotal - totalBudget;

      addTrace({
        type: 'agentic_reflection',
        title: `Gentle Self-Correction: Harmonizing the Budget (Step ${attemptNumber})`,
        description: `The resting places currently available in ${destCity} are just a gentle nudge above our current nightly allowance. Please rest easy—I'm quietly adjusting parameters to see if a smarter flight saver or alternate tier brings everything into peaceful alignment.`,
        details: {
          is_correction: true,
          attempt_number: attemptNumber,
          reflection_notes: [
            `No hotels found under the initial $${maxNightlyCeiling}/night ceiling.`,
            `Comfortable rooms start around $${minRate}/night ($${minHotelTotal} total).`,
            `Difference: $${deficit} USD from current spending goal.`,
            `Harmonizing step: Finding a more economical flight to free up more room for your resting stay.`
          ],
          budget_math: {
            total_budget: totalBudget,
            flight_cost: candidateFlight.price,
            remaining_for_hotel: remainingForHotel,
            nights,
            max_nightly_ceiling: maxNightlyCeiling,
            hotel_total_cost: minHotelTotal,
            total_spent: candidateFlight.price + minHotelTotal,
            net_balance: -deficit,
          }
        },
        status: 'warning',
      });

      attemptNumber++;
      continue;
    }

    // A viable hotel was found within budget!
    const chosenHotel = hotelResult.hotels[0];
    const totalSpent = candidateFlight.price + chosenHotel.total_cost;
    const remainingFunds = totalBudget - totalSpent;

    if (totalSpent <= totalBudget) {
      viableFound = true;
      finalFlight = candidateFlight;
      finalHotel = chosenHotel;
      finalSpent = totalSpent;
      finalRemaining = remainingFunds;

      addTrace({
        type: 'plan_compilation',
        title: '5. A Peaceful Plan Has Blossomed Beautifully',
        description: `We've found a wonderful, stress-free harmony: your ${finalFlight.airline} flight ($${finalFlight.price}) paired with ${finalHotel.name} ($${finalHotel.total_cost}). That leaves a cozy $${finalRemaining} in your pocket for warm meals, artisanal coffee, and peaceful strolls!`,
        details: {
          budget_math: {
            total_budget: totalBudget,
            flight_cost: finalFlight.price,
            remaining_for_hotel: totalBudget - finalFlight.price,
            nights,
            max_nightly_ceiling: maxNightlyCeiling,
            hotel_total_cost: finalHotel.total_cost,
            total_spent: finalSpent,
            net_balance: finalRemaining,
          },
          reflection_notes: [
            `Total flight + stay is $${finalSpent}, beautifully honoring our $${totalBudget} spending goal.`,
            `Crafting your daily relaxing rhythm with peace of mind.`,
          ]
        },
        status: 'completed',
      });
      break;
    }
  }

  // If no viable option could be found after exhaustive attempts:
  if (!viableFound || !finalHotel) {
    const cheapestFlight = flightResult.flights.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
    const mockHotelCheck = search_hotels({ city: destCity, check_in: checkIn, check_out: checkOut, max_price_per_night: 9999 });
    const cheapestHotelRate = mockHotelCheck.cheapest_available_rate || 65;
    const cheapestTotalHotel = cheapestHotelRate * nights;
    const absoluteMinCost = cheapestFlight.price + cheapestTotalHotel;
    const netDeficit = absoluteMinCost - totalBudget;

    const errorMsg = `We lovingly looked through every option, but couldn't quite find a restful flight and hotel combination within our cozy spending goal of $${totalBudget.toLocaleString()} for ${nights} nights in ${destCity}. A gentle adjustment to around $${absoluteMinCost.toLocaleString()} USD (an extra $${netDeficit.toLocaleString()}) would comfortably unlock a lovely flight and tranquil accommodations for you.`;

    addTrace({
      type: 'failure_deficit',
      title: 'Gentle Reassurance: A Small Adjustment Needed',
      description: errorMsg,
      details: {
        budget_math: {
          total_budget: totalBudget,
          flight_cost: cheapestFlight.price,
          remaining_for_hotel: totalBudget - cheapestFlight.price,
          nights,
          max_nightly_ceiling: Math.floor((totalBudget - cheapestFlight.price) / nights),
          hotel_total_cost: cheapestTotalHotel,
          total_spent: absoluteMinCost,
          net_balance: -netDeficit,
        },
        reflection_notes: [
          `All gentle combinations explored with care.`,
          `Current spending goal is slightly below base travel costs for this route and duration.`,
          `Presenting a kind suggestion to ease your planning.`
        ]
      },
      status: 'error',
    });

    const failureOutput: AgentPlanOutput = {
      status: 'error',
      error_message: errorMsg,
      financials: {
        total_budget: totalBudget,
        total_spent: 0,
        remaining_funds: totalBudget,
      },
    };

    return {
      output: failureOutput,
      traces,
      executionTimeMs: Date.now() - startTime,
    };
  }

  // STEP 5: Check Gentle Weather Forecast for Travel Dates
  const weatherResult = get_weather_forecast({
    city: destCity,
    start_date: departureDate,
    end_date: returnDate,
  });

  addTrace({
    type: 'weather_forecast',
    title: '5. Atmospheric Comfort: get_weather_forecast',
    description: `Queried the local climate and atmospheric conditions for ${destCity} across ${departureDate} to ${returnDate}. Prepared mindful packing tips and gentle weather guidance for each day of your stay.`,
    details: {
      tool_name: 'get_weather_forecast',
      params: { city: destCity, start_date: departureDate, end_date: returnDate },
      result_summary: `${weatherResult.forecasts.length} daily climate forecasts gathered with care.`,
    },
    status: 'completed',
  });

  // STEP 6: Generate Daily Itinerary and Final JSON Schema
  let dailyItinerary = await generateDailyItinerary({
    city: destCity,
    nights,
    departureDate,
    hotelName: finalHotel.name,
    flightArrival: finalFlight.arrival_time,
  });

  // Attach weather to each day's itinerary card
  if (weatherResult.success && weatherResult.forecasts) {
    dailyItinerary = dailyItinerary.map((day, idx) => {
      const forecast = weatherResult.forecasts[idx] || weatherResult.forecasts[weatherResult.forecasts.length - 1];
      return {
        ...day,
        weather: forecast?.weather,
      };
    });
  }

  const finalOutput: AgentPlanOutput = {
    status: 'success',
    financials: {
      total_budget: totalBudget,
      total_spent: finalSpent,
      remaining_funds: finalRemaining,
    },
    bookings: {
      flight_pnr: finalFlight.pnr,
      flight_cost: finalFlight.price,
      hotel_name: finalHotel.name,
      hotel_total_cost: finalHotel.total_cost,
    },
    daily_itinerary: dailyItinerary,
  };

  return {
    output: finalOutput,
    traces,
    executionTimeMs: Date.now() - startTime,
  };
}

async function generateDailyItinerary(params: {
  city: string;
  nights: number;
  departureDate: string;
  hotelName: string;
  flightArrival: string;
}): Promise<Array<{ day_number: number; date: string; agenda: string[] }>> {
  const { city, nights, departureDate, hotelName, flightArrival } = params;
  
  // Try generating with Gemini if API key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a ${nights + 1}-day travel itinerary for a trip to ${city}. Check-in at ${hotelName}. Arrival time is ${flightArrival} on ${departureDate}.
Return ONLY a valid JSON array of objects conforming to this schema:
[
  {
    "day_number": 1,
    "date": "YYYY-MM-DD",
    "agenda": ["Item 1", "Item 2", "Item 3", "Item 4"]
  }
]`,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: 1 as any }, // Low thinking for speed
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gemini itinerary enrichment fallback to template:', e);
    }
  }

  // High-fidelity domain fallback itinerary
  const startDate = new Date(departureDate);
  const totalDays = nights + 1;
  const itineraries: Array<{ day_number: number; date: string; agenda: string[] }> = [];

  const cityHighlights: Record<string, string[][]> = {
    Tokyo: [
      ['Arrival and landing transit to central Tokyo', `Check in and unpack at ${hotelName}`, 'Evening orientation stroll through Omoide Yokocho', 'Authentic bowl of ramen at an intimate Shinjuku alley stall'],
      ['Early morning quiet walk around Meiji Jingu Shrine and Yoyogi Park', 'Exploration of Harajuku Takeshita Street and Omotesando architectural facades', 'Afternoon visit to Nezu Museum and traditional bamboo garden', 'Sunset cocktails and panorama over Shibuya Crossing'],
      ['Morning exploration of historic Asakusa and Senso-ji Temple', 'Sumida River water bus cruise to Hamarikyu Imperial Gardens', 'Tea ceremony tasting in traditional wooden teahouse', 'Evening dinner in Ginza culinary district'],
      ['Morning visit to teamLab Planets digital art installation', 'Fresh sushi lunch at Toyosu Outer Market', 'Afternoon shopping through Akihabara electronic & anime craft shops', 'Dinner at an izakaya in Yurakucho under the train tracks'],
      ['Day trip or excursion to Kamakura Great Buddha or Yanaka Old Town', 'Afternoon craft coffee tasting in Kiyosumi-Shirakawa', 'Sunset stroll through Ueno Park and Tokyo National Museum', 'Farewell celebratory dinner with wagyu sukiyaki'],
      ['Leisurely breakfast at hotel and souvenir packaging', 'Final shopping stroll through Roppongi Hills observation deck', 'Express train transit to airport for return flight departure'],
    ],
    Paris: [
      ['Touchdown in Paris and direct RER transit to central district', `Check in and refresh at ${hotelName}`, 'Sunset stroll along the Seine River banks and Pont Alexandre III', 'Classic bistro dinner featuring steak frites and local Côtes du Rhône'],
      ['Early morning timed entry to Musée d’Orsay impressionist masterpieces', 'Walk across Tuileries Garden to Palais-Royal quiet colonnade', 'Lunch at historic covered passage Galerie Vivienne', 'Evening walk through Montmartre and sunset view from Sacré-Cœur'],
      ['Morning architectural exploration of Sainte-Chapelle stained glass and Notre-Dame square', 'Lunch with artisanal quiche and café crème in Saint-Germain-des-Prés', 'Afternoon visit to Musée Rodin sculpture gardens', 'Evening dinner cruise along the Seine illumination'],
      ['Morning stroll through Le Marais historic courtyards and Place des Vosges', 'Boutique shopping along Rue des Francs-Bourgeois', 'Afternoon espresso and pastry at Carette', 'Dinner in the vibrant Bastille foodie quarter'],
      ['Day excursion to Versailles Palace gardens or Musée Marmottan Monet', 'Late afternoon stroll through Luxembourg Gardens', 'Evening farewell dinner at a candlelit Left Bank bistro'],
      ['Croissant and café au lait at neighborhood patisserie', 'Last-minute Parisian gift and chocolate purchases', 'Transit to airport for return flight home'],
    ],
    Miami: [
      ['Arrival in sunny Miami and short transfer to South Beach', `Check in at ${hotelName}`, 'Afternoon relaxation along Lummus Beach oceanfront', 'Dinner at an oceanfront seafood grill on Ocean Drive'],
      ['Morning architectural walking tour of Art Deco Historic District', 'Lunch with Cuban sandwiches and iced café con leche in Little Havana', 'Afternoon exploration of Wynwood Walls street art murals', 'Evening sunset cocktail at a Brickell rooftop overlooking Biscayne Bay'],
      ['Morning kayak or paddleboard tour along Biscayne National Park waters', 'Fresh seafood ceviche lunch at Bayside Marina', 'Afternoon visit to Perez Art Museum Miami (PAMM) waterfront gardens', 'Dinner in lively Coconut Grove neighborhood'],
      ['Leisurely beach morning and sunbathing', 'Cuban pastry breakfast at Versailles Restaurant', 'Afternoon designer shopping at Lincoln Road Mall', 'Transit to Miami International Airport for departure'],
    ],
  };

  const selectedCityKey = Object.keys(cityHighlights).find(k => city.toLowerCase().includes(k.toLowerCase())) || 'Default';
  const agendas = cityHighlights[selectedCityKey] || [
    ['Arrival and transport from airport', `Check in at ${hotelName}`, 'Afternoon walk through city central plaza', 'Welcome dinner at acclaimed local eatery'],
    ['Morning guided exploration of landmark historic quarter', 'Artisanal local lunch and coffee stop', 'Afternoon visit to premier city art museum', 'Sunset viewpoints and traditional evening dinner'],
    ['Day discovery of neighborhood artisan markets', 'Botanical gardens and scenic promenade walk', 'Culinary food hall sampling session', 'Evening performing arts or riverside stroll'],
    ['Morning shopping for regional specialties', 'Relaxing park lunch and architectural photography', 'Cultural heritage exhibition tour', 'Farewell dinner at panoramic rooftop'],
    ['Packing and hotel check-out', 'Final city stroll and souvenir procurement', 'Airport transfer and return departure flight'],
  ];

  for (let d = 0; d < totalDays; d++) {
    const curDate = new Date(startDate);
    curDate.setDate(startDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];
    const agendaList = agendas[d % agendas.length];

    itineraries.push({
      day_number: d + 1,
      date: dateStr,
      agenda: agendaList,
    });
  }

  return itineraries;
}
