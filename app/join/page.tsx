"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Hash, ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<any>(null);

  async function lookup() {
    if (!code.trim()) {
      setError("Please enter an event code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/code/${code.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Event not found. Check your code and try again.");
      setEvent(data.event);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function proceed() {
    if (event) {
      router.push(`/survey/${event.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join an Event</h1>
          <p className="text-gray-500">Enter the 6-character event code from your organizer.</p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Code</label>
              <input
                type="text"
                placeholder="e.g. AB3X7K"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-widest uppercase"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            {!event && (
              <Button onClick={lookup} loading={loading} className="w-full" size="lg">
                Look Up Event
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Event preview */}
        {event && (
          <div className="mt-6">
            <Card className="border-green-200 bg-green-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Event Found ✓</div>
                  <h2 className="text-xl font-bold text-gray-900">{event.name}</h2>
                </div>
                <div className="text-3xl">{event.notes ? "🎉" : "🍽️"}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(event.eventDate)}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  {event.headcount} expected
                </div>
                <div className="flex items-center gap-2 text-gray-600 col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.locationName} · {event.zipCode}
                </div>
              </div>

              {event.notes && (
                <p className="text-sm text-gray-600 bg-white/60 rounded-lg px-3 py-2 mb-4 italic">
                  "{event.notes}"
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{event.participants?.length || 0} response{event.participants?.length !== 1 ? "s" : ""} so far</span>
                <span>{event.allowDelivery && "Delivery"} {event.allowCatering && "· Catering"} {event.allowPickup && "· Pickup"}</span>
              </div>

              <Button onClick={proceed} className="w-full" size="lg">
                Submit My Preferences
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <button
              onClick={() => { setEvent(null); setCode(""); }}
              className="w-full mt-3 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Try a different code
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="mt-10 text-center">
          <div className="text-sm text-gray-400">Are you the organizer?</div>
          <a href="/create" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 block">
            Create a new lunch event →
          </a>
        </div>
      </div>
    </div>
  );
}
