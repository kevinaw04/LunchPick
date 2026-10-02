"use client";
import { Suspense } from "react";
import RestaurantDetailContent from "./RestaurantDetailContent";

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RestaurantDetailContent id={params.id} />
    </Suspense>
  );
}
