import { getDailyData, getHourlyData, listAvailableDays } from "@/lib/data";
import WeatherChart from "@/components/weather-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExportData from "@/components/export-data";
import { Metadata } from "next";
import { getTemperatureColor, getPrecipitationColor, getTextColor, getWeatherIcon, getSunshineColor } from "@/lib/weather-colors";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>;
}

export async function generateStaticParams() {
  // Retourner un tableau vide pour désactiver le pré-rendu statique
  // Les pages seront générées dynamiquement à la demande
  return [];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month, day } = await params;
  const dateStr = `${year}-${month}-${day}`;
  const dateFormatted = format(parseISO(dateStr), "d MMMM yyyy", { locale: fr });

  return {
    title: `Météo strasbourg - ${dateFormatted} | Archive Climatologique`,
    description: `Découvrez les archives météo détaillées de strasbourg pour le ${dateFormatted}. Températures, précipitations, vent et humidité heure par heure.`,
  };
}

export default async function DayPage({ params }: PageProps) {
  const { year, month, day } = await params;
  const dateStr = `${year}-${month}-${day}`;
  
  const dailyData = await getDailyData(dateStr);
  const hourlyData = await getHourlyData(dateStr);

  if (!dailyData || !hourlyData) {
    notFound();
  }

  // Previous/Next day navigation - normalize day format to match file names
  const allDays = listAvailableDays(year, month).map(d => d.padStart(2, '0')).sort();
  const currentDayIndex = allDays.indexOf(day.padStart(2, '0'));
  const hasPrev = currentDayIndex > 0;
  const hasNext = currentDayIndex >= 0 && currentDayIndex < allDays.length - 1;
  const prevDay = hasPrev ? allDays[currentDayIndex - 1] : null;
  const nextDay = hasNext ? allDays[currentDayIndex + 1] : null;
  
  // For cross-month navigation (when at month boundaries)
  const currentDate = parseISO(dateStr);
  const prevMonthDate = !hasPrev && currentDayIndex >= 0 ? subDays(currentDate, 1) : null;
  const nextMonthDate = !hasNext && currentDayIndex >= 0 ? addDays(currentDate, 1) : null;
  const prevMonthYear = prevMonthDate ? format(prevMonthDate, "yyyy") : null;
  const prevMonthMonth = prevMonthDate ? format(prevMonthDate, "MM") : null;
  const prevMonthDay = prevMonthDate ? format(prevMonthDate, "dd") : null;
  const nextMonthYear = nextMonthDate ? format(nextMonthDate, "yyyy") : null;
  const nextMonthMonth = nextMonthDate ? format(nextMonthDate, "MM") : null;
  const nextMonthDay = nextMonthDate ? format(nextMonthDate, "dd") : null;

  const maxColor = getTemperatureColor(dailyData.temp_max ?? 0);
  const minColor = getTemperatureColor(dailyData.temp_min ?? 0);
  const rainColor = getPrecipitationColor(dailyData.precipitation ?? 0);
  const officialSunshineMinutes = dailyData.sunshine_duration_minutes ?? (dailyData.sunshine !== null ? Math.round(dailyData.sunshine / 60) : null);
  const estimatedSunshineMinutes = dailyData.estimated_daily_sunshine_minutes;
  const officialSunshineColor = getSunshineColor((officialSunshineMinutes ?? 0) / 60);
  const estimatedSunshineColor = getSunshineColor((estimatedSunshineMinutes ?? 0) / 60);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            {prevDay && (
              <Link href={`/climatologie/jour/${year}/${month}/${prevDay}/strasbourg`}>
                <button className={cn(buttonVariants({ variant: "ghost" }))}>
                  ← Jour précédent
                </button>
              </Link>
            )}
            {prevMonthDate && !prevDay && (
              <Link href={`/climatologie/jour/${prevMonthYear}/${prevMonthMonth}/${prevMonthDay}/strasbourg`}>
                <button className={cn(buttonVariants({ variant: "ghost" }))}>
                  ← Jour précédent
                </button>
              </Link>
            )}
            {!prevDay && !prevMonthDate && (
              <button className={cn(buttonVariants({ variant: "ghost" }), "opacity-50 cursor-not-allowed")} disabled>
                ← Jour précédent
              </button>
            )}
            <div className="flex items-center gap-3 flex-1 justify-center">
              {(() => {
                const weather = getWeatherIcon(dailyData.weather_code ?? 0);
                if (weather.imagePath) {
                  return <img src={weather.imagePath} alt={weather.description} className="h-12 w-12" />;
                }
                return <span className="h-12 w-12 inline-block" aria-hidden="true"></span>;
              })()}
              <h1 className="text-3xl font-bold">
                Météo à strasbourg le {format(parseISO(dateStr), "d MMMM yyyy", { locale: fr })}
              </h1>
            </div>
            {nextDay && (
              <Link href={`/climatologie/jour/${year}/${month}/${nextDay}/strasbourg`}>
                <button className={cn(buttonVariants({ variant: "ghost" }))}>
                  Jour suivant →
                </button>
              </Link>
            )}
            {nextMonthDate && !nextDay && (
              <Link href={`/climatologie/jour/${nextMonthYear}/${nextMonthMonth}/${nextMonthDay}/strasbourg`}>
                <button className={cn(buttonVariants({ variant: "ghost" }))}>
                  Jour suivant →
                </button>
              </Link>
            )}
            {!nextDay && !nextMonthDate && (
              <button className={cn(buttonVariants({ variant: "ghost" }), "opacity-50 cursor-not-allowed")} disabled>
                Jour suivant →
              </button>
            )}
          </div>
          <p className="text-muted-foreground">
            Archives détaillées heure par heure.
          </p>
          <p className="text-sm text-muted-foreground">
            Lever du soleil: {dailyData.sunrise ? format(parseISO(dailyData.sunrise), "HH:mm", { locale: fr }) : "--:--"} • Coucher du soleil: {dailyData.sunset ? format(parseISO(dailyData.sunset), "HH:mm", { locale: fr }) : "--:--"}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
            <Link href={`/climatologie/mois/${year}/${month}/strasbourg`}>
              <button className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Voir le mois {format(parseISO(dateStr), "MMMM yyyy", { locale: fr })}
              </button>
            </Link>
            <Link href="/archives">
              <button className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Archives complètes
              </button>
            </Link>
          </div>
        </div>
        <ExportData data={hourlyData} filename={`strasbourg_weather_${dateStr}`} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm" style={{ backgroundColor: minColor, color: getTextColor(minColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Température Min</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{dailyData.temp_min}°C</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm" style={{ backgroundColor: maxColor, color: getTextColor(maxColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Température Max</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{dailyData.temp_max}°C</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm" style={{ backgroundColor: rainColor, color: getTextColor(rainColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Précipitations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{dailyData.precipitation} mm</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm" style={{ backgroundColor: officialSunshineColor, color: getTextColor(officialSunshineColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ensoleillement Officiel</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{officialSunshineMinutes !== null ? `${Math.floor(officialSunshineMinutes / 60)}h ${officialSunshineMinutes % 60}min` : '–'}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm" style={{ backgroundColor: estimatedSunshineColor, color: getTextColor(estimatedSunshineColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ensoleillement Estimé</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{estimatedSunshineMinutes !== null ? `${Math.floor(estimatedSunshineMinutes / 60)}h ${estimatedSunshineMinutes % 60}min` : '–'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherChart 
          data={hourlyData || []} 
          title="Température (°C)" 
          dataKey="temp" 
          color="#f97316" 
          unit="°C" 
        />
        <WeatherChart 
          data={hourlyData || []} 
          title="Précipitations (mm)" 
          dataKey="precipitation" 
          color="#0ea5e9" 
          unit="mm" 
        />
      </div>

      {/* Hourly Table */}
      <Card className="overflow-hidden border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle>Tableau Horaire (Format Wikipédia)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto border rounded-sm">
            <Table className="border-collapse text-[13px] text-center w-full min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-[#f2f2f2] dark:bg-muted/50 border-b">
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Météo</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-2 py-1 h-auto text-left w-[80px]">Heure</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Temp. (°C)</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Pluie (mm)</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Humidité</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Vent</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Rafales</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Pression</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Ensoleil. Officiel (min)</TableHead>
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Ensoleil. Estimé (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hourlyData.map((hour) => {
                  const temp = hour.temp ?? 0;
                  const precip = hour.precipitation ?? 0;
                  const tColor = getTemperatureColor(temp);
                  const pColor = getPrecipitationColor(precip);
                  const officialSunMin = hour.sunshine !== null ? Math.round(hour.sunshine / 60) : null;
                  const estSunMin = hour.estimated_hourly_sunshine_minutes;
                  const offColor = getSunshineColor((officialSunMin ?? 0) / 60);
                  const estColor = getSunshineColor((estSunMin ?? 0) / 60);
                  const weather = getWeatherIcon(hour.weather_code ?? 0, hour.time ?? '', dailyData.sunrise, dailyData.sunset);
                  return (
                    <TableRow key={hour.time}>
                      <TableCell className="border bg-white dark:bg-background text-center" title={weather.description}>
                        {weather.imagePath ? (
                          <img 
                            src={weather.imagePath} 
                            alt={weather.description} 
                            title={weather.description}
                            className="h-8 w-8 inline-block object-contain" 
                            loading="lazy"
                          />
                        ) : (
                          <span className="h-8 w-8 inline-block" aria-hidden="true"></span>
                        )}
                      </TableCell>
                      <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">
                        {format(parseISO(hour.time), "HH:mm")}
                      </TableCell>
                      <TableCell className="border p-0" style={{ backgroundColor: tColor, color: getTextColor(tColor) }}>
                        {temp.toFixed(1)}
                      </TableCell>
                      <TableCell className="border p-0" style={{ backgroundColor: pColor, color: getTextColor(pColor) }}>
                        {precip.toFixed(1)}
                      </TableCell>
                      <TableCell className="border bg-white dark:bg-background">{hour.humidity ?? '-'}%</TableCell>
                      <TableCell className="border bg-white dark:bg-background">{hour.wind_speed ?? '-'} km/h</TableCell>
                      <TableCell className="border bg-white dark:bg-background">{hour.wind_gusts ?? '-'} km/h</TableCell>
                      <TableCell className="border bg-white dark:bg-background">{hour.pressure ?? '-'} hPa</TableCell>
                      <TableCell className="border p-0" style={{ backgroundColor: offColor, color: getTextColor(offColor) }}>
                        {officialSunMin !== null ? officialSunMin : '-'}
                      </TableCell>
                      <TableCell className="border p-0" style={{ backgroundColor: estColor, color: getTextColor(estColor) }}>
                        {estSunMin !== null ? estSunMin : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
