import { NextRequest, NextResponse } from "next/server";
import { events, leftovers, uid } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!events.has(params.id)) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const { hasLeftovers, servingsCount, notes } = await req.json();
  const existing = leftovers.get(params.id);
  const donation = {
    id: existing?.id ?? uid(), eventId: params.id,
    hasLeftovers: Boolean(hasLeftovers),
    servingsCount: servingsCount ? parseInt(servingsCount) : null,
    notes: notes || null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leftovers.set(params.id, donation);
  return NextResponse.json({ donation });
}
