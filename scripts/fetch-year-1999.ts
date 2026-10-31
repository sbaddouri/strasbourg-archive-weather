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
const YEAR = 1999;
const EXPECTED_DAYS = 365; // 1999 n'est pas une année bissextile

const DATA_DIR = path.join(process.cwd(), 'data');

async function fetchAndSaveYear1999() {
  console.log(`[INFO] Récupération intégrale de l'année ${YEAR} depuis Open-Meteo...`);
  console.log(`[INFO] Coordonnées: LAT=${LAT}, LON=${LON}, Modèle: ${MODEL}, Timezone: ${TIMEZONE}`);
  console.log(`[INFO] L'année 1999 n'est pas bissextile - 365 jours attendus.`);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${YEAR}-01-01&end_date=${YEAR}-12-31&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m,visibility,uv_index,sunshine_duration&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,sunrise,sunset&timezone=${TIMEZONE}&models=${MODEL}`;

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

    // Validation des données
    if (dates.length !== EXPECTED_DAYS) {
      console.warn(`[WARNING] Année ${YEAR} peut être incomplète: ${dates.length} jours reçus (attendu ${EXPECTED_DAYS}).`);
    }
    
    // Vérifier que tous les jours sont de l'année 1999
    for (const date of dates) {
      if (!date.startsWith('1999-')) {
        throw new Error(`Date hors ${YEAR} reçue: ${date}`);
      }
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
      if (year !== String(YEAR)) {
        throw new Error(`Date hors ${YEAR} reçue: ${date}`);
      }
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

      const officialSunshineSeconds = daily.sunshine_duration[i];
      const officialSunshineMinutes = convertOfficialSunshineToMinutes(officialSunshineSeconds);

      const sunshineDifferenceMinutes = (officialSunshineMinutes !== null && estimatedDailyMinutes !== null)
        ? Math.abs(officialSunshineMinutes - estimatedDailyMinutes)
        : null;
      const consistency = calculateSunshineConsistency(officialSunshineMinutes, estimatedDailyMinutes);
      const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);

      const dailyData = {
        date,
        weather_code: daily.weather_code[i],
        temp_max: daily.temperature_2m_max[i],
        temp_min: daily.temperature_2m_min[i],
        temp_mean: daily.temperature_2m_mean[i],
        precipitation: daily.precipitation_sum[i],
        sunshine: officialSunshineSeconds,
        wind_speed_max: daily.wind_speed_10m_max[i],
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
        sunshine_duration_seconds: officialSunshineSeconds,
        sunshine_duration_minutes: officialSunshineMinutes,
        estimated_daily_sunshine_minutes: estimatedDailyMinutes,
        estimated_daily_sunshine: estimatedDailySunshine,
        sunshine_difference_minutes: sunshineDifferenceMinutes,
        sunshine_consistency: consistency
      };

      // Sauvegarde des données quotidiennes
      const dailyFile = path.join(dailyDir, `${day}.json`);
      fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2));
      savedDaily++;

      // Sauvegarde des données horaires
      const hourlyFile = path.join(hourlyDir, `${day}.json`);
      fs.writeFileSync(hourlyFile, JSON.stringify(hourlyDataForDate, null, 2));
      savedHourly++;

      if (savedDaily % 50 === 0) {
        console.log(`[PROGRESS] ${savedDaily}/${dates.length} jours traités...`);
      }
    }

    console.log(`\n[SUCCESS] Année ${YEAR} entièrement récupérée et sauvegardée !`);
    console.log(`[DETAILS] ${savedDaily} fichiers quotidiens créés`);
    console.log(`[DETAILS] ${savedHourly} fichiers horaires créés`);
    console.log(`[DETAILS] Structure de dossiers créée dans: ${DATA_DIR}/daily/${YEAR} et ${DATA_DIR}/hourly/${YEAR}`);

    // Vérification finale
    const actualDailyCount = fs.readdirSync(path.join(DATA_DIR, 'daily', String(YEAR))).reduce((count, month) => {
      const monthDir = path.join(DATA_DIR, 'daily', String(YEAR), month);
      if (fs.existsSync(monthDir)) {
        return count + fs.readdirSync(monthDir).length;
      }
      return count;
    }, 0);

    console.log(`[VERIFICATION] ${actualDailyCount} fichiers quotidiens existent dans le système de fichiers`);
    
    if (actualDailyCount === EXPECTED_DAYS) {
      console.log(`[VERIFICATION] ✅ SUCCÈS: Tous les ${EXPECTED_DAYS} jours sont présents`);
    } else {
      console.warn(`[VERIFICATION] ⚠️ ATTENTION: ${actualDailyCount} jours trouvés sur ${EXPECTED_DAYS} attendus`);
    }

  } catch (error: any) {
    console.error(`[ERROR] Échec de la récupération de l'année ${YEAR}:`, error.message);
    
    if (error.response) {
      console.error(`[ERROR] Code de statut HTTP: ${error.response.status}`);
      console.error(`[ERROR] Données de réponse:`, error.response.data);
    } else if (error.request) {
      console.error(`[ERROR] Aucune réponse reçue d'Open-Meteo`);
    }
    
    throw error;
  }
}

// Exécution si le script est appelé directement
if (require.main === module) {
  fetchAndSaveYear1999()
    .then(() => {
      console.log(`[COMPLETE] Script d'import de l'année ${YEAR} terminé avec succès.`);
      process.exit(0);
    })
    .catch((error: any) => {
      console.error(`[FAILED] Échec du script d'import de l'année ${YEAR}:`, error.message);
      process.exit(1);
    });
}

export { fetchAndSaveYear1999 };