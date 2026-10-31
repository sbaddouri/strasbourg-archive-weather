import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { format, subDays, parseISO, addDays, isBefore, isAfter } from 'date-fns';
import {
  calculateHourlySunshineWithDaylight,
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
const STATUS_FILE = path.join(DATA_DIR, 'last-update-status.json');

type AttemptDetail = {
  date: string;
  success: boolean;
  error?: string;
};

type UpdateStatus = {
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

async function saveUpdateStatus(status: UpdateStatus) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    console.log('Update status saved.');
  } catch (error: any) {
    console.error('ERROR saving update status:', error.message);
  }
}

function generateDateRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  let currentDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);
  
  while (!isAfter(currentDate, endDate)) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

async function fetchWeatherData(startDate: string, endDate: string) {
  let currentEndDate = endDate;
  let attempts = 0;
  const maxAttempts = 5;
  const attemptDetails: AttemptDetail[] = [];

  console.log(`[INFO] Fetching data for start=${startDate}, end=${currentEndDate}`);
  
  while (attempts < maxAttempts) {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${startDate}&end_date=${currentEndDate}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m,visibility,uv_index,sunshine_duration&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,sunrise,sunset&timezone=${TIMEZONE}&models=${MODEL}`;
    
    console.log(`[INFO] Attempt ${attempts + 1}/${maxAttempts}: Fetching ${startDate} to ${currentEndDate}`);

    attemptDetails.push({
      date: currentEndDate,
      success: false
    });

    try {
      const response = await axios.get(url, { timeout: 60000 });
      
      // Validate response structure
      if (!response.data || !response.data.daily || !response.data.hourly) {
        throw new Error('Réponse invalide d\'Open-Meteo: données daily ou hourly manquantes');
      }
      
      if (!response.data.daily.time || response.data.daily.time.length === 0) {
        throw new Error('Réponse invalide d\'Open-Meteo: tableau daily.time vide');
      }
      
      // Validate we got the expected number of days
      const expectedDays = Math.ceil((new Date(currentEndDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const actualDays = response.data.daily.time.length;
      
      if (actualDays < expectedDays) {
        console.warn(`[WARNING] Received ${actualDays} days, expected ${expectedDays} days for ${startDate} to ${currentEndDate}`);
      }
      
      console.log(`[INFO] Successfully fetched ${actualDays} days (${startDate} to ${currentEndDate})`);

      attemptDetails[attemptDetails.length - 1].success = true;
      
      return {
        data: response.data,
        currentEndDate,
        attempts,
        attemptDetails
      };
    } catch (error: any) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      attemptDetails[attemptDetails.length - 1].error = errorMsg;
      
      console.error(`[ERROR] Failed to fetch data (status ${error.response?.status || 'N/A'}):`, errorMsg);
      
      // Retry on 400 (data not ready) - reduce end date by 1 day
      if (error.response?.status === 400 && attempts < maxAttempts - 1) {
        console.log(`[INFO] Data not yet available for ${currentEndDate}, retrying with previous day...`);
        const date = parseISO(currentEndDate);
        currentEndDate = format(subDays(date, 1), 'yyyy-MM-dd');
        attempts++;
        continue;
      }
      
      // Retry on server errors
      if (error.response?.status && error.response.status >= 500 && attempts < maxAttempts - 1) {
        console.log(`[INFO] Server error (status ${error.response.status}), retrying in 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
        continue;
      }
      
      // Retry on timeout
      if (error.code === 'ECONNABORTED' && attempts < maxAttempts - 1) {
        console.log(`[INFO] Request timeout, retrying in 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
        continue;
      }
      
      // Network errors - retry
      if ((error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') && attempts < maxAttempts - 1) {
        console.log(`[INFO] Network error (${error.code}), retrying in 10 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
        continue;
      }
      
      console.error('[ERROR] Non-retryable error fetching weather data:', error.message);
      return {
        data: null,
        currentEndDate,
        attempts,
        attemptDetails
      };
    }
  }
  
  console.error('[ERROR] Max attempts reached, giving up');
  return {
    data: null,
    currentEndDate,
    attempts,
    attemptDetails
  };
}

async function saveDailyAndHourlyData(daily: any, hourly: any) {
  try {
    const dates = daily.time;
    const savedDays: string[] = [];
    const hourlyByDate: { [key: string]: any[] } = {};

    // Step 1: Organize hourly data by date
    // Get sunrise/sunset for each date from daily data
    const sunriseByDate: { [key: string]: string } = {};
    const sunsetByDate: { [key: string]: string } = {};
    for (let i = 0; i < daily.time.length; i++) {
      sunriseByDate[daily.time[i]] = daily.sunrise[i];
      sunsetByDate[daily.time[i]] = daily.sunset[i];
    }

    for (let i = 0; i < hourly.time.length; i++) {
      const time = hourly.time[i];
      const date = time.split('T')[0];
      if (!hourlyByDate[date]) hourlyByDate[date] = [];

      const hourlyWeatherCode = hourly.weather_code[i];
      const sunrise = sunriseByDate[date];
      const sunset = sunsetByDate[date];
      const estimatedHourly = calculateHourlySunshineWithDaylight(hourlyWeatherCode, time, sunrise, sunset);

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

    // Step 2: Process and save daily and hourly data
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const [year, month, day] = date.split('-');
      const dailyDir = path.join(DATA_DIR, 'daily', year, month);
      const hourlyDir = path.join(DATA_DIR, 'hourly', year, month);
      
      if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });
      if (!fs.existsSync(hourlyDir)) fs.mkdirSync(hourlyDir, { recursive: true });

      // Validate required fields
      const requiredFields = [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'temperature_2m_mean', 'precipitation_sum', 'sunshine_duration',
        'wind_speed_10m_max', 'sunrise', 'sunset'
      ];
      
      const missingFields = requiredFields.filter(field => daily[field]?.[i] === undefined || daily[field]?.[i] === null);
      
      if (missingFields.length > 0) {
        console.warn(`[WARNING] Missing critical fields for ${date}: ${missingFields.join(', ')}. Skipping save for this day.`);
        missingDays.push(date);
        continue; // Skip saving this day to prevent corrupted data
      }

      // Calculate estimated daily sunshine from hourly data
      const hourlyDataForDate = hourlyByDate[date] || [];
      const estimatedDailyMinutes = calculateDailySunshine(
        hourlyDataForDate, 
        daily.sunrise[i], 
        daily.sunset[i]
      );

      // Calculate official values
      const sunshineDurationSeconds = daily.sunshine_duration[i];
      const sunshineDurationMinutes = convertOfficialSunshineToMinutes(sunshineDurationSeconds);

      // Calculate difference and consistency
      const sunshineDifferenceMinutes = (sunshineDurationMinutes !== null && estimatedDailyMinutes !== null)
        ? Math.abs(sunshineDurationMinutes - estimatedDailyMinutes)
        : null;
      const consistency = calculateSunshineConsistency(sunshineDurationMinutes, estimatedDailyMinutes);

      // Format estimated sunshine
      const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);

      const dayData = {
        date,
        weather_code: daily.weather_code[i],
        temp_max: daily.temperature_2m_max[i],
        temp_min: daily.temperature_2m_min[i],
        temp_mean: daily.temperature_2m_mean[i],
        precipitation: daily.precipitation_sum[i],
        sunshine: sunshineDurationSeconds, // Preserve original value for compatibility
        wind_speed_max: daily.wind_speed_10m_max[i],
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
        // New fields
        sunshine_duration_seconds: sunshineDurationSeconds,
        sunshine_duration_minutes: sunshineDurationMinutes,
        estimated_daily_sunshine_minutes: estimatedDailyMinutes,
        estimated_daily_sunshine: estimatedDailySunshine,
        sunshine_difference_minutes: sunshineDifferenceMinutes,
        sunshine_consistency: consistency
      };

      fs.writeFileSync(path.join(dailyDir, `${day}.json`), JSON.stringify(dayData, null, 2));
      savedDays.push(date);
      console.log(`[DEBUG] Saved data for ${date}`);

      // Save hourly data for this day
      if (hourlyDataForDate.length > 0) {
        fs.writeFileSync(path.join(hourlyDir, `${day}.json`), JSON.stringify(hourlyDataForDate, null, 2));
      }
    }
    
    console.log('[DEBUG] Daily and hourly data saved.');
    return savedDays;
  } catch (error: any) {
    console.error('ERROR saving data:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let initialStartDate: string;
  let initialEndDate: string;
  const now = new Date().toISOString();
  let finalStartDate: string = '';
  let finalEndDate: string = '';
  let attempts = 0;
  let attemptDetails: AttemptDetail[] = [];

  try {
    if (args.length === 2) {
      initialStartDate = args[0];
      initialEndDate = args[1];
    } else {
      // Force Casablanca timezone to prevent UTC day offset issues in GitHub Actions
      const casablancaTimeStr = new Date().toLocaleString("en-US", { timeZone: "Africa/Casablanca" });
      const today = new Date(casablancaTimeStr);
      const oneDayAgo = subDays(today, 1);
      initialEndDate = format(oneDayAgo, 'yyyy-MM-dd');
      initialStartDate = format(subDays(oneDayAgo, 30), 'yyyy-MM-dd');
    }
    finalStartDate = initialStartDate;
    finalEndDate = initialEndDate;

    console.log(`[DEBUG] Starting script: initialStartDate=${initialStartDate}, initialEndDate=${initialEndDate}`);
    const result = await fetchWeatherData(initialStartDate, initialEndDate);
    const { data, currentEndDate, attempts: fetchAttempts, attemptDetails: fetchAttemptDetails } = result;
    finalEndDate = currentEndDate;
    attempts = fetchAttempts;
    attemptDetails = fetchAttemptDetails;
    
    const daysUpdated: string[] = [];
    const missingDays: string[] = [];

    if (data) {
      // VÉRIFICATION CRITIQUE : Les données d'Open-Meteo sont-elles valides ?
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        throw new Error("Les données journalières d'Open-Meteo sont vides ou invalides !");
      }
      if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) {
        throw new Error("Les données horaires d'Open-Meteo sont vides ou invalides !");
      }

      daysUpdated.push(...await saveDailyAndHourlyData(data.daily, data.hourly));
      
      // Calculate missing days between finalStartDate and finalEndDate
      const allDaysInRange = generateDateRange(finalStartDate, finalEndDate);
      const savedSet = new Set(daysUpdated);
      for (const day of allDaysInRange) {
        if (!savedSet.has(day)) {
          missingDays.push(day);
        }
      }
      
      console.log(`[DEBUG] Days updated: ${daysUpdated.length}, Missing days: ${missingDays.length}`);
      
      const message = missingDays.length === 0 
        ? `Données mises à jour avec succès (${finalStartDate} à ${finalEndDate}), ${daysUpdated.length} jours mis à jour`
        : `Données mises à jour avec succès (${finalStartDate} à ${finalEndDate}), ${daysUpdated.length} jours mis à jour, ${missingDays.length} jours manquants`;
      
      await saveUpdateStatus({
        success: true,
        date: now,
        message,
        initialStartDate,
        initialEndDate,
        finalStartDate,
        finalEndDate,
        attempts,
        daysUpdated,
        missingDays,
        attemptDetails
      });
    } else {
      console.error('[ERROR] Failed to fetch weather data.');
      await saveUpdateStatus({
        success: false,
        date: now,
        message: 'Échec de la récupération des données météorologiques depuis Open-Meteo',
        initialStartDate,
        initialEndDate,
        finalStartDate,
        finalEndDate,
        attempts,
        daysUpdated,
        missingDays,
        attemptDetails
      });
      process.exitCode = 1;
    }
  } catch (error: any) {
    console.error('[FATAL ERROR]:', error.message);
    // Toujours sauvegarder le statut, même en cas d'erreur !
    try {
      await saveUpdateStatus({
        success: false,
        date: now,
        message: `ERREUR FATALE : ${error.message}`,
        initialStartDate: finalStartDate || 'Inconnu',
        initialEndDate: finalEndDate || 'Inconnu',
        finalStartDate: finalStartDate || 'Inconnu',
        finalEndDate: finalEndDate || 'Inconnu',
        attempts,
        daysUpdated: [],
        missingDays: [],
        attemptDetails
      });
    } catch (saveError: any) {
      console.error('[ERREUR IMPOSSIBLE] Impossible de sauvegarder le statut :', saveError.message);
    }
    process.exitCode = 1;
  }
}

main().catch((error: any) => {
  console.error('[FATAL ERROR]:', error.message);
  process.exitCode = 1;
});
