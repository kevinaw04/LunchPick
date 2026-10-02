"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Users, Zap, CheckCircle2, ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();

  async function loadDemo() {
    const res = await fetch("/api/demo");
    if (res.ok) {
      const { eventId } = await res.json();
      // trigger recommendations
      await fetch(`/api/events/${eventId}/recommend`, { method: "POST" });
      router.push(`/dashboard/${eventId}`);
    } else {
      alert("Demo not available. Please run the seed script first.");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍕</div>
          <div className="absolute top-20 right-20 text-7xl">🌯</div>
          <div className="absolute bottom-20 left-1/4 text-6xl">🥗</div>
          <div className="absolute bottom-10 right-1/3 text-8xl">🍜</div>
          <div className="absolute top-1/2 left-1/2 text-7xl">🍔</div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            Smart group lunch decisions in minutes
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
            Stop debating.<br />
            <span className="text-yellow-300">Start eating.</span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            LunchPick matches everyone's dietary needs, food preferences, and budget —
            then recommends the perfect restaurant for your whole group.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Create a Lunch Event
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-blue-500/40 transition-all border border-white/30"
            >
              Join with Event Code
            </Link>
          </div>

          <button
            onClick={loadDemo}
            className="mt-4 text-blue-200 hover:text-white text-sm underline underline-offset-2 transition-colors"
          >
            ✨ Load Demo Event (18 participants, 12 restaurants)
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">Three steps to a happy group lunch</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: "📋",
                title: "Create an event",
                desc: "Set your date, location, headcount, and budget. Get a shareable code instantly.",
              },
              {
                step: "2",
                icon: "🙋",
                title: "Everyone responds",
                desc: "Participants enter dietary needs, food likes, dislikes, and favorites — takes 2 minutes.",
              },
              {
                step: "3",
                icon: "🏆",
                title: "Get the best pick",
                desc: "Our algorithm scores every restaurant and explains exactly why one wins.",
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                  {item.step}
                </div>
                <div className="text-5xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for real groups</h2>
            <p className="text-gray-500 text-lg">Handles the messy reality of mixed dietary needs and strong opinions</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🚫", title: "Hard dietary constraints", desc: "Allergies and required restrictions always override preference scoring. No exceptions." },
              { icon: "⭐", title: "Weighted preferences", desc: "Favorites count more than likes. No-go foods count more than dislikes. Fair for everyone." },
              { icon: "💰", title: "Budget aware", desc: "Color-coded budget indicators. Automatically flags restaurants that exceed your limit." },
              { icon: "🚗", title: "Delivery & catering", desc: "Filter by delivery, pickup, or catering. Highlights group-friendly options." },
              { icon: "🧠", title: "Explained recommendations", desc: "Every ranking comes with plain-English explanations. You'll know exactly why #1 won." },
              { icon: "♻️", title: "Leftover donation", desc: "After lunch, find nearby food banks and shelters to donate unused food." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                <div className="text-2xl">{f.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{f.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample recommendation preview */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">See a recommendation in action</h2>
            <p className="text-gray-500">Real output from the LunchPick algorithm</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold text-lg">Top Pick — Mediterranean Grill</span>
              </div>
              <div className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">Score: 87/100</div>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🫒</div>
                  <div>
                    <div className="font-semibold text-gray-900">Mediterranean Grill</div>
                    <div className="text-sm text-gray-500">Mediterranean • 2.3 mi away</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="font-semibold text-green-800">$12.40/person</div>
                    <div className="text-green-600">Est. total: $248</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="font-semibold text-blue-800">18 / 20 ✓</div>
                    <div className="text-blue-600">Participants satisfied</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["Delivery ✓", "Catering ✓", "Vegan ✓", "Gluten-free ✓", "Halal ✓"].map(t => (
                    <span key={t} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Why this won</div>
                <div className="space-y-2">
                  {[
                    "✅ All 5 dietary restrictions accommodated",
                    "✅ 8 participants listed Mediterranean as a favorite or like",
                    "✅ Stays $52 under the $300 budget",
                    "✅ Catering available for 10+ people",
                    "⚠️ 2 participants slightly prefer Italian",
                  ].map(r => (
                    <div key={r} className="text-sm text-gray-600">{r}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-3xl font-bold text-white mb-4">Ready for your next group lunch?</h2>
          <p className="text-blue-200 mb-8">No signup required. Create your event and share the code.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={loadDemo}
              className="inline-flex items-center gap-2 bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-blue-400 transition-all border border-blue-400"
            >
              <Star className="w-5 h-5" />
              Load Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <UtensilsCrossed className="w-4 h-4" />
          <span>LunchPick — Smart group lunch decisions</span>
        </div>
        <p className="text-xs text-gray-300 mt-2">A rapid prototype for company events</p>
      </footer>
    </div>
  );
}
