import { getRecentDailyData, getUpdateStatus } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Sun, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import HomeClient from "@/components/home-client";
import WeatherCountdown from "@/components/weather-countdown";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentData = await getRecentDailyData(7);
  const latest = recentData[0];
  const updateStatus = await getUpdateStatus();

  // Dynamically get available years from data folder
  const dataPath = path.join(process.cwd(), "data", "daily");
  let availableYears: string[] = [];
  if (fs.existsSync(dataPath)) {
    availableYears = fs.readdirSync(dataPath).sort((a, b) => b.localeCompare(a));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "strasbourg Weather Archive",
    "description": "Archives météorologiques et climatologiques de strasbourg, France.",
    "url": "https://strasbourg-weather.vercel.app",
    "applicationCategory": "WeatherService",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "strasbourg",
      "addressRegion": "Grand Est",
      "addressCountry": "FR"
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          strasbourg <span className="text-primary">Archive</span> Weather
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez la climatologie détaillée de strasbourg, Grand Est, France. 
          Archives historiques, graphiques interactifs et statistiques précises.
        </p>
      </section>

      {/* Update Status Section */}
      {updateStatus && (
        <section className="w-full max-w-3xl mx-auto mb-8">
          <Card className={updateStatus.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              {updateStatus.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
              <CardTitle className="text-lg">
                {updateStatus.success ? "✅ Mise à jour réussie" : "⚠️ Échec de la mise à jour"}
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {format(parseISO(updateStatus.date), "d MMM yyyy HH:mm", { locale: fr })}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={updateStatus.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                {updateStatus.message}
              </p>

              {/* Status Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-muted-foreground block">Date initiale</span>
                  <span className="font-medium">{format(parseISO(updateStatus.initialStartDate), "d MMM", { locale: fr })}</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-muted-foreground block">Date finale</span>
                  <span className="font-medium">{format(parseISO(updateStatus.finalEndDate), "d MMM", { locale: fr })}</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-muted-foreground block">Jours mis à jour</span>
                  <span className="font-medium">{updateStatus.daysUpdated.length}</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-muted-foreground block">Tentatives</span>
                  <span className="font-medium">{updateStatus.attempts + 1}</span>
                </div>
              </div>

              {/* Missing Days */}
              {updateStatus.missingDays && updateStatus.missingDays.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">⚠️ Jours manquants ({updateStatus.missingDays.length})</h4>
                  <div className="text-sm text-amber-700 dark:text-amber-300 flex flex-wrap gap-1">
                    {updateStatus.missingDays.slice(0, 10).map((day) => (
                      <Badge key={day} variant="outline" className="bg-white dark:bg-gray-800">
                        {format(parseISO(day), "d MMM", { locale: fr })}
                      </Badge>
                    ))}
                    {updateStatus.missingDays.length > 10 && (
                      <span className="text-xs text-muted-foreground">+{updateStatus.missingDays.length - 10} autres</span>
                    )}
                  </div>
                </div>
              )}

              {/* Attempt Details */}
              {updateStatus.attemptDetails && updateStatus.attemptDetails.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Détails des tentatives</h4>
                  <div className="space-y-2">
                    {updateStatus.attemptDetails.map((attempt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        {attempt.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                        )}
                        <div>
                          <span className="font-medium">{format(parseISO(attempt.date), "d MMM yyyy", { locale: fr })}</span>
                          {!attempt.success && attempt.error && (
                            <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{attempt.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Countdown Section */}
      <WeatherCountdown />

      {/* Latest Weather Summary */}
      {latest && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dernière mise à jour</span>
                <Badge variant="outline">
                  {format(parseISO(latest.date), "d MMMM yyyy", { locale: fr })}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-orange-500/5 rounded-xl">
                <Thermometer className="h-8 w-8 text-orange-500 mb-2" />
                <span className="text-2xl font-bold">{latest.temp_min !== null ? `${latest.temp_min}°C` : '-'}</span>
                <span className="text-xs text-muted-foreground text-center">Temp. Min</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-500/5 rounded-xl">
                <Thermometer className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-2xl font-bold">{latest.temp_max !== null ? `${latest.temp_max}°C` : '-'}</span>
                <span className="text-xs text-muted-foreground text-center">Temp. Max</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-cyan-500/5 rounded-xl">
                <Droplets className="h-8 w-8 text-cyan-500 mb-2" />
                <span className="text-2xl font-bold">{latest.precipitation !== null ? `${latest.precipitation}mm` : '-'}</span>
                <span className="text-xs text-muted-foreground text-center">Précipitations</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-yellow-500/5 rounded-xl">
                <Sun className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-2xl font-bold">{latest.sunshine !== null ? `${(latest.sunshine / 3600).toFixed(1)}h` : '-'}</span>
                <span className="text-xs text-muted-foreground text-center">Ensoleillement</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ville:</span>
                  <span className="font-medium">strasbourg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Région:</span>
                  <span className="font-medium">Grand Est</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pays:</span>
                  <span className="font-medium">France</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordonnées:</span>
                  <span className="font-medium">48.54°N, 7.63°E</span>
                </div>
              </div>
              <Link href="/archives" className="block">
                <Button className="w-full">Explorer les archives</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Map Section moved to HomeClient */}
      <HomeClient />

      {/* Quick Access */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Archives annuelles</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableYears.length > 0 ? (
            availableYears.map((year) => (
              <Link key={year} href={`/climatologie/annee/${year}/strasbourg`}>
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <span className="text-2xl font-bold group-hover:text-primary transition-colors">{year}</span>
                    <p className="text-sm text-muted-foreground">Consulter l'année</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full italic">
              Aucune archive disponible pour le moment. Le robot de données commencera sa collecte prochainement.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

