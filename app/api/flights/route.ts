import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/flights";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const from = query.get("from") ?? "";
  const to = query.get("to") ?? "";
  const departDate = query.get("departDate") ?? "";
  const returnDate = query.get("returnDate") ?? undefined;
  const tripType = query.get("tripType") === "oneway" ? "oneway" : "roundtrip";
  const requestedSort = query.get("sort");
  const sort = requestedSort === "duration" || requestedSort === "departure" ? requestedSort : "price";

  if (!from || !to || !datePattern.test(departDate)) {
    return NextResponse.json({ error: "Choose valid airports and a departure date." }, { status: 400 });
  }
  if (tripType === "roundtrip" && (!returnDate || !datePattern.test(returnDate) || returnDate < departDate)) {
    return NextResponse.json({ error: "Return date must be on or after the departure date." }, { status: 400 });
  }

  // Deterministic mock inventory makes every supported route/date searchable.
  // A real provider can replace this function without changing the client contract.
  const flights = searchFlights({ from, to, departDate, returnDate, tripType, sort });
  return NextResponse.json({ flights, generatedAt: new Date().toISOString() });
}
