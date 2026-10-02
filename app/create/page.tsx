"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Calendar, MapPin, Users, DollarSign,
  Truck, ShoppingBag, Building2, StickyNote, ChevronRight
} from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    headcount: "10",
    locationName: "",
    zipCode: "",
    radiusMiles: "5",
    budgetMode: "total", // "total" | "perPerson"
    budgetTotal: "",
    budgetPerPerson: "",
    allowDelivery: true,
    allowPickup: true,
    allowCatering: false,
    notes: "",
  });

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.eventDate || !form.headcount || !form.locationName || !form.zipCode) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.allowDelivery && !form.allowPickup && !form.allowCatering) {
      setError("Please select at least one fulfillment method.");
      return;
    }

    const budget = form.budgetMode === "total"
      ? { budgetTotal: form.budgetTotal || null, budgetPerPerson: null }
      : { budgetTotal: null, budgetPerPerson: form.budgetPerPerson || null };

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...budget,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      router.push(`/dashboard/${data.event.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Set default datetime to tomorrow at noon
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  const defaultDateTime = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-3">
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">1</span>
            Step 1 of 1
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Lunch Event</h1>
          <p className="text-gray-500">Set up your event and get a shareable code to send to your group.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event basics */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Event Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Team Q4 Lunch, Friday Office Lunch"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  defaultValue={defaultDateTime}
                  onChange={(e) => update("eventDate", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Expected Headcount <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={form.headcount}
                  onChange={(e) => update("headcount", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Office, Main Campus"
                  value={form.locationName}
                  onChange={(e) => update("locationName", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="94105"
                    value={form.zipCode}
                    onChange={(e) => update("zipCode", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Search Radius (miles)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={form.radiusMiles}
                    onChange={(e) => update("radiusMiles", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Budget */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Budget
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                {[
                  { val: "total", label: "Total budget" },
                  { val: "perPerson", label: "Per person" },
                  { val: "none", label: "No budget" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => update("budgetMode", opt.val)}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                      form.budgetMode === opt.val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.budgetMode === "total" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Group Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="300"
                    value={form.budgetTotal}
                    onChange={(e) => update("budgetTotal", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
              {form.budgetMode === "perPerson" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Per Person ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="15"
                    value={form.budgetPerPerson}
                    onChange={(e) => update("budgetPerPerson", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Fulfillment */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              Fulfillment Methods
            </h2>
            <div className="space-y-3">
              {[
                { key: "allowDelivery", icon: <Truck className="w-4 h-4" />, label: "Delivery", desc: "Restaurant delivers to your location" },
                { key: "allowPickup", icon: <ShoppingBag className="w-4 h-4" />, label: "Pickup", desc: "Someone picks up from the restaurant" },
                { key: "allowCatering", icon: <Building2 className="w-4 h-4" />, label: "Catering", desc: "Catering setup for larger groups" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form[opt.key as keyof typeof form]
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[opt.key as keyof typeof form])}
                    onChange={(e) => update(opt.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`${form[opt.key as keyof typeof form] ? "text-blue-600" : "text-gray-400"}`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    form[opt.key as keyof typeof form] ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}>
                    {form[opt.key as keyof typeof form] && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-blue-500" />
              Event Notes <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </h2>
            <textarea
              placeholder="Any additional info for participants... (e.g. This is for our quarterly team celebration!)"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Create Event & Get Code
            <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
