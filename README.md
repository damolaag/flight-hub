# FlightHub Flight Search

FlightHub is a responsive flight-comparison product focused on surfacing cheap fares and sending travellers to airlines or travel providers to complete booking. It supports local Nigerian and international airports, one-way and round-trip searches, traveller and cabin pricing, market-aware currencies, filters, sorting, expandable fare details, and reserved advertising inventory.

## Stack

- React 19 + TypeScript
- Next-compatible Vinext application runtime
- Server API route at `GET /api/flights`
- CSS + reusable accessible UI primitives
- Deterministic mock data (no API keys or database required)

## Run locally

Requirements: Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open the local URL shown in the terminal.

For a production build:

```bash
pnpm build
pnpm start
```

## Publish from GitHub

1. Create an empty GitHub repository and upload or push this project.
2. Import the repository into Vercel, Cloudflare Workers, or another Node-compatible host.
3. Keep the standard build command (`pnpm build`) and start command (`pnpm start`) unless your host detects them automatically.

No environment variables, database, user accounts, or API keys are required for the mock-data version.

## Search API

Example request:

```text
GET /api/flights?from=JFK&to=LHR&departDate=2026-10-12&returnDate=2026-10-20&tripType=roundtrip&sort=price
```

`sort` accepts `price`, `duration`, or `departure`. Flight options are generated deterministically from the route and dates, so any airport pair in `lib/flights.ts` works without external services.

## Assumptions

- Base prices are mock USD fares converted for the selected market, not live bookable fares.
- Times are rendered in UTC for consistency in this demonstration.
- Traveller counts and cabin class update the displayed party total; booking and payment remain outside FlightHub.
- FlightHub does not collect or store profile or account data in this version.
- The generated inventory layer is isolated behind the API route so it can later be replaced with a live flight provider.
