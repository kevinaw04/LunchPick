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
  Users, Calendar, MapPin, DollarSign, Copy, RefreshCw,
  Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  ChevronRight, Leaf, Clock, ExternalLink
} from "lucide-react";
import { formatDate, formatCurrency, isEventPast } from "@/lib/utils";

function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DashboardPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "participants" | "analytics">("overview");

  const fetchEvent = useCallback(async () => {
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

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  async function calculateRecommendations() {
    setCalculating(true);
    try {
      await fetch(`/api/events/${params.eventId}/recommend`, { method: "POST" });
      await fetchEvent();
      router.push(`/recommendations/${params.eventId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  }

  function copyInviteLink() {
    if (!event) return;
    const url = `${window.location.origin}/survey/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyCode() {
    if (!event) return;
    navigator.clipboard.writeText(event.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading dashboard...</p>
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
          <a href="/" className="text-blue-600 hover:underline">Go home</a>
        </div>
      </div>
    );
  }

  const participants = event.participants || [];
  const scores = event.restaurantScores || [];
  const hasScores = scores.length > 0;
  const topScore = scores[0];
  const isPast = isEventPast(event.eventDate);

  // Analytics
  const allPrefs = participants.flatMap((p: any) => p.preferences);
  const dietaryRestrictions = allPrefs.filter((p: any) => p.type === "DIETARY_RESTRICTION");
  const favorites = allPrefs.filter((p: any) => p.type === "FAVORITE");
  const noGos = allPrefs.filter((p: any) => p.type === "NO_GO");
  const dislikes = allPrefs.filter((p: any) => p.type === "DISLIKE");

  // Count cuisine mentions
  const cuisineCounts: Record<string, { like: number; dislike: number }> = {};
  allPrefs.forEach((p: any) => {
    if (p.type === "DIETARY_RESTRICTION") return;
    const cuisine = p.value;
    if (!cuisineCounts[cuisine]) cuisineCounts[cuisine] = { like: 0, dislike: 0 };
    if (p.type === "LIKE" || p.type === "FAVORITE") cuisineCounts[cuisine].like++;
    if (p.type === "DISLIKE" || p.type === "NO_GO") cuisineCounts[cuisine].dislike++;
  });

  const topCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1].like - a[1].like)[0];
  const mostDisliked = Object.entries(cuisineCounts).sort((a, b) => b[1].dislike - a[1].dislike)[0];

  const budget = event.budgetTotal || (event.budgetPerPerson ? event.budgetPerPerson * event.headcount : null);
  const budgetPerPerson = event.budgetPerPerson || (event.budgetTotal ? event.budgetTotal / event.headcount : null);

  const dietaryRestrictionsUnique = [...new Set(dietaryRestrictions.map((p: any) => p.value))];
  const participantsWithRestrictions = participants.filter(
    (p: any) => p.preferences.some((pref: any) => pref.type === "DIETARY_RESTRICTION")
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            {isPast && (
              <Badge variant="warning" className="mb-2">
                <Clock className="w-3 h-3 mr-1" />
                This event has passed
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(event.eventDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {event.locationName} · {event.zipCode}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {event.headcount} expected
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={copyCode} size="sm">
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : `Code: ${event.code}`}
            </Button>
            <Button variant="secondary" onClick={copyInviteLink} size="sm">
              <ExternalLink className="w-3.5 h-3.5" />
              Copy Link
            </Button>
            <Button onClick={calculateRecommendations} loading={calculating} size="sm">
              <RefreshCw className="w-3.5 h-3.5" />
              {hasScores ? "Recalculate" : "Get Recommendations"}
            </Button>
          </div>
        </div>

        {/* Invite banner */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 mb-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-lg mb-1">📣 Invite your group</div>
            <div className="text-blue-100 text-sm">Share the code <strong className="text-white">{event.code}</strong> or send the direct survey link</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyInviteLink}
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all border border-white/30 flex items-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Survey Link
            </button>
            <Link
              href={`/survey/${event.id}`}
              className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              target="_blank"
            >
              Open Survey
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Responses"
            value={participants.length}
            icon={<Users className="w-5 h-5" />}
            sub={`of ${event.headcount} expected`}
          />
          <StatCard
            label="Dietary Needs"
            value={participantsWithRestrictions}
            icon={<AlertTriangle className="w-5 h-5" />}
            sub={participantsWithRestrictions > 0 ? dietaryRestrictionsUnique.slice(0, 2).join(", ") : "None reported"}
          />
          <StatCard
            label="Budget"
            value={budget ? formatCurrency(budget) : "—"}
            icon={<DollarSign className="w-5 h-5" />}
            sub={budgetPerPerson ? `${formatCurrency(budgetPerPerson)}/person` : "No budget set"}
          />
          <StatCard
            label="Top Recommendation"
            value={topScore ? `${Math.round(topScore.totalScore)}/100` : "—"}
            icon={<Star className="w-5 h-5" />}
            sub={topScore ? topScore.restaurant.name : "Run to calculate"}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(["overview", "participants", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top recommendation preview */}
            <div className="lg:col-span-2 space-y-4">
              {hasScores ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Restaurant Recommendations</h2>
                    <Link
                      href={`/recommendations/${params.eventId}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {scores.slice(0, 3).map((score: any, i: number) => {
                    const r = score.restaurant;
                    const isTop = i === 0;
                    const isSelected = event.selectedRestaurant?.restaurantId === r.id;
                    return (
                      <div
                        key={score.id}
                        className={`bg-white rounded-2xl border-2 p-5 transition-all ${
                          isTop ? "border-green-300 shadow-md" : "border-gray-100 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{r.imageEmoji}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{r.name}</h3>
                                {isTop && <Badge variant="success">Top Pick 🏆</Badge>}
                                {isSelected && <Badge variant="info">Selected ✓</Badge>}
                              </div>
                              <div className="text-sm text-gray-500">{r.cuisine} · {r.distanceMiles}mi</div>
                            </div>
                          </div>
                          <div className={`text-right flex-shrink-0`}>
                            <div className={`text-2xl font-bold ${isTop ? "text-green-600" : "text-gray-700"}`}>
                              {Math.round(score.totalScore)}
                            </div>
                            <div className="text-xs text-gray-400">/ 100</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <ProgressBar value={score.totalScore} max={100} color={isTop ? "green" : "blue"} />
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <span>{score.compatibleCount}/{score.totalParticipants} satisfied ({score.satisfactionPct}%)</span>
                          <span>{formatCurrency(r.avgCostPerPerson)}/person</span>
                          {r.deliveryAvailable && <span className="text-green-600">🚚 Delivery</span>}
                          {r.cateringAvailable && <span className="text-purple-600">🍽️ Catering</span>}
                        </div>
                      </div>
                    );
                  })}

                  <Link
                    href={`/recommendations/${params.eventId}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-2xl transition-all text-sm"
                  >
                    View Full Rankings & Explanations
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <Card className="text-center py-10">
                  <div className="text-5xl mb-4">🏆</div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">No recommendations yet</h2>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                    {participants.length === 0
                      ? "Waiting for participants to respond. Share the event code to get started."
                      : `${participants.length} response${participants.length > 1 ? "s" : ""} collected. Click below to run the recommendation engine.`}
                  </p>
                  <Button onClick={calculateRecommendations} loading={calculating} size="lg">
                    <RefreshCw className="w-4 h-4" />
                    Calculate Recommendations
                  </Button>
                </Card>
              )}
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {/* Event details card */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-right">{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Radius</span>
                    <span className="font-medium">{event.radiusMiles} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fulfillment</span>
                    <span className="font-medium text-right">
                      {[event.allowDelivery && "Delivery", event.allowPickup && "Pickup", event.allowCatering && "Catering"].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  {budget && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Budget</span>
                      <span className="font-medium">{formatCurrency(budget)}</span>
                    </div>
                  )}
                  {event.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-500 italic text-xs">"{event.notes}"</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Dietary summary */}
              {dietaryRestrictionsUnique.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Dietary Restrictions
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {dietaryRestrictionsUnique.map((r: string) => (
                      <Badge key={r} variant="warning">{r}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {participantsWithRestrictions} participant{participantsWithRestrictions !== 1 ? "s" : ""} reported restrictions
                  </p>
                </Card>
              )}

              {/* Quick actions */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={calculateRecommendations}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      {hasScores ? "Recalculate" : "Get Recommendations"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {hasScores && (
                    <Link
                      href={`/recommendations/${params.eventId}`}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        View Recommendations
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={`/survey/${event.id}`}
                    target="_blank"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Open Survey
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/leftovers/${event.id}`}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      Leftover Donation
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === "participants" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Responses ({participants.length} / {event.headcount})
              </h2>
              <Link
                href={`/survey/${event.id}`}
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Open Survey <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mb-4">
              <ProgressBar
                value={participants.length}
                max={event.headcount}
                color="blue"
                showLabel
              />
              <p className="text-xs text-gray-400 mt-1">
                {event.headcount - participants.length} more expected
              </p>
            </div>

            {participants.length === 0 ? (
              <Card className="text-center py-10">
                <div className="text-4xl mb-3">👋</div>
                <p className="text-gray-500">No responses yet. Share the event code: <strong>{event.code}</strong></p>
              </Card>
            ) : (
              <div className="space-y-3">
                {participants.map((p: any) => {
                  const dietary = p.preferences.filter((pref: any) => pref.type === "DIETARY_RESTRICTION");
                  const favs = p.preferences.filter((pref: any) => pref.type === "FAVORITE");
                  const noGo = p.preferences.filter((pref: any) => pref.type === "NO_GO");
                  return (
                    <Card key={p.id} padding="sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-400">{new Date(p.updatedAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {p.isFlexible && <Badge variant="success" size="sm">Flexible</Badge>}
                          {dietary.map((d: any) => (
                            <Badge key={d.id} variant="danger" size="sm">{d.value}</Badge>
                          ))}
                        </div>
                      </div>
                      {(favs.length > 0 || noGo.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                          {favs.map((f: any) => (
                            <span key={f.id} className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">❤️ {f.value}</span>
                          ))}
                          {noGo.map((n: any) => (
                            <span key={n.id} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🚫 {n.value}</span>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Most Popular Cuisines
              </h3>
              {Object.entries(cuisineCounts).filter(([, v]) => v.like > 0).sort((a, b) => b[1].like - a[1].like).slice(0, 7).map(([cuisine, counts]) => (
                <div key={cuisine} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{cuisine}</span>
                    <span className="text-green-600 font-medium">{counts.like}</span>
                  </div>
                  <ProgressBar value={counts.like} max={participants.length || 1} color="green" />
                </div>
              ))}
              {Object.values(cuisineCounts).every(v => v.like === 0) && (
                <p className="text-gray-400 text-sm">No cuisine preferences recorded yet.</p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Most Disliked
              </h3>
              {Object.entries(cuisineCounts).filter(([, v]) => v.dislike > 0).sort((a, b) => b[1].dislike - a[1].dislike).slice(0, 7).map(([cuisine, counts]) => (
                <div key={cuisine} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{cuisine}</span>
                    <span className="text-red-600 font-medium">{counts.dislike}</span>
                  </div>
                  <ProgressBar value={counts.dislike} max={participants.length || 1} color="red" />
                </div>
              ))}
              {Object.values(cuisineCounts).every(v => v.dislike === 0) && (
                <p className="text-gray-400 text-sm">No dislikes recorded yet.</p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Dietary Restrictions Summary
              </h3>
              {dietaryRestrictionsUnique.length > 0 ? (
                <div className="space-y-3">
                  {dietaryRestrictionsUnique.map((r: string) => {
                    const count = dietaryRestrictions.filter((d: any) => d.value === r).length;
                    return (
                      <div key={r} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{r}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{count} person{count > 1 ? "s" : ""}</span>
                          <Badge variant="danger" size="sm">{r}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No dietary restrictions reported. 🎉</p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Group Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Response rate</div>
                  <ProgressBar value={participants.length} max={event.headcount} color="blue" showLabel />
                  <p className="text-xs text-gray-400 mt-1">{participants.length} of {event.headcount} expected</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-bold text-gray-900">{favorites.length}</div>
                    <div className="text-xs text-gray-500">Favorite mentions</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-bold text-gray-900">{noGos.length}</div>
                    <div className="text-xs text-gray-500">No-go mentions</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-bold text-gray-900">{dietaryRestrictionsUnique.length}</div>
                    <div className="text-xs text-gray-500">Unique restrictions</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg font-bold text-gray-900">
                      {participants.filter((p: any) => p.isFlexible).length}
                    </div>
                    <div className="text-xs text-gray-500">Flexible eaters</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
