import fs from 'fs';
import path from 'path';
import { parseISO } from 'date-fns';

const YEAR = 1999;
const EXPECTED_DAYS = 365; // 1999 n'est pas une année bissextile
const EXPECTED_MONTHS = 12;
const DAYS_IN_MONTH: { [key: string]: number } = {
  '01': 31, '02': 28, '03': 31, '04': 30, '05': 31, '06': 30,
  '07': 31, '08': 31, '09': 30, '10': 31, '11': 30, '12': 31
};

const DATA_DIR = path.join(process.cwd(), 'data');

interface DailyData {
  date: string;
  weather_code: number;
  temp_max: number;
  temp_min: number;
  temp_mean: number;
  precipitation: number;
  sunshine: number;
  wind_speed_max: number;
  sunrise: string;
  sunset: string;
  sunshine_duration_seconds: number;
  sunshine_duration_minutes: number;
  estimated_daily_sunshine_minutes: number;
  estimated_daily_sunshine: string;
  sunshine_difference_minutes: number;
  sunshine_consistency: string;
}

interface HourlyData {
  time: string;
  temp: number;
  humidity: number;
  dew_point: number;
  precipitation: number;
  weather_code: number;
  pressure: number;
  wind_speed: number;
  wind_gusts: number;
  visibility: number | null;
  uv_index: number | null;
  sunshine: number;
  estimated_hourly_sunshine_minutes: number;
}

function validateDailyData(data: any, date: string): boolean {
  const requiredFields = [
    'date', 'weather_code', 'temp_max', 'temp_min', 'temp_mean',
    'precipitation', 'sunshine', 'wind_speed_max', 'sunrise', 'sunset'
  ];

  // Vérifier les champs requis
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      console.error(`[ERROR] Champ manquant: ${field} pour ${date}`);
      return false;
    }
  }

  // Vérifier le format de date
  if (data.date !== date) {
    console.error(`[ERROR] Incohérence de date: ${data.date} ≠ ${date}`);
    return false;
  }

  // Vérifier la cohérence des températures
  if (data.temp_max < data.temp_min) {
    console.error(`[ERROR] Temp max < temp min pour ${date}: ${data.temp_max} < ${data.temp_min}`);
    return false;
  }

  if (Math.abs(data.temp_mean - (data.temp_max + data.temp_min) / 2) > 5) {
    console.warn(`[WARNING] Temp moyenne suspecte pour ${date}: ${data.temp_mean} vs moyenne=${(data.temp_max + data.temp_min) / 2}`);
  }

  // Vérifier les valeurs non négatives
  if (data.precipitation < 0) {
    console.error(`[ERROR] Précipitations négatives pour ${date}: ${data.precipitation}`);
    return false;
  }

  if (data.sunshine < 0) {
    console.error(`[ERROR] Ensoleillement négatif pour ${date}: ${data.sunshine}`);
    return false;
  }

  return true;
}

function validateHourlyData(hourlyData: HourlyData[], date: string): boolean {
  // Vérifier qu'il y a 24 heures pour une journée complète
  if (hourlyData.length !== 24) {
    console.warn(`[WARNING] Nombre d'heures incorrect pour ${date}: ${hourlyData.length}/24`);
    // Ce n'est pas une erreur fatale, certaines API peuvent avoir moins d'heures
  }

  let validCount = 0;
  for (const hour of hourlyData) {
    // Vérifier le format de l'heure
    if (!hour.time.includes(date)) {
      console.error(`[ERROR] Heure hors date: ${hour.time} pour date ${date}`);
      return false;
    }

    // Vérifier les champs requis
    if (hour.temp === undefined || hour.weather_code === undefined) {
      console.error(`[ERROR] Champs manquants dans les données horaires pour ${hour.time}`);
      return false;
    }

    validCount++;
  }

  return true;
}

async function verifyYear1999Data() {
  console.log(`[INFO] Vérification de l'intégrité des données de l'année ${YEAR}...`);
  console.log(`[INFO] Dossier de données: ${DATA_DIR}`);

  const dailyDir = path.join(DATA_DIR, 'daily', String(YEAR));
  const hourlyDir = path.join(DATA_DIR, 'hourly', String(YEAR));

  // Vérifier que les dossiers existent
  if (!fs.existsSync(dailyDir)) {
    console.error(`[ERROR] Dossier daily manquant: ${dailyDir}`);
    return false;
  }

  if (!fs.existsSync(hourlyDir)) {
    console.error(`[ERROR] Dossier hourly manquant: ${hourlyDir}`);
    return false;
  }

  // Lire les mois disponibles
  const months = fs.readdirSync(dailyDir).sort();
  console.log(`[INFO] Mois trouvés: ${months.length} (${months.join(', ')})`);

  if (months.length !== EXPECTED_MONTHS) {
    console.warn(`[WARNING] Nombre de mois incorrect: ${months.length} sur ${EXPECTED_MONTHS} attendus`);
  }

  let totalDays = 0;
  let validDays = 0;
  const invalidDays: string[] = [];

  // Vérifier chaque mois
  for (const month of months) {
    const monthDailyDir = path.join(dailyDir, month);
    const monthHourlyDir = path.join(hourlyDir, month);

    if (!fs.existsSync(monthDailyDir)) {
      console.error(`[ERROR] Dossier daily du mois manquant: ${monthDailyDir}`);
      continue;
    }

    if (!fs.existsSync(monthHourlyDir)) {
      console.error(`[ERROR] Dossier hourly du mois manquant: ${monthHourlyDir}`);
      continue;
    }

    // Lire les jours du mois
    const days = fs.readdirSync(monthDailyDir).map(d => d.replace('.json', '')).sort();
    console.log(`[INFO] Mois ${month}: ${days.length} jours trouvés`);

    // Vérifier le nombre de jours attendu pour ce mois
    const expectedDaysInMonth = DAYS_IN_MONTH[month] || 31;
    if (days.length !== expectedDaysInMonth) {
      console.warn(`[WARNING] Mois ${month}: ${days.length} jours sur ${expectedDaysInMonth} attendus`);
    }

    // Vérifier chaque jour
    for (const day of days) {
      const date = `${YEAR}-${month}-${day.padStart(2, '0')}`;
      totalDays++;

      try {
        // Vérifier les données quotidiennes
        const dailyFile = path.join(monthDailyDir, `${day}.json`);
        const dailyContent = fs.readFileSync(dailyFile, 'utf-8');
        const dailyData: DailyData = JSON.parse(dailyContent);

        if (!validateDailyData(dailyData, date)) {
          invalidDays.push(date);
          continue;
        }

        // Vérifier les données horaires
        const hourlyFile = path.join(monthHourlyDir, `${day}.json`);
        if (!fs.existsSync(hourlyFile)) {
          console.error(`[ERROR] Fichier horaire manquant pour ${date}`);
          invalidDays.push(date);
          continue;
        }

        const hourlyContent = fs.readFileSync(hourlyFile, 'utf-8');
        const hourlyData: HourlyData[] = JSON.parse(hourlyContent);

        if (!validateHourlyData(hourlyData, date)) {
          invalidDays.push(date);
          continue;
        }

        // Vérifier la cohérence entre daily et hourly
        const hourlyPrecipSum = hourlyData.reduce((sum, h) => sum + h.precipitation, 0);
        if (Math.abs(hourlyPrecipSum - dailyData.precipitation) > 0.1) {
          console.warn(`[WARNING] Incohérence de précipitations pour ${date}: daily=${dailyData.precipitation}, hourly sum=${hourlyPrecipSum}`);
        }

        validDays++;

      } catch (error: any) {
        console.error(`[ERROR] Erreur de lecture pour ${date}:`, error.message);
        invalidDays.push(date);
      }
    }
  }

  // Résumé
  console.log(`\n[SUMMARY] Vérification terminée pour l'année ${YEAR}`);
  console.log(`[SUMMARY] Jours totaux traités: ${totalDays}`);
  console.log(`[SUMMARY] Jours valides: ${validDays}`);
  console.log(`[SUMMARY] Jours invalides: ${invalidDays.length}`);

  if (invalidDays.length > 0) {
    console.log(`[SUMMARY] Jours invalides: ${invalidDays.slice(0, 10).join(', ')}${invalidDays.length > 10 ? '...' : ''}`);
  }

  if (totalDays === EXPECTED_DAYS && validDays === totalDays) {
    console.log(`\n[SUCCESS] ✅ Tous les ${EXPECTED_DAYS} jours de l'année ${YEAR} sont valides et complets !`);
    return true;
  } else if (validDays >= 360) {
    console.log(`\n[SUCCESS] ⚠️  L'année ${YEAR} est presque complète: ${validDays}/${EXPECTED_DAYS} jours valides`);
    return true;
  } else {
    console.error(`\n[FAILURE] ❌ L'année ${YEAR} est incomplète: ${validDays}/${EXPECTED_DAYS} jours valides seulement`);
    return false;
  }
}

// Exécution si le script est appelé directement
if (require.main === module) {
  verifyYear1999Data()
    .then((success) => {
      if (success) {
        console.log(`[COMPLETE] Vérification de l'année ${YEAR} réussie.`);
        process.exit(0);
      } else {
        console.error(`[COMPLETE] Vérification de l'année ${YEAR} échouée.`);
        process.exit(1);
      }
    })
    .catch((error: any) => {
      console.error(`[ERROR] Erreur pendant la vérification:`, error.message);
      process.exit(1);
    });
}

export { verifyYear1999Data };