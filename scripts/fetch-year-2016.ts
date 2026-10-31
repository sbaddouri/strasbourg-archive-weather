import axios from 'axios';
import fs from 'fs';
import path from 'path';
import {
  calculateHourlySunshine,
  calculateDailySunshine,
  formatSunshineDuration,
  calculateSunshineConsistency,
  convertOfficialSunshineToMinutes
} from '../src/lib/weather-colors';

const LAT = 34.2257;
const LON = -3.3536;
const TIMEZONE = 'Africa/Casablanca';
const MODEL = 'best_match';

const DATA_DIR = path.join(process.cwd(), 'data');

async function fetchAndSaveYear2016() {
  console.log(`[INFO] Récupération de l'année 2016 depuis Open-Meteo...`);
  console.log(`[INFO] Coordonnées: LAT=${LAT}, LON=${LON}, Modèle: ${MODEL}, Timezone: ${TIMEZONE}`);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=2016-01-01&end_date=2016-12-31&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m,visibility,uv_index,sunshine_duration&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,sunrise,sunset&timezone=${TIMEZONE}&models=${MODEL}`;

  const response = await axios.get(url, { timeout: 120000 });
  const data = response.data;

  if (!data || !data.daily || !data.hourly) {
    throw new Error('Réponse invalide reçue d\'Open-Meteo');
  }

  const daily = data.daily;
  const hourly = data.hourly;
  const dates = daily.time;

  console.log(`[INFO] Données reçues: ${dates.length} jours, ${hourly.time.length} heures.`);
  console.log(`[INFO] Modèle API: ${JSON.stringify(data.hourly_units ? { timezone: data.timezone, generationtime_ms: data.generationtime_ms } : {})}`);

  if (dates.length !== 366) {
    throw new Error(`Année 2016 incomplète: ${dates.length} jours reçus (attendu 366, année bissextile).`);
  }
  if (hourly.time.length !== 366 * 24) {
    throw new Error(`Heures 2016 incomplètes: ${hourly.time.length} (attendu ${366 * 24}).`);
  }

  const hourlyByDate: { [key: string]: any[] } = {};
  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i];
    const date = time.split('T')[0];
    if (!hourlyByDate[date]) hourlyByDate[date] = [];

    const hourlyWeatherCode = hourly.weather_code[i];
    const estimatedHourly = calculateHourlySunshine(hourlyWeatherCode);

    hourlyByDate[date].push({
      time,
      temp: hourly.temperature_2m[i],
      humidity: hourly.relative_humidity_2m[i],
      dew_point: hourly.dew_point_2m[i],
      precipitation: hourly.precipitation[i],
      weather_code: hourlyWeatherCode,
      pressure: hourly.pressure_msl[i],
      wind_speed: hourly.wind_speed_10m[i],
      wind_gusts: hourly.wind_gusts_10m[i],
      visibility: hourly.visibility[i],
      uv_index: hourly.uv_index[i],
      sunshine: hourly.sunshine_duration[i],
      estimated_hourly_sunshine_minutes: estimatedHourly
    });
  }

  let savedDaily = 0;
  let savedHourly = 0;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const [year, month, day] = date.split('-');
    const dailyDir = path.join(DATA_DIR, 'daily', year, month);
    const hourlyDir = path.join(DATA_DIR, 'hourly', year, month);

    if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });
    if (!fs.existsSync(hourlyDir)) fs.mkdirSync(hourlyDir, { recursive: true });

    const hourlyDataForDate = hourlyByDate[date] || [];
    const estimatedDailyMinutes = calculateDailySunshine(
      hourlyDataForDate,
      daily.sunrise[i],
      daily.sunset[i]
    );

    const sunshineDurationSeconds = daily.sunshine_duration[i];
    const sunshineDurationMinutes = convertOfficialSunshineToMinutes(sunshineDurationSeconds);

    const sunshineDifferenceMinutes = (sunshineDurationMinutes !== null && estimatedDailyMinutes !== null)
      ? Math.abs(sunshineDurationMinutes - estimatedDailyMinutes)
      : null;
    const consistency = calculateSunshineConsistency(sunshineDurationMinutes, estimatedDailyMinutes);
    const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);

    const dayData = {
      date,
      weather_code: daily.weather_code[i],
      temp_max: daily.temperature_2m_max[i],
      temp_min: daily.temperature_2m_min[i],
      temp_mean: daily.temperature_2m_mean[i],
      precipitation: daily.precipitation_sum[i],
      sunshine: sunshineDurationSeconds,
      wind_speed_max: daily.wind_speed_10m_max[i],
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      sunshine_duration_seconds: sunshineDurationSeconds,
      sunshine_duration_minutes: sunshineDurationMinutes,
      estimated_daily_sunshine_minutes: estimatedDailyMinutes,
      estimated_daily_sunshine: estimatedDailySunshine,
      sunshine_difference_minutes: sunshineDifferenceMinutes,
      sunshine_consistency: consistency
    };

    fs.writeFileSync(path.join(dailyDir, `${day}.json`), JSON.stringify(dayData, null, 2));
    savedDaily++;

    if (hourlyDataForDate.length > 0) {
      fs.writeFileSync(path.join(hourlyDir, `${day}.json`), JSON.stringify(hourlyDataForDate, null, 2));
      savedHourly++;
    }
  }

  console.log(`[SUCCESS] Année 2016 complétée : ${savedDaily} fichiers journaliers et ${savedHourly} fichiers horaires enregistrés.`);
}

fetchAndSaveYear2016().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
