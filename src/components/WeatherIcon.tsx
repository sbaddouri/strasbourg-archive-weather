"use client";

import { useState, useRef, useEffect } from "react";
import { getWeatherIcon, calculateHourlySunshineWithDaylight, isHourBetweenSunriseAndSunset } from "@/lib/weather-colors";

interface WeatherIconProps {
  weatherCode: number;
  time?: string;
  sunrise?: string | null;
  sunset?: string | null;
  className?: string;
  alt?: string;
  title?: string;
}

function WeatherIconTooltip({ 
  weatherCode, 
  time, 
  sunrise, 
  sunset, 
  imagePath, 
  description,
  isDaytime,
  isHovered,
  mousePosition
}: { 
  weatherCode: number;
  time?: string;
  sunrise?: string | null;
  sunset?: string | null;
  imagePath: string | null;
  description: string;
  isDaytime: boolean;
  isHovered: boolean;
  mousePosition: { x: number; y: number };
}) {
  // Calculate estimated sunshine for this hour - uses the accurate function with solar elevation
  const hasSunData = time && sunrise && sunset;
  const hourlySunshine = hasSunData ? calculateHourlySunshineWithDaylight(weatherCode, time, sunrise, sunset) : 0;
  const isSunUp = hasSunData ? isHourBetweenSunriseAndSunset(time, sunrise, sunset) : false;
  const sunshineDisplay = isSunUp ? `${hourlySunshine} min` : "Nuit";

  if (!isHovered) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ 
        left: mousePosition.x + 15, 
        top: mousePosition.y + 15,
      }}
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 min-w-[320px]">
        <div className="flex items-center gap-2">
          {imagePath ? (
            <img src={imagePath} alt={description} className="h-10 w-10 object-contain" />
          ) : (
            <span className="h-10 w-10 inline-block" aria-hidden="true"></span>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {isDaytime ? "☀️ Jour" : "🌙 Nuit"}
            </span>
            {hasSunData && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Ensoleillement estimé: {sunshineDisplay}
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-normal break-words">
              {description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeatherIcon({ weatherCode, time, sunrise, sunset, className = "h-5 w-5", alt = "", title = "" }: WeatherIconProps) {
  const { imagePath, description } = getWeatherIcon(weatherCode, time, sunrise, sunset);
  
  // Determine if it's daytime for this specific hour
  const isDaytime = time && sunrise && sunset ? isHourBetweenSunriseAndSunset(time, sunrise, sunset) : false;

  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (imagePath) {
    return (
      <span 
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={imagePath}
          alt={alt || description}
          title={title || description}
          className={className}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = document.createElement("span");
              fallback.className = className;
              fallback.setAttribute("aria-hidden", "true");
              parent.appendChild(fallback);
            }
          }}
        />
        <WeatherIconTooltip
          weatherCode={weatherCode}
          time={time}
          sunrise={sunrise}
          sunset={sunset}
          imagePath={imagePath}
          description={description}
          isDaytime={isDaytime}
          isHovered={isHovered}
          mousePosition={mousePosition}
        />
      </span>
    );
  }

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <span className={className} title={title || description} aria-hidden="true"></span>
      <WeatherIconTooltip
        weatherCode={weatherCode}
        time={time}
        sunrise={sunrise}
        sunset={sunset}
        imagePath={null}
        description={description}
        isDaytime={isDaytime}
        isHovered={isHovered}
        mousePosition={mousePosition}
      />
    </span>
  );
}

interface DailyWeatherIconProps {
  weatherCode: number;
  className?: string;
  alt?: string;
  title?: string;
}

export function DailyWeatherIcon({ weatherCode, className = "h-8 w-8", alt = "", title = "" }: DailyWeatherIconProps) {
  const { imagePath, description } = getWeatherIcon(weatherCode);

  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={alt || description}
        title={title || description}
        className={className}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const fallback = document.createElement("span");
            fallback.className = className;
            fallback.setAttribute("aria-hidden", "true");
            parent.appendChild(fallback);
          }
        }}
      />
    );
  }

  return <span className={className} title={title || description} aria-hidden="true"></span>;
}