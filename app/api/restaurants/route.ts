import { NextResponse } from "next/server";
import { restaurants } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ restaurants: [...restaurants.values()].sort((a, b) => b.rating - a.rating) });
}
