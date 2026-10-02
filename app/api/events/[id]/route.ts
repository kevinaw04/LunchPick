import { NextRequest, NextResponse } from "next/server";
import { events, restaurants, getEventParticipants, getEventScores, selected, leftovers } from "@/lib/store";

function buildEventResponse(id: string) {
  const event = events.get(id);
  if (!event) return null;
  return {
    ...event,
    participants: getEventParticipants(id),
    restaurantScores: getEventScores(id).map(s => ({
      ...s,
      restaurant: restaurants.get(s.restaurantId),
    })),
    selectedRestaurant: selected.get(id) || null,
    leftoverDonation: leftovers.get(id) || null,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const event = buildEventResponse(params.id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const event = events.get(params.id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const body = await req.json();
  const updated = {
    ...event, ...body,
    headcount: body.headcount ? parseInt(body.headcount) : event.headcount,
    radiusMiles: body.radiusMiles ? parseFloat(body.radiusMiles) : event.radiusMiles,
    budgetTotal: body.budgetTotal !== undefined ? (body.budgetTotal ? parseFloat(body.budgetTotal) : null) : event.budgetTotal,
    budgetPerPerson: body.budgetPerPerson !== undefined ? (body.budgetPerPerson ? parseFloat(body.budgetPerPerson) : null) : event.budgetPerPerson,
    updatedAt: new Date().toISOString(),
  };
  events.set(params.id, updated);
  return NextResponse.json({ event: updated });
}
