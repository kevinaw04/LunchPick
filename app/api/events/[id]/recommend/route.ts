import { NextRequest, NextResponse } from "next/server";
import { events, restaurants, scores, getEventParticipants, uid } from "@/lib/store";
import { rankRestaurants, type ParticipantData, type EventData } from "@/lib/recommendation";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const event = events.get(params.id);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const participantList = getEventParticipants(params.id);
  const restaurantList = [...restaurants.values()];

  const participants: ParticipantData[] = participantList.map(p => ({
    id: p.id, name: p.name, isFlexible: p.isFlexible,
    preferences: p.preferences.map(pref => ({ type: pref.type as any, value: pref.value })),
  }));

  const eventData: EventData = {
    headcount: event.headcount,
    budgetTotal: event.budgetTotal, budgetPerPerson: event.budgetPerPerson,
    allowDelivery: event.allowDelivery, allowPickup: event.allowPickup, allowCatering: event.allowCatering,
    radiusMiles: event.radiusMiles, eventDate: event.eventDate,
  };

  // clear old scores
  for (const [k, s] of scores.entries()) { if (s.eventId === params.id) scores.delete(k); }

  const ranked = rankRestaurants(restaurantList, participants, eventData);
  for (const { restaurant, result } of ranked) {
    const score = {
      id: uid(), eventId: params.id, restaurantId: restaurant.id,
      totalScore: result.totalScore, dietaryScore: result.dietaryScore,
      preferenceScore: result.preferenceScore, budgetScore: result.budgetScore,
      logisticsScore: result.logisticsScore, compatibleCount: result.compatibleCount,
      totalParticipants: result.totalParticipants, satisfactionPct: result.satisfactionPct,
      explanation: JSON.stringify(result.explanation), createdAt: new Date().toISOString(),
    };
    scores.set(score.id, score);
  }

  return NextResponse.json({ count: ranked.length });
}
