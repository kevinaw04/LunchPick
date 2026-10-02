import { NextRequest, NextResponse } from "next/server";
import { events, restaurants, getEventParticipants, getEventScores, selected, leftovers } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const event = [...events.values()].find(e => e.code === params.code.toUpperCase());
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({
    event: {
      ...event,
      participants: getEventParticipants(event.id),
      restaurantScores: getEventScores(event.id).map(s => ({ ...s, restaurant: restaurants.get(s.restaurantId) })),
      selectedRestaurant: selected.get(event.id) || null,
      leftoverDonation: leftovers.get(event.id) || null,
    }
  });
}
