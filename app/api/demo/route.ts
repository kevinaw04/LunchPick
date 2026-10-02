import { NextResponse } from "next/server";
import { getDemoEventId, events, getEventParticipants, getEventScores, scores, restaurants, uid } from "@/lib/store";
import { rankRestaurants, type ParticipantData, type EventData } from "@/lib/recommendation";

export async function GET() {
  const eventId = getDemoEventId();
  const event = events.get(eventId)!;

  // auto-calculate if no scores yet
  if (getEventScores(eventId).length === 0) {
    const participantList = getEventParticipants(eventId);
    const restaurantList = [...restaurants.values()];
    const participants: ParticipantData[] = participantList.map(p => ({
      id: p.id, name: p.name, isFlexible: p.isFlexible,
      preferences: p.preferences.map(pref => ({ type: pref.type as any, value: pref.value })),
    }));
    const eventData: EventData = {
      headcount: event.headcount, budgetTotal: event.budgetTotal, budgetPerPerson: event.budgetPerPerson,
      allowDelivery: event.allowDelivery, allowPickup: event.allowPickup, allowCatering: event.allowCatering,
      radiusMiles: event.radiusMiles, eventDate: event.eventDate,
    };
    const ranked = rankRestaurants(restaurantList, participants, eventData);
    for (const { restaurant, result } of ranked) {
      const score = {
        id: uid(), eventId, restaurantId: restaurant.id,
        totalScore: result.totalScore, dietaryScore: result.dietaryScore,
        preferenceScore: result.preferenceScore, budgetScore: result.budgetScore,
        logisticsScore: result.logisticsScore, compatibleCount: result.compatibleCount,
        totalParticipants: result.totalParticipants, satisfactionPct: result.satisfactionPct,
        explanation: JSON.stringify(result.explanation), createdAt: new Date().toISOString(),
      };
      scores.set(score.id, score);
    }
  }

  return NextResponse.json({ eventId, code: event.code });
}
