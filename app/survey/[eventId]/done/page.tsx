"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";

export default function SurveyDonePage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/events/${params.eventId}`)
      .then((r) => r.json())
      .then((d) => setEvent(d.event));
  }, [params.eventId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">You're all set! 🎉</h1>
        <p className="text-gray-500 mb-2 text-lg">
          Your preferences have been submitted successfully.
        </p>
        {event && (
          <p className="text-gray-400 text-sm mb-8">
            {event.participants?.length || 0} people have responded so far for <span className="font-medium text-gray-600">{event.name}</span>.
          </p>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="text-4xl mb-3">🍽️</div>
          <h2 className="font-semibold text-gray-900 mb-1">What happens next?</h2>
          <p className="text-sm text-gray-500">
            Once everyone has responded, the organizer will run the recommendation engine to find the best restaurant for the group.
            Keep an eye out for their announcement!
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/survey/${params.eventId}`}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-gray-700 font-medium rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-sm"
          >
            Update my preferences
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-sm"
          >
            Back to home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
