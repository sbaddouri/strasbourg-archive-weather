import { getDailyDataForMonth, getHourlyDataForMonth, hasDailyDataForMonth, listAvailableYears, listAvailableMonths } from "@/lib/data";
import { WeatherIcon, DailyWeatherIcon } from "@/components/WeatherIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, addMonths, subMonths, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getTemperatureColor, getPrecipitationColor, getTextColor, getSunshineColor, getWeatherIcon, calculateMonthlySunshine, formatSunshineDuration } from "@/lib/weather-colors";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
  }>;
}

export async function generateStaticParams() {
  const years = listAvailableYears();
  const params: { year: string; month: string }[] = [];
  for (const year of years) {
    const months = listAvailableMonths(year);
    for (const month of months) {
      params.push({ year, month });
    }
  }
  return params;
}

export const dynamicParams = true;
export const revalidate = 3600;

export default async function MonthPage({ params }: PageProps) {
  const { year, month } = await params;
  const dailyData = await getDailyDataForMonth(year, month);

  if (dailyData.length === 0) {
    notFound();
  }

  const currentDate = startOfMonth(parseISO(`${year}-${month}-01`));

  // Previous month (lightweight existence check only)
  const prevDate = subMonths(currentDate, 1);
  const prevYear = format(prevDate, "yyyy");
  const prevMonth = format(prevDate, "MM");
  const hasPrev = hasDailyDataForMonth(prevYear, prevMonth);

  // Next month (lightweight existence check only)
  const nextDate = addMonths(currentDate, 1);
  const nextYear = format(nextDate, "yyyy");
  const nextMonth = format(nextDate, "MM");
  const hasNext = hasDailyDataForMonth(nextYear, nextMonth);

  // Batched hourly loader: 1 folder read instead of ~31 individual reads
  const hourlyMap = await getHourlyDataForMonth(year, month);
  const daysWithHourly = dailyData.map(day => ({
    daily: day,
    hourly: hourlyMap[day.date] ?? null
  }));

  // Moyennes et cumuls (filtering out null values)
  const daysWithTemp = dailyData.filter(d => d.temp_min !== null && d.temp_max !== null);
  const avgMin = daysWithTemp.length > 0 ? daysWithTemp.reduce((acc, d) => acc + (d.temp_min as number), 0) / daysWithTemp.length : 0;
  const avgMax = daysWithTemp.length > 0 ? daysWithTemp.reduce((acc, d) => acc + (d.temp_max as number), 0) / daysWithTemp.length : 0;

  const daysWithPrecip = dailyData.filter(d => d.precipitation !== null);
  const totalRain = daysWithPrecip.reduce((acc, d) => acc + (d.precipitation as number), 0);

  const totalSunshineSeconds = dailyData.reduce((acc, d) => acc + (d.sunshine_duration_seconds || 0), 0);
  const totalSunshineHours = totalSunshineSeconds / 3600;
  
  // Calculate total estimated monthly sunshine
  const dailyEstimatedMinutes = dailyData.map(d => d.estimated_daily_sunshine_minutes);
  const totalEstimatedMonthlyMinutes = calculateMonthlySunshine(dailyEstimatedMinutes);
  const totalEstimatedMonthlySunshine = formatSunshineDuration(totalEstimatedMonthlyMinutes);
  
  // Record (abs min/max) for the top cards
  const absMin = daysWithTemp.length > 0 ? Math.min(...daysWithTemp.map(d => d.temp_min as number)) : 0;
  const absMax = daysWithTemp.length > 0 ? Math.max(...daysWithTemp.map(d => d.temp_max as number)) : 0;
  
  // Maxi du mois
  const maxDailyMinTemp = daysWithTemp.length > 0 ? Math.max(...daysWithTemp.map(d => d.temp_min as number)) : 0; // TNX
  const maxDailyMaxTemp = daysWithTemp.length > 0 ? Math.max(...daysWithTemp.map(d => d.temp_max as number)) : 0; // TXX
  const maxDailyRain = daysWithPrecip.length > 0 ? Math.max(...daysWithPrecip.map(d => d.precipitation as number)) : 0;
  
  const daysWithWind = dailyData.filter(d => d.wind_speed_max !== null);
  const maxDailyWind = daysWithWind.length > 0 ? Math.max(...daysWithWind.map(d => d.wind_speed_max as number)) : 0;
  
  // Mini du mois
  const minDailyMinTemp = absMin; // TNN
  const minDailyMaxTemp = daysWithTemp.length > 0 ? Math.min(...daysWithTemp.map(d => d.temp_max as number)) : 0; // TXN
  
  // Calculate official total sunshine in hours and minutes
  const totalOfficialHours = Math.floor(totalSunshineHours);
  const totalOfficialMinutes = Math.floor((totalSunshineHours - totalOfficialHours) * 60);

  // Colors for the cards
  const avgMaxColor = getTemperatureColor(avgMax);
  const avgMinColor = getTemperatureColor(avgMin);
  const absMaxColor = getTemperatureColor(absMax);
  const absMinColor = getTemperatureColor(absMin);
  const maxDailyMaxTempColor = getTemperatureColor(maxDailyMaxTemp);
  const maxDailyMinTempColor = getTemperatureColor(maxDailyMinTemp);
  const minDailyMinTempColor = getTemperatureColor(minDailyMinTemp);
  const minDailyMaxTempColor = getTemperatureColor(minDailyMaxTemp);

  // Helper function for consistency colors
  const getConsistencyColor = (consistency: string | null) => {
    switch(consistency) {
      case 'Excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Bon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Moyen': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Faible': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <Link href={`/climatologie/mois/${prevYear}/${prevMonth}/strasbourg`}>
            <Button variant="ghost" disabled={!hasPrev}>
              ← {format(prevDate, "MMMM", { locale: fr })}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold capitalize text-center">
            Climatologie de strasbourg - {format(parseISO(dailyData[0].date), "MMMM yyyy", { locale: fr })}
          </h1>
          <Link href={`/climatologie/mois/${nextYear}/${nextMonth}/strasbourg`}>
            <Button variant="ghost" disabled={!hasNext}>
              {format(nextDate, "MMMM", { locale: fr })} →
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href={`/climatologie/annee/${year}/strasbourg`}>
            <Button variant="outline" size="sm">
              Voir l'année {year}
            </Button>
          </Link>
          <Link href="/archives">
            <Button variant="outline" size="sm">
              Archives complètes
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">Tableau quotidien détaillé au format Wikipédia.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: avgMinColor, color: getTextColor(avgMinColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Moyenne Min</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{avgMin.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: avgMaxColor, color: getTextColor(avgMaxColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Moyenne Max</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{avgMax.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: absMinColor, color: getTextColor(absMinColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Record Froid</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{absMin.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: absMaxColor, color: getTextColor(absMaxColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Record Chaleur</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{absMax.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-2 md:col-span-1 border-none shadow-sm bg-blue-600 text-white">
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pluie Cumulée</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{totalRain.toFixed(1)} mm</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-2 md:col-span-1 border-none shadow-sm" style={{ backgroundColor: getSunshineColor(totalSunshineHours * 30), color: getTextColor(getSunshineColor(totalSunshineHours * 30)) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ensoleillement Officiel</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{totalOfficialHours}h {totalOfficialMinutes}mn</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-2 md:col-span-1 border-none shadow-sm" style={{ backgroundColor: getSunshineColor(((totalEstimatedMonthlyMinutes || 0) / 60) * 30), color: getTextColor(getSunshineColor(((totalEstimatedMonthlyMinutes || 0) / 60) * 30)) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ensoleillement Estimé</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{totalEstimatedMonthlySunshine}</div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full overflow-x-auto"> {/* Make this container full width with horizontal scroll */}
        <Card className="overflow-hidden border-none shadow-none bg-transparent min-w-max">
          <CardContent className="p-0">
            <div className="border rounded-sm">
              <Table className="border-collapse text-[13px] text-center">
                <TableHeader>
                  <TableRow className="bg-[#f2f2f2] dark:bg-muted/50 border-b">
                    <TableHead className="border font-bold text-black dark:text-white px-2 py-1 h-auto text-left w-[120px] whitespace-nowrap">Date</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[80px] whitespace-nowrap">Temp. Min</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[80px] whitespace-nowrap">Temp. Max</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[80px] whitespace-nowrap">Moyenne</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[80px] whitespace-nowrap">Pluie (mm)</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[80px] whitespace-nowrap">Soleil Off. (h)</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[100px] whitespace-nowrap">Soleil Est.</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[100px] whitespace-nowrap">Écart (mn)</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[100px] whitespace-nowrap">Cohérence</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[80px] whitespace-nowrap">Vent Max</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[100px] whitespace-nowrap">Lever du soleil</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[100px] whitespace-nowrap">Coucher du soleil</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[450px] whitespace-nowrap">Événements</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[100px] whitespace-nowrap">Action</TableHead>
                    <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto w-[120px] whitespace-nowrap">Temps observé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daysWithHourly.map(({ daily: day, hourly }) => {
                    const maxColor = getTemperatureColor(day.temp_max);
                    const minColor = getTemperatureColor(day.temp_min);
                    const meanColor = getTemperatureColor(day.temp_mean);
                    const rainColor = getPrecipitationColor(day.precipitation);
                    const sunHours = (day.sunshine_duration_seconds || 0) / 3600;
                    const sunColor = getSunshineColor(sunHours * 30); // Multiplied by 30 to match monthly scale logic in colors.ts

                    return (
                      <TableRow key={day.date}>
                        <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1 w-[120px] whitespace-nowrap">
                          <Link href={`/climatologie/jour/${year}/${month}/${format(parseISO(day.date), "dd")}/strasbourg`} className="hover:underline">
                            {format(parseISO(day.date), "d EEE", { locale: fr })}
                          </Link>
                        </TableCell>
                        <TableCell className="border p-0 w-[80px] whitespace-nowrap" style={{ backgroundColor: minColor, color: getTextColor(minColor) }}>
                          {day.temp_min !== null ? day.temp_min.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="border p-0 w-[80px] whitespace-nowrap" style={{ backgroundColor: maxColor, color: getTextColor(maxColor) }}>
                          {day.temp_max !== null ? day.temp_max.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="border p-0 w-[80px] whitespace-nowrap" style={{ backgroundColor: meanColor, color: getTextColor(meanColor) }}>
                          {day.temp_mean !== null ? day.temp_mean.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="border p-0 w-[80px] whitespace-nowrap" style={{ backgroundColor: rainColor, color: getTextColor(rainColor) }}>
                          {day.precipitation !== null ? day.precipitation.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="border p-0 w-[80px] whitespace-nowrap" style={{ backgroundColor: sunColor, color: getTextColor(sunColor) }}>
                          {sunHours !== null ? sunHours.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background w-[100px] whitespace-nowrap">
                          {day.estimated_daily_sunshine || "Données indisponibles"}
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background w-[100px] whitespace-nowrap">
                          {day.sunshine_difference_minutes !== null ? day.sunshine_difference_minutes : "-"}
                        </TableCell>
                        <TableCell className={`border w-[100px] whitespace-nowrap ${getConsistencyColor(day.sunshine_consistency)}`}>
                          {day.sunshine_consistency || "Données indisponibles"}
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background w-[80px] whitespace-nowrap">
                          {day.wind_speed_max !== null ? day.wind_speed_max.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background w-[100px] whitespace-nowrap">
                          {day.sunrise ? format(parseISO(day.sunrise), "HH:mm", { locale: fr }) : "-"}
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background w-[100px] whitespace-nowrap">
                          {day.sunset ? format(parseISO(day.sunset), "HH:mm", { locale: fr }) : "-"}
                        </TableCell>
                        {/* Événements column with internal horizontal scroll */}
                        <TableCell className="border bg-white dark:bg-background w-[450px] p-0">
                          <div className="overflow-x-auto whitespace-nowrap px-1 py-1">
                            {hourly?.map((h) => {
                              const hourStr = format(parseISO(h.time), "HH:mm", { locale: fr });
                              const { description } = getWeatherIcon(h.weather_code, h.time, day.sunrise, day.sunset);
                              return (
                                <WeatherIcon
                                  key={h.time}
                                  weatherCode={h.weather_code}
                                  time={h.time}
                                  sunrise={day.sunrise}
                                  sunset={day.sunset}
                                  className="h-5 w-5 inline-block object-contain"
                                  title={`${hourStr} - ${description}`}
                                />
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background w-[100px] whitespace-nowrap">
                          <Link 
                            href={`/climatologie/jour/${year}/${month}/${format(parseISO(day.date), "dd")}/strasbourg`}
                            className="text-primary hover:underline"
                          >
                            Détails
                          </Link>
                        </TableCell>
                        <TableCell className="border bg-white dark:bg-background text-center w-[120px] whitespace-nowrap">
                          <DailyWeatherIcon
                            weatherCode={day.weather_code}
                            className="h-8 w-8 inline-block object-contain cursor-help"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground italic">
              Source : Open-Meteo Archive. Échelle de couleurs basée sur Wikipédia.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Sections */}
      <div className="space-y-6">
        {/* Maxi du mois */}
        <Card>
          <CardHeader>
            <CardTitle>Maxi du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">TNX (Temp. Min Max)</p>
                <p className="text-xl font-bold" style={{ backgroundColor: maxDailyMinTempColor, color: getTextColor(maxDailyMinTempColor) }}>
                  {maxDailyMinTemp.toFixed(1)} °C
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">TXX (Temp. Max Max)</p>
                <p className="text-xl font-bold" style={{ backgroundColor: maxDailyMaxTempColor, color: getTextColor(maxDailyMaxTempColor) }}>
                  {maxDailyMaxTemp.toFixed(1)} °C
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pluie Max/jour</p>
                <p className="text-xl font-bold" style={{ backgroundColor: getPrecipitationColor(maxDailyRain), color: getTextColor(getPrecipitationColor(maxDailyRain)) }}>
                  {maxDailyRain.toFixed(1)} mm/jour
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Vent Max</p>
                <p className="text-xl font-bold">
                  {maxDailyWind.toFixed(1)} km/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini du mois */}
        <Card>
          <CardHeader>
            <CardTitle>Mini du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">TNN (Temp. Min Min)</p>
                <p className="text-xl font-bold" style={{ backgroundColor: minDailyMinTempColor, color: getTextColor(minDailyMinTempColor) }}>
                  {minDailyMinTemp.toFixed(1)} °C
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">TXN (Temp. Max Min)</p>
                <p className="text-xl font-bold" style={{ backgroundColor: minDailyMaxTempColor, color: getTextColor(minDailyMaxTempColor) }}>
                  {minDailyMaxTemp.toFixed(1)} °C
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

