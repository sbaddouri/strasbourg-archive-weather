"use client";

import dynamic from 'next/dynamic';

const WeatherBackgroundEffects = dynamic(() => import("./weather-background-effects"), {
  ssr: false,
  loading: () => null,
});

export default function WeatherBackgroundEffectsWrapper() {
  return <WeatherBackgroundEffects />;
}
