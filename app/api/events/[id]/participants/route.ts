import { NextRequest, NextResponse } from "next/server";
import { events, upsertParticipant, scores } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!events.has(params.id)) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const { name, isFlexible, preferences } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const participant = upsertParticipant(params.id, name, Boolean(isFlexible), preferences || []);

  // clear old scores so they get recalculated
  for (const [k, s] of scores.entries()) { if (s.eventId === params.id) scores.delete(k); }

  return NextResponse.json({ participant }, { status: 201 });
}
