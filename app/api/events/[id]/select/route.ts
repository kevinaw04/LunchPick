import { NextRequest, NextResponse } from "next/server";
import { events, selected, uid } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!events.has(params.id)) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const { restaurantId, notes } = await req.json();
  if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
  const s = { id: uid(), eventId: params.id, restaurantId, notes: notes || null, selectedAt: new Date().toISOString() };
  selected.set(params.id, s);
  return NextResponse.json({ selected: s });
}
