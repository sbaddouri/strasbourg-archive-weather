"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const WeatherMap = dynamic(() => import("@/components/weather-map"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />,
});

export default function HomeClient() {
  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Localisation de strasbourg</h2>
      </div>
      <WeatherMap />
    </section>
  );
}

