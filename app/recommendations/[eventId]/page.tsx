"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Trophy, Star, TrendingUp, AlertTriangle, CheckCircle2,
  Truck, Building2, ShoppingBag, DollarSign, MapPin,
  Users, ChevronLeft, RefreshCw, Leaf, Info
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function ScoreBar({ label, value, color }: { label: string; value: number; color: "green" | "blue" | "amber" | "purple" }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{Math.round(value)}</span>
      </div>
      <ProgressBar value={value} max={100} color={color} size="sm" />
    </div>
  );
}

export default function RecommendationsPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${params.eventId}`);
      const data = await res.json();
      setEvent(data.event);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [params.eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function recalculate() {
    setCalculating(true);
    try {
      await fetch(`/api/events/${params.eventId}/recommend`, { method: "POST" });
      await fetchEvent();
    } finally {
      setCalculating(false);
    }
  }

  async function selectRestaurant(restaurantId: string) {
    setSelectingId(restaurantId);
    try {
      await fetch(`/api/events/${params.eventId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      await fetchEvent();
    } finally {
      setSelectingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  const scores = event.restaurantScores || [];
  const participants = event.participants || [];
  const selectedId = event.selectedRestaurant?.restaurantId;
  const budget = event.budgetTotal || (event.budgetPerPerson ? event.budgetPerPerson * event.headcount : null);

  const topScores = scores.slice(0, 5);
  const hasPerfectMatch = topScores.some((s: any) => s.totalScore >= 80 && s.compatibleCount === s.totalParticipants);
  const topScore = scores[0];
  const allOverBudget = budget && topScores.every((s: any) => s.restaurant.avgCostPerPerson * event.headcount > budget);
  const allHaveDietaryConflicts = topScores.length > 0 && topScores.every((s: any) => s.compatibleCount < s.totalParticipants);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/dashboard/${params.eventId}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Restaurant Recommendations</h1>
            <p className="text-gray-500">{event.name} · {participants.length} participant{participants.length !== 1 ? "s" : ""} scored</p>
          </div>
          <Button variant="secondary" onClick={recalculate} loading={calculating} size="sm">
            <RefreshCw className="w-3.5 h-3.5" />
            Recalculate
          </Button>
        </div>

        {/* No scores state */}
        {scores.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No recommendations yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {participants.length === 0
                ? "No participants have submitted preferences yet."
                : "Click recalculate to run the recommendation engine."}
            </p>
            <Button onClick={recalculate} loading={calculating}>
              <RefreshCw className="w-4 h-4" />
              Calculate Now
            </Button>
          </Card>
        )}

        {/* No perfect match warning */}
        {scores.length > 0 && !hasPerfectMatch && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">No perfect match found</h3>
                <p className="text-sm text-amber-700 mb-3">
                  No single restaurant satisfies all dietary restrictions for every participant. Here are some alternatives:
                </p>
                <div className="space-y-1.5">
                  {[
                    allOverBudget && "💰 Increase the group budget or budget per person",
                    event.radiusMiles < 10 && "📍 Expand the search radius beyond " + event.radiusMiles + " miles",
                    !event.allowCatering && "🍽️ Enable catering for more restaurant options",
                    !event.allowDelivery && !event.allowPickup && "🚚 Allow delivery or pickup fulfillment",
                    allHaveDietaryConflicts && "🤝 Consider ordering from two different restaurants",
                  ].filter(Boolean).map((suggestion, i) => (
                    <p key={i} className="text-sm text-amber-700">• {suggestion}</p>
                  ))}
                  <p className="text-sm text-amber-700">• Best option: the restaurant below satisfies the most participants</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected restaurant banner */}
        {selectedId && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">
                {scores.find((s: any) => s.restaurantId === selectedId)?.restaurant?.name} has been selected!
              </h3>
              <p className="text-sm text-green-700 mt-0.5">
                The group is ordering from this restaurant. Head to the{" "}
                <Link href={`/leftovers/${event.id}`} className="underline font-medium">leftover donation page</Link>{" "}
                after lunch to log any extras.
              </p>
            </div>
          </div>
        )}

        {/* Budget summary */}
        {budget && topScore && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Group Budget",
                value: formatCurrency(budget),
                sub: `${formatCurrency(budget / event.headcount)}/person`,
                color: "text-gray-900",
                bg: "bg-white",
              },
              {
                label: "Top Pick Cost",
                value: formatCurrency(topScore.restaurant.avgCostPerPerson * event.headcount),
                sub: `${formatCurrency(topScore.restaurant.avgCostPerPerson)}/person`,
                color: topScore.restaurant.avgCostPerPerson * event.headcount > budget ? "text-red-600" : "text-green-600",
                bg: topScore.restaurant.avgCostPerPerson * event.headcount > budget ? "bg-red-50" : "bg-green-50",
              },
              {
                label: topScore.restaurant.avgCostPerPerson * event.headcount > budget ? "Over Budget" : "Budget Remaining",
                value: formatCurrency(Math.abs(budget - topScore.restaurant.avgCostPerPerson * event.headcount)),
                sub: topScore.restaurant.avgCostPerPerson * event.headcount > budget ? "Exceeds limit" : "Under budget",
                color: topScore.restaurant.avgCostPerPerson * event.headcount > budget ? "text-red-600" : "text-blue-600",
                bg: topScore.restaurant.avgCostPerPerson * event.headcount > budget ? "bg-red-50" : "bg-blue-50",
              },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-2xl border border-gray-100 p-4 text-center`}>
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-sm font-medium text-gray-700">{item.label}</div>
                <div className="text-xs text-gray-400">{item.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Restaurant cards */}
        <div className="space-y-4">
          {topScores.map((score: any, i: number) => {
            const r = score.restaurant;
            const isTop = i === 0;
            const isSelected = selectedId === r.id;
            const isExpanded = expandedId === score.id;
            const explanation = JSON.parse(score.explanation || "{}");
            const groupCost = r.avgCostPerPerson * event.headcount;
            const isOverBudget = budget && groupCost > budget;
            const dietaryOptions: string[] = JSON.parse(r.dietaryOptions || "[]");
            const allergenInfo = JSON.parse(r.allergenInfo || "{}");

            return (
              <div
                key={score.id}
                className={`bg-white rounded-3xl border-2 overflow-hidden transition-all ${
                  isSelected
                    ? "border-green-400 shadow-lg"
                    : isTop
                    ? "border-blue-300 shadow-lg"
                    : "border-gray-100 shadow-sm"
                }`}
              >
                {/* Card header */}
                <div className={`px-6 py-4 ${isTop && !isSelected ? "bg-gradient-to-r from-blue-50 to-indigo-50" : isSelected ? "bg-gradient-to-r from-green-50 to-emerald-50" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="text-4xl">{r.imageEmoji}</div>
                        {isTop && !isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Trophy className="w-3 h-3 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-gray-900">{r.name}</h2>
                          {isSelected && <Badge variant="success">Selected ✓</Badge>}
                          {isTop && !isSelected && <Badge variant="default">Top Pick 🏆</Badge>}
                          {isOverBudget && <Badge variant="danger">Over Budget</Badge>}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {r.cuisine} · {r.distanceMiles} mi · ⭐ {r.rating}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`text-3xl font-black ${isTop ? "text-blue-600" : "text-gray-700"}`}>
                        {Math.round(score.totalScore)}
                      </div>
                      <div className="text-xs text-gray-400">/ 100</div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Score bar */}
                  <div className="mb-4">
                    <ProgressBar
                      value={score.totalScore}
                      max={100}
                      color={isSelected ? "green" : isTop ? "blue" : "blue"}
                      size="md"
                    />
                  </div>

                  {/* Key metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className={`rounded-xl p-3 text-center ${isOverBudget ? "bg-red-50" : "bg-green-50"}`}>
                      <div className={`text-lg font-bold ${isOverBudget ? "text-red-700" : "text-green-700"}`}>
                        {formatCurrency(r.avgCostPerPerson)}
                      </div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${isOverBudget ? "bg-red-50" : "bg-blue-50"}`}>
                      <div className={`text-lg font-bold ${isOverBudget ? "text-red-700" : "text-blue-700"}`}>
                        {formatCurrency(groupCost)}
                      </div>
                      <div className="text-xs text-gray-500">group total</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-purple-700">
                        {score.compatibleCount}/{score.totalParticipants}
                      </div>
                      <div className="text-xs text-gray-500">satisfied</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-amber-700">{score.satisfactionPct}%</div>
                      <div className="text-xs text-gray-500">satisfaction</div>
                    </div>
                  </div>

                  {/* Fulfillment badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.deliveryAvailable && (
                      <span className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                        <Truck className="w-3 h-3" /> Delivery
                      </span>
                    )}
                    {r.pickupAvailable && (
                      <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                        <ShoppingBag className="w-3 h-3" /> Pickup
                      </span>
                    )}
                    {r.cateringAvailable && (
                      <span className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium">
                        <Building2 className="w-3 h-3" /> Catering {r.cateringMinPeople > 0 ? `(${r.cateringMinPeople}+)` : ""} · Good for groups
                      </span>
                    )}
                    {dietaryOptions.map((opt: string) => (
                      <span key={opt} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-full font-medium capitalize">
                        {opt}
                      </span>
                    ))}
                  </div>

                  {/* Explanation summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-700 font-medium mb-3">{explanation.summary}</p>

                    {explanation.positives?.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {explanation.positives.slice(0, 4).map((pos: string, idx: number) => (
                          <p key={idx} className="text-sm text-green-700 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            {pos}
                          </p>
                        ))}
                      </div>
                    )}

                    {explanation.negatives?.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {explanation.negatives.slice(0, 3).map((neg: string, idx: number) => (
                          <p key={idx} className="text-sm text-red-600 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            {neg}
                          </p>
                        ))}
                      </div>
                    )}

                    {explanation.warnings?.length > 0 && (
                      <div className="space-y-1">
                        {explanation.warnings.map((w: string, idx: number) => (
                          <p key={idx} className="text-xs text-amber-700 flex items-start gap-1.5 bg-amber-50 rounded-lg p-2">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            {w}
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {explanation.allergenNote}
                    </p>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h4>
                      <div className="space-y-2">
                        <ScoreBar label="Dietary Compatibility" value={score.dietaryScore} color="green" />
                        <ScoreBar label="Preference Match" value={score.preferenceScore} color="blue" />
                        <ScoreBar label="Budget Fit" value={score.budgetScore} color="amber" />
                        <ScoreBar label="Logistics & Distance" value={score.logisticsScore} color="purple" />
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Menu Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(r.menuHighlights || "[]").map((item: string) => (
                            <span key={item} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{item}</span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {r.address}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : score.id)}
                      className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      {isExpanded ? "Show less ▲" : "See breakdown ▼"}
                    </button>
                    <Link
                      href={`/restaurant/${r.id}?eventId=${params.eventId}`}
                      className="flex-1 text-center text-sm text-blue-600 hover:text-blue-700 py-2 rounded-xl hover:bg-blue-50 transition-all font-medium"
                    >
                      View Details
                    </Link>
                    {!isSelected && (
                      <Button
                        size="sm"
                        variant={isTop ? "primary" : "outline"}
                        onClick={() => selectRestaurant(r.id)}
                        loading={selectingId === r.id}
                      >
                        {isTop ? "✓ Select This" : "Select"}
                      </Button>
                    )}
                    {isSelected && (
                      <Button size="sm" variant="secondary" onClick={() => selectRestaurant(r.id)}>
                        ✓ Selected
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All scores — remaining list */}
        {scores.length > 5 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">All other restaurants</h3>
            <div className="space-y-2">
              {scores.slice(5).map((score: any) => {
                const r = score.restaurant;
                const groupCost = r.avgCostPerPerson * event.headcount;
                const isOverBudget = budget && groupCost > budget;
                return (
                  <div key={score.id} className={`bg-white rounded-xl border px-4 py-3 flex items-center justify-between gap-4 ${isOverBudget ? "border-red-100" : "border-gray-100"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.imageEmoji}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{r.name}</div>
                        <div className="text-xs text-gray-400">{r.cuisine} · {r.distanceMiles}mi · {formatCurrency(r.avgCostPerPerson)}/person</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isOverBudget && <Badge variant="danger" size="sm">Over budget</Badge>}
                      <div className="text-right">
                        <div className="font-bold text-gray-700">{Math.round(score.totalScore)}</div>
                        <div className="text-xs text-gray-400">{score.satisfactionPct}%</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => selectRestaurant(r.id)}>
                        Select
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href={`/dashboard/${params.eventId}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href={`/leftovers/${params.eventId}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Leaf className="w-4 h-4" />
              Plan Leftover Donation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
