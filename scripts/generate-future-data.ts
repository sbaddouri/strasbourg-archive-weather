import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

interface DailyData {
  date: string;
  weather_code: null;
  temp_max: null;
  temp_min: null;
  temp_mean: null;
  precipitation: null;
  sunshine: null;
  wind_speed_max: null;
  sunrise: null;
  sunset: null;
  sunshine_duration_seconds: null;
  sunshine_duration_minutes: null;
  estimated_daily_sunshine_minutes: null;
  estimated_daily_sunshine: null;
  sunshine_difference_minutes: null;
  sunshine_consistency: null;
}

interface HourlyData {
  time: string;
  temp: null;
  humidity: null;
  dew_point: null;
  precipitation: null;
  weather_code: null;
  pressure: null;
  wind_speed: null;
  wind_gusts: null;
  visibility: null;
  uv_index: null;
  sunshine: null;
  estimated_hourly_sunshine_minutes: null;
}

function createDailyData(date: string): DailyData {
  return {
    date,
    weather_code: null,
    temp_max: null,
    temp_min: null,
    temp_mean: null,
    precipitation: null,
    sunshine: null,
    wind_speed_max: null,
    sunrise: null,
    sunset: null,
    sunshine_duration_seconds: null,
    sunshine_duration_minutes: null,
    estimated_daily_sunshine_minutes: null,
    estimated_daily_sunshine: null,
    sunshine_difference_minutes: null,
    sunshine_consistency: null,
  };
}

function createHourlyData(date: string): HourlyData[] {
  const hourly: HourlyData[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const time = `${date}T${hour.toString().padStart(2, '0')}:00`;
    hourly.push({
      time,
      temp: null,
      humidity: null,
      dew_point: null,
      precipitation: null,
      weather_code: null,
      pressure: null,
      wind_speed: null,
      wind_gusts: null,
      visibility: null,
      uv_index: null,
      sunshine: null,
      estimated_hourly_sunshine_minutes: null,
    });
  }
  return hourly;
}

function saveDailyData(year: string, month: string, day: string, data: DailyData) {
  const dailyDir = path.join(DATA_DIR, 'daily', year, month);
  if (!fs.existsSync(dailyDir)) {
    fs.mkdirSync(dailyDir, { recursive: true });
  }
  const dailyFile = path.join(dailyDir, `${day}.json`);
  fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));
}

function saveHourlyData(year: string, month: string, day: string, data: HourlyData[]) {
  const hourlyDir = path.join(DATA_DIR, 'hourly', year, month);
  if (!fs.existsSync(hourlyDir)) {
    fs.mkdirSync(hourlyDir, { recursive: true });
  }
  const hourlyFile = path.join(hourlyDir, `${day}.json`);
  fs.writeFileSync(hourlyFile, JSON.stringify(data, null, 2));
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return daysInMonth[month - 1];
}

async function generateFutureData() {
  console.log('[INFO] Génération des données futures (2026 oct-déc, 2027 complet)...');

  // 2026: Octobre (10), Novembre (11), Décembre (12)
  const year2026Months = [10, 11, 12];
  
  // 2027: Tous les mois
  const year2027Months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  let totalDailyFiles = 0;
  let totalHourlyFiles = 0;

  // Générer 2026 oct-déc
  for (const month of year2026Months) {
    const monthStr = month.toString().padStart(2, '0');
    const daysInMonth = getDaysInMonth(2026, month);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const date = `2026-${monthStr}-${dayStr}`;
      
      const dailyData = createDailyData(date);
      const hourlyData = createHourlyData(date);
      
      saveDailyData('2026', monthStr, dayStr, dailyData);
      saveHourlyData('2026', monthStr, dayStr, hourlyData);
      
      totalDailyFiles++;
      totalHourlyFiles++;
    }
    console.log(`[PROGRESS] 2026-${monthStr}: ${daysInMonth} jours créés`);
  }

  // Générer 2027 complet
  for (const month of year2027Months) {
    const monthStr = month.toString().padStart(2, '0');
    const daysInMonth = getDaysInMonth(2027, month);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const date = `2027-${monthStr}-${dayStr}`;
      
      const dailyData = createDailyData(date);
      const hourlyData = createHourlyData(date);
      
      saveDailyData('2027', monthStr, dayStr, dailyData);
      saveHourlyData('2027', monthStr, dayStr, hourlyData);
      
      totalDailyFiles++;
      totalHourlyFiles++;
    }
    console.log(`[PROGRESS] 2027-${monthStr}: ${daysInMonth} jours créés`);
  }

  console.log(`\n[SUCCESS] Génération terminée !`);
  console.log(`[DETAILS] ${totalDailyFiles} fichiers quotidiens créés`);
  console.log(`[DETAILS] ${totalHourlyFiles} fichiers horaires créés`);
  console.log(`[INFO] Données vides (null) pour indiquer indisponibilité`);
}

// Exécution
if (require.main === module) {
  generateFutureData()
    .then(() => {
      console.log('[COMPLETE] Script terminé avec succès.');
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('[FAILED] Échec:', error.message);
      process.exit(1);
    });
}