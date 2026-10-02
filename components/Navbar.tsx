"use client";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          LunchPick
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/join"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            Join Event
          </Link>
          <Link
            href="/create"
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            Create Event
          </Link>
        </div>
      </div>
    </nav>
  );
}
