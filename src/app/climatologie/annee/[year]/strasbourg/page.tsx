import { getDailyDataForYear, listAvailableYears } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { getTemperatureColor, getPrecipitationColor, getTextColor, getSunshineColor, formatSunshineDuration } from "@/lib/weather-colors";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    year: string;
  }>;
}

export async function generateStaticParams() {
  const years = listAvailableYears();
  return years.map(year => ({ year }));
}

export const dynamicParams = true;
export const revalidate = 3600;

interface MonthlyStats {
  name: string;
  fullName: string;
  days: number;
  tempMaxSum: number;
  tempMinSum: number;
  tempMeanSum: number;
  rainSum: number;
  absMax: number;
  absMin: number;
  maxMinTemp: number;
  minMaxTemp: number;
  max24hPrecip: number;
  sunshineSumMinutes: number;
  sunshineOfficialSumSeconds: number;
  precipDaysOver1: number[];
  max5DayPrecip: number | null;
}

export default async function YearPage({ params }: PageProps) {
  const { year } = await params;
  const data = await getDailyDataForYear(year);

  if (data.length === 0) {
    notFound();
  }

  // Previous/Next year navigation
  const allYears = listAvailableYears().sort();
  const currentYearIndex = allYears.indexOf(year);
  const isEarliestYear = year === '1940';
  const hasPrev = currentYearIndex > 0 && !isEarliestYear;
  const hasNext = currentYearIndex < allYears.length - 1;
  const prevYear = hasPrev ? allYears[currentYearIndex - 1] : null;
  const nextYear = hasNext ? allYears[currentYearIndex + 1] : null;

  // Group by month
  const monthlyStats: { [key: string]: MonthlyStats } = {};
  data.forEach(day => {
    const month = format(parseISO(day.date), "MM");
    if (!monthlyStats[month]) {
      monthlyStats[month] = {
        name: format(parseISO(day.date), "MMM", { locale: fr }),
        fullName: format(parseISO(day.date), "MMMM", { locale: fr }),
        days: 0,
        tempMaxSum: 0,
        tempMinSum: 0,
        tempMeanSum: 0,
        rainSum: 0,
        absMax: -Infinity,
        absMin: Infinity,
        maxMinTemp: -Infinity, // Tempé. mini maximale (highest of daily mins)
        minMaxTemp: Infinity, // Tempé. maxi minimale (lowest of daily maxes)
        max24hPrecip: -Infinity, // Max en 24h
        sunshineSumMinutes: 0, // Ensoleillement Estimé total (minutes)
        sunshineOfficialSumSeconds: 0, // Ensoleillement Officiel total (seconds)
        precipDaysOver1: [], // Days with >1mm precip
        max5DayPrecip: null
      };
    }
    const s = monthlyStats[month];
    s.days++;
    if (day.temp_max !== null) {
      s.tempMaxSum += day.temp_max;
      if (day.temp_max > s.absMax) s.absMax = day.temp_max;
      if (day.temp_max < s.minMaxTemp) s.minMaxTemp = day.temp_max;
    }
    if (day.temp_min !== null) {
      s.tempMinSum += day.temp_min;
      if (day.temp_min < s.absMin) s.absMin = day.temp_min;
      if (day.temp_min > s.maxMinTemp) s.maxMinTemp = day.temp_min;
    }
    if (day.temp_mean !== null) {
      s.tempMeanSum += day.temp_mean;
    }
    if (day.precipitation !== null) {
      s.rainSum += day.precipitation;
      if (day.precipitation > s.max24hPrecip) s.max24hPrecip = day.precipitation;
      if (day.precipitation > 1) {
        s.precipDaysOver1.push(day.precipitation);
      }
    }
    if (day.estimated_daily_sunshine_minutes !== null) {
      s.sunshineSumMinutes += day.estimated_daily_sunshine_minutes;
    }
    if (day.sunshine_duration_seconds !== null && day.sunshine_duration_seconds !== undefined) {
      s.sunshineOfficialSumSeconds += day.sunshine_duration_seconds;
    }
  });

  // For each month, calculate 5-day max precip
  Object.keys(monthlyStats).forEach(month => {
    const monthDays = data.filter(day => format(parseISO(day.date), "MM") === month).sort((a, b) => a.date.localeCompare(b.date));
    let max5DayPrecip = -Infinity;
    if (monthDays.length >= 5) { // Only calculate if at least 5 days in month
      for (let i = 0; i <= monthDays.length - 5; i++) { // Adjusted condition to -5 instead of -4
        let sum = 0;
        for (let j = 0; j < 5; j++) {
          sum += monthDays[i + j].precipitation ?? 0; // 
        }
        if (sum > max5DayPrecip) max5DayPrecip = sum;
      }
    }
    monthlyStats[month].max5DayPrecip = max5DayPrecip === -Infinity ? null : max5DayPrecip;
  });

  const sortedMonths = Object.keys(monthlyStats).sort();

  // Yearly absolute stats
  const yearlyAbsMax = Math.max(...sortedMonths.map(m => monthlyStats[m].absMax));
  const yearlyAbsMin = Math.min(...sortedMonths.map(m => monthlyStats[m].absMin));
  const yearlyTotalRain = sortedMonths.reduce((acc, m) => acc + monthlyStats[m].rainSum, 0);
  const yearlyAvgMax = sortedMonths.reduce((acc, m) => acc + monthlyStats[m].tempMaxSum, 0) / data.length;
  const yearlyAvgMin = sortedMonths.reduce((acc, m) => acc + monthlyStats[m].tempMinSum, 0) / data.length;
  const yearlyMaxMinTemp = Math.max(...sortedMonths.map(m => monthlyStats[m].maxMinTemp));
  const yearlyMinMaxTemp = Math.min(...sortedMonths.map(m => monthlyStats[m].minMaxTemp));
  const yearlySunshineHours = sortedMonths.reduce((acc, m) => acc + monthlyStats[m].sunshineSumMinutes, 0) / 60;
  const yearlyMax24hPrecip = Math.max(...sortedMonths.map(m => monthlyStats[m].max24hPrecip));

  // Yearly totals for sunshine
  const yearlySunshineOfficialSumSeconds = sortedMonths.reduce((acc, m) => acc + monthlyStats[m].sunshineOfficialSumSeconds, 0);
  const yearlySunshineOfficialHours = Math.floor(yearlySunshineOfficialSumSeconds / 3600);
  const yearlySunshineOfficialMinutes = Math.floor(((yearlySunshineOfficialSumSeconds / 3600) - yearlySunshineOfficialHours) * 60);

  const yearlySunshineEstimatedTotalMinutes = sortedMonths.reduce((acc, m) => acc + monthlyStats[m].sunshineSumMinutes, 0);
  const yearlySunshineEstimatedFormatted = formatSunshineDuration(yearlySunshineEstimatedTotalMinutes);

  // Yearly max 5-day precip
  let yearlyMax5DayPrecip = -Infinity;
  if (data.length >= 5) {
    for (let i = 0; i <= data.length - 5; i++) {
      let sum = 0;
      for (let j = 0; j < 5; j++) {
        sum += data[i + j].precipitation ?? 0; //
      }
      if (sum > yearlyMax5DayPrecip) yearlyMax5DayPrecip = sum;
    }
  }
  // Yearly average for days with >1mm precip
  const yearlyPrecipDaysOver1 = sortedMonths.reduce((acc: number[], m) => [...acc, ...monthlyStats[m].precipDaysOver1], []);
  const yearlyAvgPrecipOver1 = yearlyPrecipDaysOver1.length > 0 
    ? yearlyPrecipDaysOver1.reduce((a, b) => a + b, 0) / yearlyPrecipDaysOver1.length 
    : null;

  const avgMaxColor = getTemperatureColor(yearlyAvgMax);
  const avgMinColor = getTemperatureColor(yearlyAvgMin);
  const absMaxColor = getTemperatureColor(yearlyAbsMax);
  const absMinColor = getTemperatureColor(yearlyAbsMin);
  const yearlySunshineOfficialColor = getSunshineColor((yearlySunshineOfficialSumSeconds / 3600) * 30);
  const yearlySunshineEstimatedColor = getSunshineColor((yearlySunshineEstimatedTotalMinutes / 60) * 30);

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          {!isEarliestYear && (
            <Link href={`/climatologie/annee/${prevYear}/strasbourg`}>
              <button className={cn(buttonVariants({ variant: "ghost" }), "disabled:opacity-50")} disabled={!hasPrev}>
                ← Année précédente
              </button>
            </Link>
          )}
          <h1 className="text-3xl font-bold text-center">Données climatiques {year} - strasbourg, Maroc</h1>
          <Link href={`/climatologie/annee/${nextYear}/strasbourg`}>
            <button className={cn(buttonVariants({ variant: "ghost" }), "disabled:opacity-50")} disabled={!hasNext}>
              Année suivante →
            </button>
          </Link>
        </div>
        {isEarliestYear && (
          <div className="text-center text-sm text-muted-foreground">
            📅 1940 est la première année disponible dans les données Open-Meteo (données limitées à partir de 1940).
          </div>
        )}
        <p className="text-muted-foreground text-center">Tableau climatologique au format Wikipédia.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: avgMinColor, color: getTextColor(avgMinColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Moyenne Min</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlyAvgMin !== null && !isNaN(yearlyAvgMin) ? yearlyAvgMin.toFixed(1) : '-'}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: avgMaxColor, color: getTextColor(avgMaxColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Moyenne Max</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlyAvgMax !== null && !isNaN(yearlyAvgMax) ? yearlyAvgMax.toFixed(1) : '-'}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: absMinColor, color: getTextColor(absMinColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Record Froid</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlyAbsMin !== Infinity ? yearlyAbsMin.toFixed(1) : '-'}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 border-none shadow-sm" style={{ backgroundColor: absMaxColor, color: getTextColor(absMaxColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Record Chaleur</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlyAbsMax !== -Infinity ? yearlyAbsMax.toFixed(1) : '-'}°C</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-2 md:col-span-1 border-none shadow-sm bg-blue-600 text-white">
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pluie Annuelle</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlyTotalRain !== null && !isNaN(yearlyTotalRain) ? yearlyTotalRain.toFixed(1) : '-'} mm</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-2 md:col-span-1 border-none shadow-sm" style={{ backgroundColor: yearlySunshineOfficialColor, color: getTextColor(yearlySunshineOfficialColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ensoleillement Officiel</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlySunshineOfficialHours}h {yearlySunshineOfficialMinutes}mn</div>
          </CardContent>
        </Card>
        <Card className="col-span-1 sm:col-span-2 md:col-span-1 border-none shadow-sm" style={{ backgroundColor: yearlySunshineEstimatedColor, color: getTextColor(yearlySunshineEstimatedColor) }}>
          <CardHeader className="pb-1 p-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Ensoleillement Estimé</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">{yearlySunshineEstimatedFormatted}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="overflow-x-auto border rounded-sm">
            <Table className="border-collapse text-[13px] text-center w-full min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-[#f2f2f2] dark:bg-muted/50 border-b">
                  <TableHead className="border font-bold text-black dark:text-white px-2 py-1 h-auto text-left">Mois</TableHead>
                  {sortedMonths.map(m => (
                    <TableHead key={m} className="border font-bold text-black dark:text-white px-0 py-0 h-auto capitalize">
                      <Link 
                        href={`/climatologie/mois/${year}/${m}/strasbourg`}
                        className="flex items-center justify-center w-full h-full py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        {monthlyStats[m].name}
                      </Link>
                    </TableHead>
                  ))}
                  <TableHead className="border font-bold text-black dark:text-white px-1 py-1 h-auto">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Record High */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Record de chaleur (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].absMax;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {Math.max(...sortedMonths.map(m => monthlyStats[m].absMax)).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Avg High */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Moyenne des maximales (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].tempMaxSum / monthlyStats[m].days;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {(sortedMonths.reduce((acc, m) => acc + monthlyStats[m].tempMaxSum, 0) / data.length).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Daily Mean */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Moyenne quotidienne (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].tempMeanSum / monthlyStats[m].days;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {(sortedMonths.reduce((acc, m) => acc + monthlyStats[m].tempMeanSum, 0) / data.length).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Avg Low */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Moyenne des minimales (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].tempMinSum / monthlyStats[m].days;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {(sortedMonths.reduce((acc, m) => acc + monthlyStats[m].tempMinSum, 0) / data.length).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Record Low */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Record de froid (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].absMin;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {Math.min(...sortedMonths.map(m => monthlyStats[m].absMin)).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Tempé. maxi maximale */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Tempé. maxi maximale (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].minMaxTemp;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {yearlyMinMaxTemp.toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Tempé. mini minimale */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Tempé. mini minimale (°C)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].maxMinTemp;
                    const bgColor = getTemperatureColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {yearlyMaxMinTemp.toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Ensoleillement Officiel */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Ensoleillement Officiel (h)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].sunshineOfficialSumSeconds / 3600;
                    const bgColor = getSunshineColor(val * 30);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {(yearlySunshineOfficialSumSeconds / 3600).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Ensoleillement Estimé */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Ensoleillement Estimé (h)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].sunshineSumMinutes / 60;
                    const bgColor = getSunshineColor(val * 30);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {yearlySunshineHours.toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Precipitation */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Précipitations (mm)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].rainSum;
                    const bgColor = getPrecipitationColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {sortedMonths.reduce((acc, m) => acc + monthlyStats[m].rainSum, 0).toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Max en 24h */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Max en 24h de précips (mm)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].max24hPrecip;
                    const bgColor = getPrecipitationColor(val);
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val.toFixed(1)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {yearlyMax24hPrecip.toFixed(1)}
                  </TableCell>
                </TableRow>

                {/* Max en 5j */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Max en 5j de précips (mm)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].max5DayPrecip;
                    const bgColor = val !== null ? getPrecipitationColor(val) : 'transparent';
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val !== null ? val.toFixed(1) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {yearlyMax5DayPrecip !== -Infinity ? yearlyMax5DayPrecip.toFixed(1) : '-'}
                  </TableCell>
                </TableRow>

                {/* Moyenne ≥ 1 */}
                <TableRow>
                  <TableCell className="border bg-[#f2f2f2] dark:bg-muted/30 font-bold text-left px-2 py-1">Moyenne ≥ 1 de précips (mm)</TableCell>
                  {sortedMonths.map(m => {
                    const val = monthlyStats[m].precipDaysOver1.length > 0 
                      ? monthlyStats[m].precipDaysOver1.reduce((a: number, b: number) => a + b, 0) / monthlyStats[m].precipDaysOver1.length 
                      : null;
                    const bgColor = val !== null ? getPrecipitationColor(val) : 'transparent';
                    return (
                      <TableCell key={m} className="border p-0" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        {val !== null ? val.toFixed(1) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold bg-[#f2f2f2] dark:bg-muted/30">
                    {yearlyAvgPrecipOver1 !== null ? yearlyAvgPrecipOver1.toFixed(1) : '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground italic">
            Source : Open-Meteo Archive (strasbourg). Échelle de couleurs basée sur le modèle Weather Box de Wikipédia.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {sortedMonths.map(m => (
          <Link 
            key={m} 
            href={`/climatologie/mois/${year}/${m}/strasbourg`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full capitalize")}
          >
            Détails {monthlyStats[m].fullName} {year}
          </Link>
        ))}
      </div>
    </div>
  );
}

