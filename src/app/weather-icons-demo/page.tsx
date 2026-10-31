
import { getWeatherIcon } from "@/lib/weather-colors";

// Tous les codes WMO 0-99
const ALL_WEATHER_CODES = Array.from({ length: 100 }, (_, i) => i);

const TEST_SUNRISE = "2026-07-07T06:08";
const TEST_SUNSET = "2026-07-07T20:28";
const DAY_TIME = "2026-07-07T12:00";
const NIGHT_TIME = "2026-07-07T00:00";

export default function WeatherIconsDemo() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Démonstration des icônes météo</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Icônes de jour</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ALL_WEATHER_CODES.map((code) => {
              const { imagePath, description } = getWeatherIcon(
                code,
                DAY_TIME,
                TEST_SUNRISE,
                TEST_SUNSET
              );
              return (
                <div
                  key={`day-${code}`}
                  className="border rounded p-4 flex flex-col items-center gap-2 bg-card"
                >
                  {imagePath ? (
                    <img src={imagePath} alt={description} className="h-12 w-12 object-contain" />
                  ) : (
                    <span className="h-12 w-12 inline-block" aria-hidden="true"></span>
                  )}
                  <code className="text-sm font-semibold">Code WMO {code}</code>
                  <p className="text-xs text-center text-muted-foreground">{description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Icônes de nuit</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ALL_WEATHER_CODES.map((code) => {
              const { imagePath, description } = getWeatherIcon(
                code,
                NIGHT_TIME,
                TEST_SUNRISE,
                TEST_SUNSET
              );
              return (
                <div
                  key={`night-${code}`}
                  className="border rounded p-4 flex flex-col items-center gap-2 bg-card"
                >
                  {imagePath ? (
                    <img src={imagePath} alt={description} className="h-12 w-12 object-contain" />
                  ) : (
                    <span className="h-12 w-12 inline-block" aria-hidden="true"></span>
                  )}
                  <code className="text-sm font-semibold">Code WMO {code}</code>
                  <p className="text-xs text-center text-muted-foreground">{description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
