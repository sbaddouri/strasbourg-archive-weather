"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeatherCountdown from "@/components/weather-countdown";

export default function RadarPage() {
  return (
    <div className="space-y-8">
      <WeatherCountdown />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Radar Météorologique - strasbourg</h1>
        <p className="text-muted-foreground">
          Radar météorologique officiel de Meteo et Radar, couvrant un rayon de 100 km autour de strasbourg.
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ height: "80vh", minHeight: "650px" }}>
            <iframe
              src="https://www.meteoetradar.com/carte-meteo/strasbourg/11346395?center=48.5388708,7.6254456&placemark=48.5388708,7.6254456&layer=wr"
              title="Radar Météorologique strasbourg"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations d'utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ce radar météorologique officiel vous permet de visualiser en temps réel :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Pluie et précipitations
              </h3>
              <p className="text-sm text-muted-foreground">
                Détection de la pluie, averses et orages en temps réel.
              </p>
            </div>
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <h3 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2">
                Neige
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualisation des chutes de neige dans la région.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Couverture nuageuse
              </h3>
              <p className="text-sm text-muted-foreground">
                Pourcentage de nébulosité et type de nuages.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                Activité orageuse
              </h3>
              <p className="text-sm text-muted-foreground">
                Détection de la foudre et des orages.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-2">Conseils d'utilisation</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Utilisez les contrôles du radar pour zoomer/dézoomer</li>
              <li>Changez les couches de données avec les boutons du site</li>
              <li>Pour toute information officielle, consultez les services météorologiques nationaux</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


