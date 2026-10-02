"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Leaf, MapPin, Phone, Clock, CheckCircle2, AlertTriangle,
  ChevronLeft, ExternalLink, Heart
} from "lucide-react";

const MOCK_DONATION_LOCATIONS = [
  {
    id: "1",
    name: "City Food Bank",
    type: "Food Bank",
    distance: "0.8 mi",
    acceptsPrepared: true,
    hours: "Mon–Sat 9am–5pm",
    phone: "555-2000",
    address: "100 Main St",
    notes: "Accepts prepared meals with 24hr advance notice. Call ahead.",
    emoji: "🏦",
  },
  {
    id: "2",
    name: "Hope Community Shelter",
    type: "Shelter",
    distance: "1.2 mi",
    acceptsPrepared: true,
    hours: "Daily 7am–9pm",
    phone: "555-2001",
    address: "200 Hope Ave",
    notes: "Accepts hot meals for evening service. Contact director first.",
    emoji: "🏠",
  },
  {
    id: "3",
    name: "St. Anthony's Kitchen",
    type: "Community Kitchen",
    distance: "2.1 mi",
    acceptsPrepared: true,
    hours: "Mon–Fri 11am–2pm",
    phone: "555-2002",
    address: "300 Saint St",
    notes: "Accepts packaged meals only. Must be sealed containers.",
    emoji: "🍲",
  },
  {
    id: "4",
    name: "Downtown Rescue Mission",
    type: "Mission",
    distance: "1.7 mi",
    acceptsPrepared: false,
    hours: "Daily 6am–8pm",
    phone: "555-2003",
    address: "400 Rescue Blvd",
    notes: "Currently only accepting non-perishable items. Check website for updates.",
    emoji: "⛪",
  },
  {
    id: "5",
    name: "Neighborhood Pantry",
    type: "Pantry",
    distance: "0.5 mi",
    acceptsPrepared: false,
    hours: "Wed & Sat 10am–1pm",
    phone: "555-2004",
    address: "500 Pantry Rd",
    notes: "Non-perishables only. Great for dry goods left over.",
    emoji: "🛒",
  },
];

export default function LeftoversPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [hasLeftovers, setHasLeftovers] = useState(false);
  const [servings, setServings] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/events/${params.eventId}`)
      .then((r) => r.json())
      .then((d) => {
        setEvent(d.event);
        if (d.event.leftoverDonation) {
          setHasLeftovers(d.event.leftoverDonation.hasLeftovers);
          setServings(d.event.leftoverDonation.servingsCount?.toString() || "");
          setNotes(d.event.leftoverDonation.notes || "");
        }
        setLoading(false);
      });
  }, [params.eventId]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/events/${params.eventId}/leftovers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasLeftovers, servingsCount: servings, notes }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedRestaurantName = event?.restaurantScores?.find(
    (s: any) => s.restaurantId === event?.selectedRestaurant?.restaurantId
  )?.restaurant?.name;

  const showDonationLocations = hasLeftovers && parseInt(servings || "0") > 0;
  const acceptingLocations = MOCK_DONATION_LOCATIONS.filter((l) => l.acceptsPrepared);
  const nonAcceptingLocations = MOCK_DONATION_LOCATIONS.filter((l) => !l.acceptsPrepared);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href={`/dashboard/${params.eventId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Leftover Donation</h1>
            <p className="text-gray-500">
              Got extra food from{selectedRestaurantName ? ` ${selectedRestaurantName}?` : " today's lunch?"}{" "}
              Find a nearby organization to donate to.
            </p>
          </div>
        </div>

        {/* Sustainability note */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Making a difference</h3>
              <p className="text-sm text-green-700">
                Donating surplus food reduces waste and supports your community.
                Every meal shared makes a positive impact. 🌱
              </p>
            </div>
          </div>
        </div>

        {/* Leftover form */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Do you have leftovers?</h2>

          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setHasLeftovers(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                hasLeftovers ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              ✅ Yes, we have leftovers
            </button>
            <button
              onClick={() => setHasLeftovers(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                !hasLeftovers ? "border-gray-400 bg-gray-50 text-gray-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              🚫 No leftovers
            </button>
          </div>

          {hasLeftovers && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Approximate number of servings
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 8"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  placeholder="e.g. Sealed containers of rice and chicken, packaged at 1pm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                />
              </div>
            </div>
          )}

          <Button
            onClick={save}
            loading={saving}
            variant={saved ? "secondary" : "primary"}
            className="mt-5"
          >
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : "Save Leftover Info"}
          </Button>
        </Card>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <strong>Important:</strong> Contact the organization before donating prepared food to verify current
            acceptance and food-safety requirements. Not all organizations can accept prepared or perishable items.
          </p>
        </div>

        {/* Donation locations */}
        {showDonationLocations && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Nearby Donation Locations
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Showing organizations within ~5 miles that may accept {servings} servings of prepared food.
            </p>

            {/* Accepting prepared food */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                May Accept Prepared Food
              </h3>
              <div className="space-y-4">
                {acceptingLocations.map((loc) => (
                  <Card key={loc.id} className="border-green-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{loc.emoji}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                            <Badge variant="success" size="sm">{loc.type}</Badge>
                          </div>
                          <div className="text-sm text-gray-500">{loc.distance} away</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {loc.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {loc.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {loc.hours}
                      </div>
                    </div>

                    <div className="mt-3 bg-green-50 rounded-xl px-4 py-3 text-sm text-green-700">
                      📝 {loc.notes}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Non-accepting */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Non-Perishables Only
              </h3>
              <div className="space-y-3">
                {nonAcceptingLocations.map((loc) => (
                  <Card key={loc.id} className="border-gray-100 bg-gray-50/50">
                    <div className="flex items-start gap-3">
                      <div className="text-xl opacity-60">{loc.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-700 text-sm">{loc.name}</h3>
                          <Badge variant="muted" size="sm">{loc.type}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{loc.distance} · {loc.hours}</p>
                        <p className="text-xs text-gray-500 mt-1">{loc.notes}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!showDonationLocations && hasLeftovers && (
          <Card className="text-center py-10">
            <div className="text-4xl mb-3">🔢</div>
            <p className="text-gray-500 text-sm">Enter the number of servings above to see nearby donation options.</p>
          </Card>
        )}

        {!hasLeftovers && (
          <Card className="text-center py-10">
            <div className="text-4xl mb-3">🎊</div>
            <h3 className="font-semibold text-gray-900 mb-1">No leftovers? Great job!</h3>
            <p className="text-gray-500 text-sm">Perfect portions are the best kind of sustainability.</p>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href={`/dashboard/${params.eventId}`}>
            <Button variant="secondary">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
