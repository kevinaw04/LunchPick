import { NextRequest, NextResponse } from "next/server";
import { events, makeEvent, uid } from "@/lib/store";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, eventDate, headcount, locationName, zipCode, radiusMiles,
          budgetTotal, budgetPerPerson, allowDelivery, allowPickup, allowCatering, notes } = body;

  if (!name || !eventDate || !headcount || !locationName || !zipCode)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  let code = generateCode();
  while ([...events.values()].some(e => e.code === code)) code = generateCode();

  const event = makeEvent({
    name, eventDate: new Date(eventDate).toISOString(),
    headcount: parseInt(headcount), locationName, zipCode,
    radiusMiles: parseFloat(radiusMiles) || 10,
    budgetTotal: budgetTotal ? parseFloat(budgetTotal) : null,
    budgetPerPerson: budgetPerPerson ? parseFloat(budgetPerPerson) : null,
    allowDelivery: Boolean(allowDelivery), allowPickup: Boolean(allowPickup),
    allowCatering: Boolean(allowCatering), notes: notes || null, code,
  });
  return NextResponse.json({ event }, { status: 201 });
}

export async function GET() {
  const list = [...events.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  return NextResponse.json({ events: list });
}
