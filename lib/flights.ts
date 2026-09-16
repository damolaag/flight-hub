export type Airport = {
  code: string;
  city: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export type FlightLeg = {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  stops: number;
};

export type FlightOption = {
  id: string;
  price: number;
  currency: "USD";
  providerName: string;
  providerUrl: string;
  outbound: FlightLeg;
  inbound?: FlightLeg;
  seatsLeft?: number;
};

export const AIRPORTS: Airport[] = [
  { code: "LOS", city: "Lagos", name: "Murtala Muhammed International", country: "Nigeria", lat: 6.5774, lon: 3.3212 },
  { code: "ABV", city: "Abuja", name: "Nnamdi Azikiwe International", country: "Nigeria", lat: 9.0068, lon: 7.2632 },
  { code: "PHC", city: "Port Harcourt", name: "Port Harcourt International", country: "Nigeria", lat: 5.0155, lon: 6.9496 },
  { code: "KAN", city: "Kano", name: "Mallam Aminu Kano International", country: "Nigeria", lat: 12.0476, lon: 8.5246 },
  { code: "ENU", city: "Enugu", name: "Akanu Ibiam International", country: "Nigeria", lat: 6.4743, lon: 7.5619 },
  { code: "QOW", city: "Owerri", name: "Sam Mbakwe International Cargo Airport", country: "Nigeria", lat: 5.4271, lon: 7.206 },
  { code: "CBQ", city: "Calabar", name: "Margaret Ekpo International", country: "Nigeria", lat: 4.976, lon: 8.3472 },
  { code: "BEN", city: "Benin City", name: "Benin Airport", country: "Nigeria", lat: 6.3169, lon: 5.5995 },
  { code: "JFK", city: "New York", name: "John F. Kennedy International", country: "United States", lat: 40.6413, lon: -73.7781 },
  { code: "LHR", city: "London", name: "Heathrow", country: "United Kingdom", lat: 51.47, lon: -0.4543 },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", lat: 49.0097, lon: 2.5479 },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles International", country: "United States", lat: 33.9416, lon: -118.4085 },
  { code: "SFO", city: "San Francisco", name: "San Francisco International", country: "United States", lat: 37.6213, lon: -122.379 },
  { code: "NRT", city: "Tokyo", name: "Narita International", country: "Japan", lat: 35.772, lon: 140.3929 },
  { code: "DXB", city: "Dubai", name: "Dubai International", country: "United Arab Emirates", lat: 25.2532, lon: 55.3657 },
  { code: "ATL", city: "Atlanta", name: "Hartsfield–Jackson Atlanta International", country: "United States", lat: 33.6407, lon: -84.4277 },
  { code: "MIA", city: "Miami", name: "Miami International", country: "United States", lat: 25.7959, lon: -80.287 },
  { code: "AMS", city: "Amsterdam", name: "Amsterdam Airport Schiphol", country: "Netherlands", lat: 52.3105, lon: 4.7683 },
  { code: "SIN", city: "Singapore", name: "Singapore Changi", country: "Singapore", lat: 1.3644, lon: 103.9915 },
];

const AIRLINES = [
  { name: "British Airways", code: "BA" },
  { name: "Virgin Atlantic", code: "VS" },
  { name: "Delta", code: "DL" },
  { name: "KLM", code: "KL" },
  { name: "Air France", code: "AF" },
  { name: "United", code: "UA" },
  { name: "Emirates", code: "EK" },
  { name: "Lufthansa", code: "LH" },
];

const NIGERIAN_AIRLINES = [
  { name: "Air Peace", code: "AP", url: "https://www.flyairpeace.com/" },
  { name: "Ibom Air", code: "QI", url: "https://www.ibomair.com/" },
  { name: "United Nigeria Airlines", code: "UN", url: "https://flyunitednigeria.com/" },
  { name: "Arik Air", code: "W3", url: "https://www.arikair.com/" },
  { name: "Aero Contractors", code: "AJ", url: "https://www.flyaero.com/" },
];

const PROVIDER_URLS: Record<string, string> = {
  BA: "https://www.britishairways.com/", VS: "https://www.virginatlantic.com/", DL: "https://www.delta.com/",
  KL: "https://www.klm.com/", AF: "https://www.airfrance.com/", UA: "https://www.united.com/",
  EK: "https://www.emirates.com/", LH: "https://www.lufthansa.com/",
};

function hash(input: string) {
  let value = 2166136261;
  for (const char of input) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return Math.abs(value >>> 0);
}

function distanceMiles(a: Airport, b: Airport) {
  const radius = 3959;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function makeLeg(origin: Airport, destination: Airport, date: string, index: number, reverse = false): FlightLeg {
  const seed = hash(`${origin.code}-${destination.code}-${date}-${index}-${reverse}`);
  const airlinePool = origin.country === "Nigeria" && destination.country === "Nigeria" ? NIGERIAN_AIRLINES : AIRLINES;
  const airline = airlinePool[(seed + index) % airlinePool.length];
  const miles = distanceMiles(origin, destination);
  const stops = miles > 5200 && index % 4 === 3 ? 1 : 0;
  const durationMinutes = Math.round(miles / 500 * 60 + 70 + stops * 105 + (seed % 35));
  const hour = [6, 8, 10, 13, 16, 18, 20, 22][index % 8];
  const departure = new Date(`${date}T${String(hour).padStart(2, "0")}:${String((seed % 4) * 15).padStart(2, "0")}:00.000Z`);
  return {
    airline: airline.name,
    airlineCode: airline.code,
    flightNumber: `${airline.code}${210 + (seed % 760)}`,
    origin: origin.code,
    destination: destination.code,
    departure: departure.toISOString(),
    arrival: addMinutes(departure, durationMinutes).toISOString(),
    durationMinutes,
    stops,
  };
}

export function searchFlights(params: {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  tripType: "oneway" | "roundtrip";
  sort: "price" | "duration" | "departure";
}) {
  const origin = AIRPORTS.find((airport) => airport.code === params.from.toUpperCase());
  const destination = AIRPORTS.find((airport) => airport.code === params.to.toUpperCase());
  if (!origin || !destination || origin.code === destination.code) return [];

  const miles = distanceMiles(origin, destination);
  const options = Array.from({ length: 9 }, (_, index): FlightOption => {
    const outbound = makeLeg(origin, destination, params.departDate, index);
    const inbound = params.tripType === "roundtrip" && params.returnDate
      ? makeLeg(destination, origin, params.returnDate, index + 2, true)
      : undefined;
    const routeSeed = hash(`${origin.code}-${destination.code}-${params.departDate}-${index}`);
    const domesticNigeria = origin.country === "Nigeria" && destination.country === "Nigeria";
    const base = domesticNigeria ? 42 + miles * 0.055 : 92 + miles * 0.075;
    const price = Math.round((base + (routeSeed % 170) + outbound.stops * -45) * (inbound ? 1.72 : 1));
    const localProvider = NIGERIAN_AIRLINES.find((airline) => airline.code === outbound.airlineCode);
    return {
      id: `${origin.code}${destination.code}-${params.departDate}-${index}`,
      price,
      currency: "USD",
      providerName: outbound.airline,
      providerUrl: localProvider?.url ?? PROVIDER_URLS[outbound.airlineCode] ?? "https://www.google.com/travel/flights",
      outbound,
      inbound,
      seatsLeft: index === 1 || index === 6 ? 3 + (routeSeed % 4) : undefined,
    };
  });

  return options.sort((a, b) => {
    if (params.sort === "duration") {
      return (a.outbound.durationMinutes + (a.inbound?.durationMinutes ?? 0)) - (b.outbound.durationMinutes + (b.inbound?.durationMinutes ?? 0));
    }
    if (params.sort === "departure") return a.outbound.departure.localeCompare(b.outbound.departure);
    return a.price - b.price;
  });
}
