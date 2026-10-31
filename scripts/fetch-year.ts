import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LAT = 48.5388708;
const LON = 7.6254456;
const TIMEZONE = 'Europe/Paris';
const MODEL = 'best_match';

const DATA_DIR = path.join(process.cwd(), 'data');

const HOURLY_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'dew_point_2m',
  'precipitation',
  'weather_code',
  'pressure_msl',
  'wind_speed_10m',
  'wind_gusts_10m',
  'visibility',
  'uv_index',
  'sunshine_duration',
].join(',');

const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'temperature_2m_mean',
  'precipitation_sum',
  'sunshine_duration',
  'wind_speed_10m_max',
  'sunrise',
  'sunset',
].join(',');

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

async function fetchAndSaveYear(year: number, endDate?: string) {
  const startDate = `${year}-01-01`;
  const defaultEnd = `${year}-12-31`;
  const finalEndDate = endDate || defaultEnd;
  const expectedDays = isLeapYear(year) ? 366 : 365;

  console.log(`[INFO] Recuperation integrale de l'annee ${year} depuis Open-Meteo...`);
  console.log(`[INFO] Coordonnées: LAT=${LAT}, LON=${LON}, Modèle: ${MODEL}, Timezone: ${TIMEZONE}`);
  console.log(`[INFO] Période: ${startDate} à ${finalEndDate} (${expectedDays} jours attendus)`);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${startDate}&end_date=${finalEndDate}&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}&timezone=${TIMEZONE}&models=${MODEL}`;

  console.log(`[INFO] URL de requête: ${url}`);

  try {
    const response = await axios.get(url, { timeout: 180000 });
    const data = response.data;

    if (!data || !data.daily || !data.hourly) {
      throw new Error("Réponse invalide reçue d'Open-Meteo");
    }

    const daily = data.daily;
    const hourly = data.hourly;
    const dates: string[] = daily.time;

    console.log(`[INFO] Données reçues: ${dates.length} jours, ${hourly.time.length} heures.`);
    console.log(`[INFO] Timezone API: ${data.timezone}, generationtime_ms: ${data.generationtime_ms}`);

    for (const date of dates) {
      if (!date.startsWith(`${year}-`)) {
        throw new Error(`Date hors ${year} reçue: ${date}`);
      }
    }

    const hourlyByDate: { [key: string]: any[] } = {};
    for (let i = 0; i < hourly.time.length; i++) {
      const time = hourly.time[i];
      const date = time.split('T')[0];
      if (!hourlyByDate[date]) hourlyByDate[date] = [];

      hourlyByDate[date].push({
        time,
        temp: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i],
        dew_point: hourly.dew_point_2m[i],
        precipitation: hourly.precipitation[i],
        weather_code: hourly.weather_code[i],
        pressure: hourly.pressure_msl[i],
        wind_speed: hourly.wind_speed_10m[i],
        wind_gusts: hourly.wind_gusts_10m[i],
        visibility: hourly.visibility[i],
        uv_index: hourly.uv_index[i],
        sunshine: hourly.sunshine_duration[i],
      });
    }

    let savedDaily = 0;
    let savedHourly = 0;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const [yearPart, month, day] = date.split('-');
      if (yearPart !== String(year)) {
        throw new Error(`Date hors ${year} reçue: ${date}`);
      }

      const dailyDir = path.join(DATA_DIR, 'daily', yearPart, month);
      const hourlyDir = path.join(DATA_DIR, 'hourly', yearPart, month);

      if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });
      if (!fs.existsSync(hourlyDir)) fs.mkdirSync(hourlyDir, { recursive: true });

      const hourlyDataForDate = hourlyByDate[date] || [];

      // Valeurs brutes reçues de l'API Open-Meteo, sans estimation ni arrondi
      const dailyData = {
        date,
        weather_code: daily.weather_code[i],
        temp_max: daily.temperature_2m_max[i],
        temp_min: daily.temperature_2m_min[i],
        temp_mean: daily.temperature_2m_mean[i],
        precipitation: daily.precipitation_sum[i],
        sunshine: daily.sunshine_duration[i],
        wind_speed_max: daily.wind_speed_10m_max[i],
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
        sunshine_duration_seconds: daily.sunshine_duration[i],
      };

      const dailyFile = path.join(dailyDir, `${day}.json`);
      fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2));
      savedDaily++;

      const hourlyFile = path.join(hourlyDir, `${day}.json`);
      fs.writeFileSync(hourlyFile, JSON.stringify(hourlyDataForDate, null, 2));
      savedHourly++;

      if (savedDaily % 50 === 0) {
        console.log(`[PROGRESS] ${savedDaily}/${dates.length} jours traités...`);
      }
    }

    console.log(`\n[SUCCESS] Annee ${year} entièrement recuperée et sauvegardée !`);
    console.log(`[DETAILS] ${savedDaily} fichiers quotidiens créés`);
    console.log(`[DETAILS] ${savedHourly} fichiers horaires créés`);
    console.log(`[DETAILS] Structure de dossiers créée dans: ${DATA_DIR}/daily/${year} et ${DATA_DIR}/hourly/${year}`);

    const actualDailyCount = fs.readdirSync(path.join(DATA_DIR, 'daily', String(year))).reduce((count, month) => {
      const monthDir = path.join(DATA_DIR, 'daily', String(year), month);
      if (fs.existsSync(monthDir)) {
        return count + fs.readdirSync(monthDir).length;
      }
      return count;
    }, 0);

    console.log(`[VERIFICATION] ${actualDailyCount} fichiers quotidiens existent dans le système de fichiers`);

    if (actualDailyCount === dates.length) {
      console.log(`[VERIFICATION] ✅ SUCCÈS: Tous les ${dates.length} jours reçus sont présents`);
    } else {
      console.warn(`[VERIFICATION] ⚠️ ATTENTION: ${actualDailyCount} jours trouvés sur ${dates.length} reçus`);
    }

  } catch (error: any) {
    console.error(`[ERROR] Échec de la récupération de l'annee ${year}:`, error.message);

    if (error.response) {
      console.error(`[ERROR] Code de statut HTTP: ${error.response.status}`);
      console.error(`[ERROR] Données de réponse:`, error.response.data);
    } else if (error.request) {
      console.error(`[ERROR] Aucune réponse reçue d'Open-Meteo`);
    }

    throw error;
  }
}

const yearArg = process.argv[2];
const endDateArg = process.argv[3];

if (!yearArg || !/^\d{4}$/.test(yearArg)) {
  console.error('Usage: npx tsx scripts/fetch-year.ts <YYYY> [YYYY-MM-DD]');
  console.error('Exemple: npx tsx scripts/fetch-year.ts 2026 2026-10-31');
  process.exit(1);
}

const year = parseInt(yearArg, 10);

fetchAndSaveYear(year, endDateArg)
  .then(() => {
    console.log(`[COMPLETE] Script d'import de l'annee ${year} terminé avec succès.`);
    process.exit(0);
  })
  .catch((error: any) => {
    console.error(`[FAILED] Échec du script d'import de l'annee ${year}:`, error.message);
    process.exit(1);
  });

export { fetchAndSaveYear };
