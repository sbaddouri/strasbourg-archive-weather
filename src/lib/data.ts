import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { format, subDays } from 'date-fns';
import {
  calculateHourlySunshine,
  calculateHourlySunshineWithDaylight,
  calculateDailySunshine,
  formatSunshineDuration,
  calculateSunshineConsistency,
  convertOfficialSunshineToMinutes
} from './weather-colors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible paths for data directory (works both locally and on Vercel)
const possibleDataDirs = [
  path.join(process.cwd(), 'data'),                    // Local development
  path.join(__dirname, '..', '..', '..', 'data'),     // Vercel production (from src/lib)
  path.join(__dirname, '..', '..', 'data'),           // Alternative Vercel path
  '/var/task/data',                                    // Vercel serverless function root
];

let DATA_DIR = '';
for (const dir of possibleDataDirs) {
  if (fs.existsSync(dir)) {
    DATA_DIR = dir;
    break;
  }
}

// Fallback to process.cwd() if none found
if (!DATA_DIR) {
  DATA_DIR = path.join(process.cwd(), 'data');
}

export interface DailyData {
  date: string;
  weather_code: number | null;
  temp_max: number | null;
  temp_min: number | null;
  temp_mean: number | null;
  precipitation: number | null;
  sunshine: number | null; // Valeur officielle Open-Meteo en secondes (conservée pour compatibilité)
  wind_speed_max: number | null;
  sunrise: string | null;
  sunset: string | null;
  
  // Nouvelles variables pour l'ensoleillement estimé
  sunshine_duration_seconds: number | null; // Valeur officielle Open-Meteo en secondes
  sunshine_duration_minutes: number | null; // Valeur officielle convertie en minutes
  estimated_daily_sunshine_minutes: number | null; // Estimation journalière basée sur les codes WMO horaires
  estimated_daily_sunshine: string | null; // Estimation journalière formatée ("X h Y min")
  sunshine_difference_minutes: number | null; // Différence absolue entre les deux valeurs
  sunshine_consistency: 'Excellent' | 'Bon' | 'Moyen' | 'Faible' | null; // Indice de cohérence
}

export interface HourlyData {
  time: string;
  temp: number | null;
  humidity: number | null;
  dew_point: number | null;
  precipitation: number | null;
  weather_code: number | null;
  pressure: number | null;
  wind_speed: number | null;
  wind_gusts: number | null;
  visibility: number | null;
  uv_index: number | null;
  sunshine: number | null; // Valeur officielle Open-Meteo en secondes
  
  // Nouvelle variable pour l'ensoleillement estimé horaire
  estimated_hourly_sunshine_minutes: number | null; // Estimation basée sur le code WMO horaire
}

async function fillMissingDailyDataFields(data: any): Promise<DailyData> {
  try {
    // Check if fields are missing
    if (
      data.sunshine_duration_seconds === undefined ||
      data.sunshine_duration_minutes === undefined ||
      data.estimated_daily_sunshine_minutes === undefined ||
      data.estimated_daily_sunshine === undefined ||
      data.sunshine_difference_minutes === undefined ||
      data.sunshine_consistency === undefined
    ) {
      // Calculate official values from existing "sunshine" field
      const sunshineDurationSeconds = data.sunshine ?? null;
      const sunshineDurationMinutes = convertOfficialSunshineToMinutes(sunshineDurationSeconds);

      // Calculate estimated values from hourly data
      let hourlyData = null;
      try {
        hourlyData = await getHourlyData(data.date);
      } catch (e) {
        hourlyData = null;
      }
      const estimatedDailyMinutes = calculateDailySunshine(
        hourlyData || [], 
        data.sunrise, 
        data.sunset
      );
      const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);

      // Calculate difference and consistency
      const sunshineDifferenceMinutes = (sunshineDurationMinutes !== null && estimatedDailyMinutes !== null)
        ? Math.abs(sunshineDurationMinutes - estimatedDailyMinutes)
        : null;
      const consistency = calculateSunshineConsistency(sunshineDurationMinutes, estimatedDailyMinutes);

      return {
        ...data,
        sunshine_duration_seconds: sunshineDurationSeconds,
        sunshine_duration_minutes: sunshineDurationMinutes,
        estimated_daily_sunshine_minutes: estimatedDailyMinutes,
        estimated_daily_sunshine: estimatedDailySunshine,
        sunshine_difference_minutes: sunshineDifferenceMinutes,
        sunshine_consistency: consistency
      };
    }
    return data as DailyData;
  } catch (e) {
    // Si erreur, retourner les données brutes sans les nouveaux champs (éviter crash)
    return {
      date: data.date,
      weather_code: data.weather_code ?? null,
      temp_max: data.temp_max ?? null,
      temp_min: data.temp_min ?? null,
      temp_mean: data.temp_mean ?? null,
      precipitation: data.precipitation ?? null,
      sunshine: data.sunshine ?? null,
      wind_speed_max: data.wind_speed_max ?? null,
      sunrise: data.sunrise ?? null,
      sunset: data.sunset ?? null,
      sunshine_duration_seconds: null,
      sunshine_duration_minutes: null,
      estimated_daily_sunshine_minutes: null,
      estimated_daily_sunshine: null,
      sunshine_difference_minutes: null,
      sunshine_consistency: null
    };
  }
}

async function fillMissingHourlyDataFields(
  data: any[],
  sunrise: string | null | undefined,
  sunset: string | null | undefined
): Promise<HourlyData[]> {
  return data.map(hour => {
    if (hour.estimated_hourly_sunshine_minutes === undefined) {
      return {
        ...hour,
        estimated_hourly_sunshine_minutes: calculateHourlySunshineWithDaylight(
          hour.weather_code,
          hour.time,
          sunrise,
          sunset
        )
      };
    }
    return hour as HourlyData;
  });
}

export async function getDailyData(date: string): Promise<DailyData | null> {
  const [year, month, day] = date.split('-');
  const filePath = path.join(DATA_DIR, 'daily', year, month, `${day}.json`);
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return await fillMissingDailyDataFields(data);
}

export async function getHourlyData(date: string): Promise<HourlyData[] | null> {
  const [year, month, day] = date.split('-');
  const filePath = path.join(DATA_DIR, 'hourly', year, month, `${day}.json`);
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Récupérer le lever/coucher du soleil depuis les données journalières
  const dailyFilePath = path.join(DATA_DIR, 'daily', year, month, `${day}.json`);
  let sunrise: string | null | undefined = null;
  let sunset: string | null | undefined = null;
  if (fs.existsSync(dailyFilePath)) {
    const dailyData = JSON.parse(fs.readFileSync(dailyFilePath, 'utf8'));
    sunrise = dailyData.sunrise ?? null;
    sunset = dailyData.sunset ?? null;
  }
  
  return await fillMissingHourlyDataFields(data, sunrise, sunset);
}

export function hasDailyDataForMonth(year: string, month: string): boolean {
  const dir = path.join(DATA_DIR, 'daily', year, month);
  return fs.existsSync(dir);
}

export function listAvailableYears(): string[] {
  const dailyDir = path.join(DATA_DIR, 'daily');
  if (!fs.existsSync(dailyDir)) return [];
  return fs.readdirSync(dailyDir).sort((a, b) => b.localeCompare(a));
}

export function listAvailableMonths(year: string): string[] {
  const yearDir = path.join(DATA_DIR, 'daily', year);
  if (!fs.existsSync(yearDir)) return [];
  return fs.readdirSync(yearDir).sort();
}

export function listAvailableDays(year: string, month: string): string[] {
  const monthDir = path.join(DATA_DIR, 'daily', year, month);
  if (!fs.existsSync(monthDir)) return [];
  return fs.readdirSync(monthDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort();
}

export async function getDailyDataForMonth(year: string, month: string): Promise<DailyData[]> {
  const dir = path.join(DATA_DIR, 'daily', year, month);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const results: DailyData[] = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const filledData = await fillMissingDailyDataFields(data);
    results.push(filledData);
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getHourlyDataForMonth(year: string, month: string): Promise<Record<string, HourlyData[]>> {
  const dir = path.join(DATA_DIR, 'hourly', year, month);
  const result: Record<string, HourlyData[]> = {};
  if (!fs.existsSync(dir)) return result;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const day = file.replace('.json', '');
    const date = `${year}-${month}-${day}`;
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      
      // Récupérer lever/coucher depuis données journalières
      const dailyFilePath = path.join(DATA_DIR, 'daily', year, month, `${day}.json`);
      let sunrise: string | null | undefined = null;
      let sunset: string | null | undefined = null;
      if (fs.existsSync(dailyFilePath)) {
        const dailyData = JSON.parse(fs.readFileSync(dailyFilePath, 'utf8'));
        sunrise = dailyData.sunrise ?? null;
        sunset = dailyData.sunset ?? null;
      }
      
      result[date] = await fillMissingHourlyDataFields(raw, sunrise, sunset);
    } catch {
      result[date] = [];
    }
  }

  return result;
}

export async function getDailyDataForYear(year: string): Promise<DailyData[]> {
  const yearDir = path.join(DATA_DIR, 'daily', year);
  if (!fs.existsSync(yearDir)) return [];
  
  const months = fs.readdirSync(yearDir);
  let allData: DailyData[] = [];
  
  for (const month of months) {
    const monthData = await getDailyDataForMonth(year, month);
    allData = [...allData, ...monthData];
  }
  
  return allData.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getRecentDailyData(days = 7): Promise<DailyData[]> {
  const results: DailyData[] = [];
  const today = new Date();
  
  // Start from 3 days ago to ensure complete data
  for (let i = 3; i < 3 + days; i++) {
    const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
    const data = await getDailyData(dateStr);
    if (data) results.push(data);
  }
  
  return results;
}

export type AttemptDetail = {
  date: string;
  success: boolean;
  error?: string;
};

export type UpdateStatus = {
  success: boolean;
  date: string;
  message: string;
  initialStartDate: string;
  initialEndDate: string;
  finalStartDate: string;
  finalEndDate: string;
  attempts: number;
  daysUpdated: string[];
  missingDays: string[];
  attemptDetails: AttemptDetail[];
};

export async function getUpdateStatus(): Promise<UpdateStatus | null> {
  const statusFile = path.join(DATA_DIR, 'last-update-status.json');
  if (!fs.existsSync(statusFile)) return null;
  try {
    const content = fs.readFileSync(statusFile, 'utf8');
    const parsed = JSON.parse(content);
    return {
      success: parsed.success ?? false,
      date: parsed.date ?? new Date().toISOString(),
      message: parsed.message ?? '',
      initialStartDate: parsed.initialStartDate ?? '',
      initialEndDate: parsed.initialEndDate ?? '',
      finalStartDate: parsed.finalStartDate ?? '',
      finalEndDate: parsed.finalEndDate ?? '',
      attempts: parsed.attempts ?? 0,
      daysUpdated: parsed.daysUpdated ?? [],
      missingDays: parsed.missingDays ?? [],
      attemptDetails: parsed.attemptDetails ?? [],
    };
  } catch {
    return null;
  }
}
