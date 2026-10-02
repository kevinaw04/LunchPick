"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  MapPin, Phone, Clock, Truck, Building2, ShoppingBag,
  Star, ChevronLeft, CheckCircle2, AlertTriangle, Info
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function RestaurantDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [restaurant, setRestaurant] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rRes, eRes] = await Promise.all([
          fetch(`/api/restaurants/${id}`),
          eventId ? fetch(`/api/events/${eventId}`) : Promise.resolve(null),
        ]);

        const rData = await rRes.json();
        setRestaurant(rData.restaurant);

        if (eRes) {
          const eData = await eRes.json();
          setEvent(eData.event);
          const s = eData.event?.restaurantScores?.find((s: any) => s.restaurantId === id);
          setScore(s);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, eventId]);

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cuisineTags: string[] = JSON.parse(restaurant.cuisineTags || "[]");
  const dietaryOptions: string[] = JSON.parse(restaurant.dietaryOptions || "[]");
  const allergenInfo = JSON.parse(restaurant.allergenInfo || "{}");
  const menuHighlights: string[] = JSON.parse(restaurant.menuHighlights || "[]");
  const hours = JSON.parse(restaurant.openHours || '{"open":"10:00","close":"22:00"}');
  const explanation = score ? JSON.parse(score.explanation || "{}") : null;
  const budget = event?.budgetTotal || (event?.budgetPerPerson ? event.budgetPerPerson * event.headcount : null);
  const groupCost = event ? restaurant.avgCostPerPerson * event.headcount : null;
  const isOverBudget = budget && groupCost && groupCost > budget;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {eventId && (
          <Link
            href={`/recommendations/${eventId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Recommendations
          </Link>
        )}

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-8 py-10 text-center">
            <div className="text-7xl mb-4">{restaurant.imageEmoji}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{restaurant.name}</h1>
            <p className="text-gray-500">{restaurant.cuisine}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(restaurant.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">{restaurant.rating}</span>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">{formatCurrency(restaurant.avgCostPerPerson)}</div>
                <div className="text-xs text-gray-500">per person</div>
              </div>
              {groupCost && (
                <div className="text-center">
                  <div className={`text-xl font-bold ${isOverBudget ? "text-red-600" : "text-blue-700"}`}>
                    {formatCurrency(groupCost)}
                  </div>
                  <div className="text-xs text-gray-500">group total</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{restaurant.distanceMiles} mi</div>
                <div className="text-xs text-gray-500">away</div>
              </div>
              {score && (
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-700">{Math.round(score.totalScore)}/100</div>
                  <div className="text-xs text-gray-500">match score</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Score breakdown */}
          {score && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" />
                Score Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Dietary Compatibility", value: score.dietaryScore, color: "green" as const },
                  { label: "Preference Match", value: score.preferenceScore, color: "blue" as const },
                  { label: "Budget Fit", value: score.budgetScore, color: "amber" as const },
                  { label: "Logistics", value: score.logisticsScore, color: "purple" as const },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold">{Math.round(item.value)}</span>
                    </div>
                    <ProgressBar value={item.value} color={item.color} />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Group Satisfaction</span>
                  <span className="font-semibold text-blue-700">{score.satisfactionPct}%</span>
                </div>
                <ProgressBar value={score.satisfactionPct} color="blue" />
                <p className="text-xs text-gray-400 mt-1">
                  {score.compatibleCount} of {score.totalParticipants} participants satisfied
                </p>
              </div>
            </Card>
          )}

          {/* Fulfillment & info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Restaurant Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{restaurant.address}</span>
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{restaurant.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">Open {hours.open} – {hours.close}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Fulfillment</h4>
              <div className="space-y-2">
                {[
                  { available: restaurant.deliveryAvailable, icon: <Truck className="w-4 h-4" />, label: "Delivery" },
                  { available: restaurant.pickupAvailable, icon: <ShoppingBag className="w-4 h-4" />, label: "Pickup" },
                  { available: restaurant.cateringAvailable, icon: <Building2 className="w-4 h-4" />, label: `Catering ${restaurant.cateringMinPeople > 0 ? `(${restaurant.cateringMinPeople}+ people)` : ""}` },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-3 text-sm ${item.available ? "text-green-700" : "text-gray-400"}`}>
                    <div className={item.available ? "text-green-500" : "text-gray-300"}>{item.icon}</div>
                    <span>{item.label}</span>
                    {item.available ? <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" /> : <span className="ml-auto text-xs">Not available</span>}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Dietary options */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Dietary Options
            </h3>
            {dietaryOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((opt) => (
                  <Badge key={opt} variant="success">{opt}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No specific dietary options listed.</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                Allergen Info
              </h4>
              {allergenInfo.verified ? (
                <div className="space-y-1.5">
                  {[
                    { key: "nuts", label: "Nut-free", icon: "🥜" },
                    { key: "dairy", label: "Dairy-free", icon: "🥛" },
                    { key: "gluten", label: "Gluten-free", icon: "🌾" },
                  ].map(({ key, label, icon }) => (
                    <div key={key} className={`flex items-center gap-2 text-sm ${allergenInfo[key] === false ? "text-green-700" : "text-gray-500"}`}>
                      <span>{icon}</span>
                      <span>{label}</span>
                      {allergenInfo[key] === false ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                      ) : (
                        <span className="ml-auto text-xs text-amber-600">Contains {key}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                  ⚠️ Allergen compatibility not verified — contact restaurant before ordering.
                </p>
              )}
            </div>
          </Card>

          {/* Menu highlights */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Menu Highlights</h3>
            <div className="space-y-2">
              {menuHighlights.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cuisineTags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full capitalize">{tag}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="mt-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Why This Restaurant Scored as It Did</h3>
              <p className="text-sm text-gray-700 mb-4">{explanation.summary}</p>

              {explanation.positives?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Strengths</h4>
                  <div className="space-y-2">
                    {explanation.positives.map((pos: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {pos}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {explanation.negatives?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Weaknesses</h4>
                  <div className="space-y-2">
                    {explanation.negatives.map((neg: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {neg}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {eventId && (
          <div className="mt-6">
            <Link href={`/recommendations/${eventId}`}>
              <Button variant="secondary" className="w-full">
                <ChevronLeft className="w-4 h-4" />
                Back to All Recommendations
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
