"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowRightLeft, BadgeDollarSign, CalendarDays, ChevronDown, Clock3, ExternalLink, Filter, Globe2, Luggage, MapPin, Minus, Plane, Plus, Search, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";
import { AIRPORTS, type Airport, type FlightLeg, type FlightOption } from "@/lib/flights";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type TripType = "roundtrip" | "oneway";
type Sort = "price" | "duration" | "departure";
type Stops = "any" | "direct" | "one";
type Region = "NG" | "GB" | "US" | "AE";
type Cabin = "economy" | "premium" | "business";
type SearchInput = { from: string; to: string; departDate: string; returnDate?: string; tripType: TripType; sort: Sort };

const formatOffset = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const REGIONS: Record<Region, { label: string; currency: string; locale: string; rate: number; from: string; to: string }> = {
  NG: { label: "Nigeria", currency: "NGN", locale: "en-NG", rate: 1500, from: "LOS", to: "ABV" },
  GB: { label: "United Kingdom", currency: "GBP", locale: "en-GB", rate: .78, from: "LHR", to: "CDG" },
  US: { label: "United States", currency: "USD", locale: "en-US", rate: 1, from: "JFK", to: "LAX" },
  AE: { label: "United Arab Emirates", currency: "AED", locale: "en-AE", rate: 3.67, from: "DXB", to: "LHR" },
};
const CABIN_MULTIPLIERS: Record<Cabin, number> = { economy: 1, premium: 1.55, business: 2.4 };

function formatMoney(usd: number, region: Region) {
  const market = REGIONS[region];
  return new Intl.NumberFormat(market.locale, { style: "currency", currency: market.currency, maximumFractionDigits: 0 }).format(usd * market.rate);
}

function AdSlot({ format, className = "" }: { format: string; className?: string }) {
  return (
    <aside className={`ad-slot ${className}`} aria-label={`Advertisement space ${format}`}>
      <span>Advertisement</span>
      <strong>{format}</strong>
      <small>Reserved ad space</small>
    </aside>
  );
}

function AirportPicker({ label, value, onChange }: { label: string; value: Airport; onChange: (airport: Airport) => void }) {
  return (
    <label className="airport-field">
      <span className="field-label">{label}</span>
      <Combobox
        items={AIRPORTS}
        value={value}
        onValueChange={(next) => next && onChange(next as Airport)}
        itemToStringLabel={(item) => `${item.city} (${item.code})`}
        itemToStringValue={(item) => item.code}
      >
        <ComboboxInput className="airport-input" aria-label={`${label} airport`} showClear={false} />
        <ComboboxContent className="airport-menu">
          <ComboboxEmpty>No matching airport.</ComboboxEmpty>
          <ComboboxList>
            {(airport: Airport) => (
              <ComboboxItem key={airport.code} value={airport} className="airport-option">
                <MapPin aria-hidden="true" />
                <span><strong>{airport.city}</strong><small>{airport.name}</small></span>
                <b>{airport.code}</b>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </label>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function formatDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function RouteLine({ leg }: { leg: FlightLeg }) {
  return (
    <div className="route-line">
      <div className="time-block"><strong>{formatTime(leg.departure)}</strong><span>{leg.origin}</span></div>
      <div className="flight-path"><small>{formatDuration(leg.durationMinutes)}</small><div><i /><Plane aria-hidden="true" /></div><em>{leg.stops === 0 ? "Direct" : "1 stop"}</em></div>
      <div className="time-block align-right"><strong>{formatTime(leg.arrival)}</strong><span>{leg.destination}</span></div>
    </div>
  );
}

function FlightCard({ flight, rank, totalPrice, perAdult }: { flight: FlightOption; rank: number; totalPrice: string; perAdult: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="flight-card">
      {rank === 0 && <div className="best-tag"><Sparkles /> Cheapest</div>}
      <div className="flight-main">
        <div className="airline-block"><div className={`airline-mark mark-${flight.outbound.airlineCode.toLowerCase()}`}>{flight.outbound.airlineCode}</div><div><strong>{flight.outbound.airline}</strong><span>{flight.outbound.flightNumber}</span></div></div>
        <div className="legs">
          <div className="leg-row"><span className="leg-date">Out<br />{formatDate(flight.outbound.departure)}</span><RouteLine leg={flight.outbound} /></div>
          {flight.inbound && <div className="leg-row"><span className="leg-date">Back<br />{formatDate(flight.inbound.departure)}</span><RouteLine leg={flight.inbound} /></div>}
        </div>
        <div className="price-block">
          {flight.seatsLeft && <small>{flight.seatsLeft} seats left</small>}
          <strong>{totalPrice}</strong><span>Total party price · {perAdult} per adult</span>
          <a href={flight.providerUrl} target="_blank" rel="noopener noreferrer sponsored">View deal <ExternalLink /></a>
          <button className="details-button" type="button" onClick={() => setExpanded((current) => !current)}>{expanded ? "Hide details" : "Flight details"}</button>
        </div>
      </div>
      {expanded && <div className="flight-details"><span><Luggage /> Carry-on included</span><span><ShieldCheck /> Fare shown before provider extras</span><span><Globe2 /> You will book on {flight.providerName}</span></div>}
    </article>
  );
}

function Counter({ label, note, value, onChange, min = 0, max = 9 }: { label: string; note: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return <div className="counter-row"><div><strong>{label}</strong><span>{note}</span></div><div><button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Remove ${label}`}><Minus /></button><b>{value}</b><button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Add ${label}`}><Plus /></button></div></div>;
}

export default function Home() {
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [from, setFrom] = useState(AIRPORTS[0]);
  const [to, setTo] = useState(AIRPORTS[1]);
  const [region, setRegion] = useState<Region>("NG");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [showTravellers, setShowTravellers] = useState(false);
  const [departDate, setDepartDate] = useState(() => formatOffset(21));
  const [returnDate, setReturnDate] = useState(() => formatOffset(29));
  const [sort, setSort] = useState<Sort>("price");
  const [stops, setStops] = useState<Stops>("any");
  const [maxPrice, setMaxPrice] = useState([1800]);
  const [showFilters, setShowFilters] = useState(false);
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const locale = navigator.language.toUpperCase();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const detected: Region = zone === "Africa/Lagos" || locale.includes("-NG") ? "NG" : locale.includes("-GB") ? "GB" : locale.includes("-US") ? "US" : "NG";
    const market = REGIONS[detected];
    setRegion(detected);
    setFrom(AIRPORTS.find((airport) => airport.code === market.from) ?? AIRPORTS[0]);
    setTo(AIRPORTS.find((airport) => airport.code === market.to) ?? AIRPORTS[1]);
  }, []);

  const runSearch = useCallback(async (input: SearchInput) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ from: input.from, to: input.to, departDate: input.departDate, tripType: input.tripType, sort: input.sort });
      if (input.tripType === "roundtrip" && input.returnDate) params.set("returnDate", input.returnDate);
      const response = await fetch(`/api/flights?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not load flights.");
      setFlights(data.flights);
      return { count: data.flights.length, lowestPrice: data.flights[0]?.price ?? null };
    } catch (reason) {
      setFlights([]);
      setError(reason instanceof Error ? reason.message : "We could not load flights.");
      return { count: 0, error: reason instanceof Error ? reason.message : "Search failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(() => runSearch({ from: from.code, to: to.code, departDate, returnDate, tripType, sort }), [departDate, from.code, returnDate, runSearch, sort, to.code, tripType]);
  useEffect(() => { void search(); }, [search]);

  useEffect(() => {
    const context = (document as unknown as { modelContext?: { registerTool: (tool: object, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "search_flights", title: "Search flights", description: "Search FlightHub's flight inventory and update the visible results.",
      inputSchema: { type: "object", properties: { from: { type: "string", description: "Origin IATA code" }, to: { type: "string", description: "Destination IATA code" }, departDate: { type: "string", format: "date" }, returnDate: { type: "string", format: "date" }, tripType: { type: "string", enum: ["oneway", "roundtrip"] }, sort: { type: "string", enum: ["price", "duration", "departure"] } }, required: ["from", "to", "departDate", "tripType"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: (input: SearchInput) => runSearch({ ...input, sort: input.sort ?? "price" }),
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [runSearch]);

  const filtered = useMemo(() => flights.filter((flight) => {
    const stopMatch = stops === "any" || (stops === "direct" ? flight.outbound.stops === 0 : flight.outbound.stops <= 1);
    return stopMatch && flight.price <= maxPrice[0];
  }), [flights, maxPrice, stops]);
  const cheapPicks = useMemo(() => [...filtered].sort((a, b) => a.price - b.price).slice(0, 3), [filtered]);
  const travellerCount = adults + children + infants;
  const partyFactor = (adults + children * .75 + infants * .1) * CABIN_MULTIPLIERS[cabin];

  function submit(event: FormEvent) {
    event.preventDefault();
    if (from.code === to.code) { setError("Departure and arrival airports must be different."); return; }
    void search();
  }

  function swapAirports() { setFrom(to); setTo(from); }

  function changeRegion(next: Region) {
    const market = REGIONS[next];
    setRegion(next);
    setFrom(AIRPORTS.find((airport) => airport.code === market.from) ?? AIRPORTS[0]);
    setTo(AIRPORTS.find((airport) => airport.code === market.to) ?? AIRPORTS[1]);
  }

  return (
    <main>
      <header className="site-header"><a className="brand" href="#top" aria-label="FlightHub home"><span><Plane /></span>flighthub</a><nav aria-label="Primary"><a className="active" href="#search">Flights</a><a href="#results">Cheap fares</a><a href="#support">Help</a></nav><div className="header-tools"><label className="region-control"><Globe2 /><span className="sr-only">Region</span><select value={region} onChange={(event) => changeRegion(event.target.value as Region)}>{(Object.entries(REGIONS) as [Region, typeof REGIONS[Region]][]).map(([code, market]) => <option key={code} value={code}>{market.label} · {market.currency}</option>)}</select></label></div></header>

      <section className="search-hero" id="top">
        <div className="hero-photo" role="img" aria-label="Mediterranean coastline glowing at blue hour" /><div className="hero-shade" />
        <div className="hero-content"><div className="hero-copy"><p className="eyebrow">Cheap flight finder</p><h1>Find the right flight,<br />without the turbulence.</h1><p className="hero-support">Compare available fares, spot the cheapest options, then book directly with the airline or travel provider.</p></div>
          <form className="search-panel" id="search" onSubmit={submit}>
            <div className="trip-tabs" aria-label="Trip type"><button className={tripType === "roundtrip" ? "selected" : ""} type="button" onClick={() => setTripType("roundtrip")}>Round trip</button><button className={tripType === "oneway" ? "selected" : ""} type="button" onClick={() => setTripType("oneway")}>One way</button><span><BadgeDollarSign /> Prices shown in {REGIONS[region].currency}</span></div>
            <div className={`search-grid ${tripType === "oneway" ? "oneway-grid" : ""}`}>
              <AirportPicker label="From" value={from} onChange={setFrom} /><button className="swap-button" type="button" onClick={swapAirports} aria-label="Swap airports"><ArrowRightLeft /></button><AirportPicker label="To" value={to} onChange={setTo} />
              <label className="date-field"><span className="field-label">Depart</span><span><CalendarDays /><input type="date" min={formatOffset(0)} value={departDate} onChange={(event) => setDepartDate(event.target.value)} required /></span></label>
              {tripType === "roundtrip" && <label className="date-field"><span className="field-label">Return</span><span><CalendarDays /><input type="date" min={departDate} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} required /></span></label>}
              <div className="traveller-field"><button className="traveller-trigger" type="button" onClick={() => setShowTravellers((current) => !current)} aria-expanded={showTravellers}><span className="field-label">Travellers & cabin</span><span><UsersRound />{travellerCount} {travellerCount === 1 ? "traveller" : "travellers"} · {cabin === "premium" ? "Premium" : cabin[0].toUpperCase() + cabin.slice(1)}<ChevronDown /></span></button>{showTravellers && <div className="traveller-panel"><label>Cabin class<select value={cabin} onChange={(event) => setCabin(event.target.value as Cabin)}><option value="economy">Economy</option><option value="premium">Premium economy</option><option value="business">Business</option></select></label><Counter label="Adults" note="Aged 18+" value={adults} min={Math.max(1, infants)} max={adults + (9 - travellerCount)} onChange={setAdults} /><Counter label="Children" note="Aged 2–17" value={children} max={children + (9 - travellerCount)} onChange={setChildren} /><Counter label="Infants" note="Under 2" value={infants} max={Math.min(adults, infants + (9 - travellerCount))} onChange={setInfants} /><button className="apply-travellers" type="button" onClick={() => setShowTravellers(false)}>Apply</button></div>}</div>
              <button className="search-button" type="submit"><Search />Search flights</button>
            </div>
          </form>
        </div>
      </section>

      <div className="top-ad-wrap"><AdSlot format="728 × 90" className="ad-leaderboard" /></div>

      <div className="monetized-layout">
        <AdSlot format="160 × 600" className="ad-rail ad-rail-left" />
      <section className="results-section" id="results">
        {!loading && !error && cheapPicks.length > 0 && <section className="cheap-suggestions" aria-labelledby="cheap-heading"><div className="suggestion-heading"><div><span>Smart fare picks</span><h2 id="cheap-heading">Cheapest flights for your search</h2></div><p>Prices include {travellerCount} {travellerCount === 1 ? "traveller" : "travellers"}</p></div><div className="suggestion-grid">{cheapPicks.map((flight, index) => <a key={flight.id} href={flight.providerUrl} target="_blank" rel="noopener noreferrer sponsored"><span>{index === 0 ? "Cheapest" : index === 1 ? "Next cheapest" : "Another low fare"}</span><strong>{formatMoney(flight.price * partyFactor, region)}</strong><small>{flight.outbound.airline} · {formatTime(flight.outbound.departure)}</small><b>View deal <ArrowRight /></b></a>)}</div></section>}
        <div className="results-heading"><div><p>{from.city} <ArrowRight /> {to.city}</p><h2>{loading ? "Searching the skies…" : `${filtered.length} flight options`}</h2></div><div className="results-actions"><button className="mobile-filter" type="button" onClick={() => setShowFilters((current) => !current)}><Filter /> Filters</button><label>Sort by<Select value={sort} onValueChange={(value) => setSort(value as Sort)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="price">Cheapest first</SelectItem><SelectItem value="duration">Shortest duration</SelectItem><SelectItem value="departure">Departure time</SelectItem></SelectContent></Select></label></div></div>
        <div className="results-layout">
          <aside className={showFilters ? "filters open" : "filters"}><div className="filter-title"><h3>Filters</h3><button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters"><X /></button></div><fieldset><legend>Stops</legend>{([['any','Any number'],['direct','Direct only'],['one','Up to 1 stop']] as [Stops,string][]).map(([value,label]) => <label key={value}><input type="radio" name="stops" value={value} checked={stops === value} onChange={() => setStops(value)} /><span>{label}</span></label>)}</fieldset><fieldset><legend>Maximum price <b>{formatMoney(maxPrice[0] * partyFactor, region)}</b></legend><Slider min={100} max={2000} step={50} value={maxPrice} onValueChange={setMaxPrice} aria-label="Maximum price" /><div className="range-labels"><span>{formatMoney(100 * partyFactor, region)}</span><span>{formatMoney(2000 * partyFactor, region)}</span></div></fieldset><div className="filter-note"><Clock3 /><div><strong>Compare, then book elsewhere</strong><p>FlightHub shows available mock fares and sends you to the provider to complete booking.</p></div></div></aside>
          <div className="flight-list" aria-live="polite" aria-busy={loading}>
            {error && <div className="empty-state"><strong>We hit some headwinds.</strong><p>{error}</p><button type="button" onClick={() => void search()}>Try again</button></div>}
            {loading && Array.from({ length: 3 }, (_, index) => <div className="flight-skeleton" key={index}><i /><span /><span /></div>)}
            {!loading && !error && filtered.length === 0 && <div className="empty-state"><strong>No flights match these filters.</strong><p>Try raising your maximum price or allowing a stop.</p><button type="button" onClick={() => { setStops("any"); setMaxPrice([2000]); }}>Reset filters</button></div>}
            {!loading && !error && filtered.map((flight, index) => <FlightCard key={flight.id} flight={flight} rank={index} totalPrice={formatMoney(flight.price * partyFactor, region)} perAdult={formatMoney(flight.price * CABIN_MULTIPLIERS[cabin], region)} />)}
          </div>
        </div>
      </section>
        <AdSlot format="160 × 600" className="ad-rail ad-rail-right" />
      </div>
      <footer id="support"><span><Plane /> flighthub</span><p>Compare available fares on FlightHub, then complete your booking securely with the airline or travel provider.</p><a href="#top">Back to top</a></footer>
    </main>
  );
}
