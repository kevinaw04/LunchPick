"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, X, Plus, ChevronRight, AlertTriangle, User, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";

const DIETARY_OPTIONS = [
  { id: "Vegetarian", label: "🥦 Vegetarian" },
  { id: "Vegan", label: "🌱 Vegan" },
  { id: "Gluten-free", label: "🌾 Gluten-free" },
  { id: "Dairy-free", label: "🥛 Dairy-free" },
  { id: "Nut allergy", label: "🥜 Nut allergy" },
  { id: "Halal", label: "☪️ Halal" },
  { id: "Kosher", label: "✡️ Kosher" },
];

const CUISINE_OPTIONS = [
  "Pizza", "Mexican", "Burgers", "Mediterranean", "Indian",
  "Chinese", "Thai", "Japanese", "Sandwiches", "Salads", "BBQ", "Italian",
];

type PreferenceType = "DIETARY_RESTRICTION" | "NO_GO" | "DISLIKE" | "LIKE" | "FAVORITE";

interface Preference {
  type: PreferenceType;
  value: string;
}

interface CuisineRating {
  cuisine: string;
  type: "FAVORITE" | "LIKE" | "DISLIKE" | "NO_GO" | null;
}

const RATING_CONFIG: { type: "FAVORITE" | "LIKE" | "DISLIKE" | "NO_GO"; label: string; color: string; bg: string; border: string }[] = [
  { type: "FAVORITE", label: "❤️ Favorite", color: "text-pink-700", bg: "bg-pink-100", border: "border-pink-400" },
  { type: "LIKE", label: "👍 Like", color: "text-green-700", bg: "bg-green-100", border: "border-green-400" },
  { type: "DISLIKE", label: "👎 Dislike", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-400" },
  { type: "NO_GO", label: "🚫 No-go", color: "text-red-700", bg: "bg-red-100", border: "border-red-400" },
];

export default function SurveyPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"name" | "dietary" | "cuisines" | "custom" | "review">("name");

  // Form state
  const [name, setName] = useState("");
  const [isFlexible, setIsFlexible] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<Set<string>>(new Set());
  const [customDietary, setCustomDietary] = useState("");
  const [cuisineRatings, setCuisineRatings] = useState<CuisineRating[]>(
    CUISINE_OPTIONS.map((c) => ({ cuisine: c, type: null }))
  );
  const [customItems, setCustomItems] = useState<{ value: string; type: PreferenceType }[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [customType, setCustomType] = useState<PreferenceType>("LIKE");

  useEffect(() => {
    fetch(`/api/events/${params.eventId}`)
      .then((r) => r.json())
      .then((d) => {
        setEvent(d.event);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.eventId]);

  function toggleDietary(id: string) {
    setSelectedDietary((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function rateCuisine(cuisine: string, type: CuisineRating["type"]) {
    setCuisineRatings((prev) =>
      prev.map((c) => c.cuisine === cuisine ? { ...c, type: c.type === type ? null : type } : c)
    );
  }

  function addCustomItem() {
    const val = customInput.trim();
    if (!val) return;
    setCustomItems((prev) => [...prev, { value: val, type: customType }]);
    setCustomInput("");
  }

  function removeCustom(idx: number) {
    setCustomItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function buildPreferences(): Preference[] {
    const prefs: Preference[] = [];

    // Dietary restrictions
    selectedDietary.forEach((d) => prefs.push({ type: "DIETARY_RESTRICTION", value: d }));
    if (customDietary.trim()) {
      prefs.push({ type: "DIETARY_RESTRICTION", value: customDietary.trim() });
    }

    // Cuisine ratings
    cuisineRatings.forEach((c) => {
      if (c.type) {
        prefs.push({ type: c.type, value: c.cuisine });
      }
    });

    // Custom items
    customItems.forEach((item) => prefs.push({ type: item.type, value: item.value }));

    // Resolve contradictions: NO_GO overrides everything else
    const noGos = new Set(prefs.filter((p) => p.type === "NO_GO").map((p) => p.value.toLowerCase()));
    return prefs.filter(
      (p) => p.type === "NO_GO" || !noGos.has(p.value.toLowerCase())
    );
  }

  async function submit() {
    if (!name.trim()) { setStep("name"); return; }
    setError("");
    setSubmitting(true);

    const preferences = buildPreferences();
    try {
      const res = await fetch(`/api/events/${params.eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), isFlexible, preferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      router.push(`/survey/${params.eventId}/done`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading event...</p>
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
          <p className="text-gray-500">This event doesn't exist or the link has expired.</p>
          <a href="/join" className="mt-4 inline-block text-blue-600 hover:underline">Try joining a different event</a>
        </div>
      </div>
    );
  }

  const steps = ["name", "dietary", "cuisines", "custom", "review"] as const;
  const stepIdx = steps.indexOf(step);
  const progress = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        {/* Event header */}
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Submitting preferences for</p>
              <h2 className="font-bold text-gray-900">{event.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{formatDate(event.eventDate)} · {event.locationName}</p>
            </div>
            <div className="text-2xl">🍽️</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Step {stepIdx + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {["Your name", "Dietary", "Cuisines", "More", "Review"].map((label, i) => (
              <div key={label} className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mb-1 ${i <= stepIdx ? "bg-blue-500" : "bg-gray-200"}`} />
                <span className={`text-xs ${i === stepIdx ? "text-blue-600 font-medium" : "text-gray-400"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step: Name */}
        {step === "name" && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">What's your name?</h2>
                <p className="text-sm text-gray-500">So the organizer knows who responded</p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("dietary")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base mb-6"
              autoFocus
            />

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all mb-6">
              <input
                type="checkbox"
                checked={isFlexible}
                onChange={(e) => setIsFlexible(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">🤷 I'm flexible — I eat almost anything!</div>
                <div className="text-sm text-gray-500 mt-0.5">You still have a chance to mark strong preferences below.</div>
              </div>
            </label>

            <Button
              onClick={() => setStep("dietary")}
              disabled={!name.trim()}
              className="w-full"
              size="lg"
            >
              Next: Dietary Restrictions
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Step: Dietary */}
        {step === "dietary" && (
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dietary Restrictions</h2>
                <p className="text-sm text-gray-500">These are hard constraints — restaurants unable to accommodate them won't be recommended.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleDietary(opt.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                    selectedDietary.has(opt.id)
                      ? "border-red-400 bg-red-50 text-red-800"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    selectedDietary.has(opt.id) ? "bg-red-500" : "border-2 border-gray-300"
                  }`}>
                    {selectedDietary.has(opt.id) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Other restriction (optional)</label>
              <input
                type="text"
                placeholder="e.g. Low-sodium, Diabetic-friendly..."
                value={customDietary}
                onChange={(e) => setCustomDietary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {selectedDietary.size === 0 && !customDietary && (
              <p className="text-sm text-gray-400 mb-4">
                ✅ No dietary restrictions — selecting none means you can eat anything.
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep("name")} className="flex-1">← Back</Button>
              <Button onClick={() => setStep("cuisines")} className="flex-1">
                Next: Cuisine Preferences →
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Cuisines */}
        {step === "cuisines" && (
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Rate your cuisines</h2>
                <p className="text-sm text-gray-500">Tap to rate each — skip ones you're neutral about.</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-2 flex-wrap mb-5 mt-3">
              {RATING_CONFIG.map((r) => (
                <span key={r.type} className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.bg} ${r.color}`}>
                  {r.label}
                </span>
              ))}
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                — Neutral (skip)
              </span>
            </div>

            <div className="space-y-2 mb-6">
              {cuisineRatings.map((item) => (
                <div key={item.cuisine} className="flex items-center gap-2">
                  <div className="w-28 text-sm font-medium text-gray-700 flex-shrink-0">{item.cuisine}</div>
                  <div className="flex gap-1 flex-1">
                    {RATING_CONFIG.map((rating) => (
                      <button
                        key={rating.type}
                        type="button"
                        onClick={() => rateCuisine(item.cuisine, rating.type)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          item.type === rating.type
                            ? `${rating.bg} ${rating.color} ${rating.border} border-2`
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {item.type === rating.type ? rating.label.split(" ")[0] : rating.type === "FAVORITE" ? "❤️" : rating.type === "LIKE" ? "👍" : rating.type === "DISLIKE" ? "👎" : "🚫"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep("dietary")} className="flex-1">← Back</Button>
              <Button onClick={() => setStep("custom")} className="flex-1">
                Next: More Preferences →
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Custom */}
        {step === "custom" && (
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Anything else?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add specific foods, ingredients, or cuisines not covered above.
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sushi, Spicy food, Pineapple..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {(["FAVORITE", "LIKE", "DISLIKE", "NO_GO"] as const).map((t) => {
                  const cfg = RATING_CONFIG.find((r) => r.type === t)!;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomType(t)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border-2 transition-all ${
                        customType === t ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-gray-100 text-gray-500 border-transparent"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {customItems.length > 0 && (
              <div className="space-y-2 mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</div>
                {customItems.map((item, i) => {
                  const cfg = RATING_CONFIG.find((r) => r.type === item.type)!;
                  return (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${cfg.bg}`}>
                      <span className={`text-sm font-medium ${cfg.color}`}>
                        {cfg.label.split(" ")[0]} {item.value}
                      </span>
                      <button type="button" onClick={() => removeCustom(i)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep("cuisines")} className="flex-1">← Back</Button>
              <Button onClick={() => setStep("review")} className="flex-1">
                Review & Submit →
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Review your preferences</h2>
                <span className="text-2xl">👀</span>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Your name</span>
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                </div>

                {isFlexible && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Flexibility</span>
                    <Badge variant="success">Flexible eater 🤷</Badge>
                  </div>
                )}

                {/* Dietary */}
                {(selectedDietary.size > 0 || customDietary) && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-sm text-gray-500 mb-2">Dietary restrictions</div>
                    <div className="flex gap-2 flex-wrap">
                      {[...selectedDietary].map((d) => (
                        <Badge key={d} variant="danger">{d}</Badge>
                      ))}
                      {customDietary && <Badge variant="danger">{customDietary}</Badge>}
                    </div>
                  </div>
                )}

                {/* Cuisines rated */}
                {cuisineRatings.filter((c) => c.type).length > 0 && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-sm text-gray-500 mb-2">Cuisine ratings</div>
                    <div className="flex gap-2 flex-wrap">
                      {cuisineRatings.filter((c) => c.type).map((c) => {
                        const cfg = RATING_CONFIG.find((r) => r.type === c.type)!;
                        return (
                          <span key={c.cuisine} className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                            {cfg.label.split(" ")[0]} {c.cuisine}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom items */}
                {customItems.length > 0 && (
                  <div className="py-2">
                    <div className="text-sm text-gray-500 mb-2">Other preferences</div>
                    <div className="flex gap-2 flex-wrap">
                      {customItems.map((item, i) => {
                        const cfg = RATING_CONFIG.find((r) => r.type === item.type)!;
                        return (
                          <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                            {cfg.label.split(" ")[0]} {item.value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {buildPreferences().length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-4">
                    No specific preferences set — you're a true team player! 🤝
                  </div>
                )}
              </div>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep("custom")} className="flex-1">← Edit</Button>
              <Button onClick={submit} loading={submitting} className="flex-1" size="lg">
                <CheckCircle2 className="w-4 h-4" />
                Submit Preferences
              </Button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Already submitted? Submitting again will update your previous response.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
