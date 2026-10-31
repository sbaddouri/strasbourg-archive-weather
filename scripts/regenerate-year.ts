import fs from 'fs';
import path from 'path';
import {
  calculateHourlySunshineWithDaylight,
  calculateDailySunshine,
  formatSunshineDuration,
  calculateSunshineConsistency,
  convertOfficialSunshineToMinutes
} from '../src/lib/weather-colors';

const DATA_DIR = path.join(process.cwd(), 'data');

interface DailyData {
  date: string;
  weather_code: number | null;
  temp_max: number | null;
  temp_min: number | null;
  temp_mean: number | null;
  precipitation: number | null;
  sunshine: number | null;
  wind_speed_max: number | null;
  sunrise: string | null;
  sunset: string | null;
  sunshine_duration_seconds: number | null;
  sunshine_duration_minutes: number | null;
  estimated_daily_sunshine_minutes: number | null;
  estimated_daily_sunshine: string | null;
  sunshine_difference_minutes: number | null;
  sunshine_consistency: 'Excellent' | 'Bon' | 'Moyen' | 'Faible' | null;
}

interface HourlyData {
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
  sunshine: number | null;
  estimated_hourly_sunshine_minutes: number | null;
}

function getTimeMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes('T')) return 0;
  const timePart = timeStr.split('T')[1];
  if (!timePart || !timePart.includes(':')) return 0;
  const [hour, minute] = timePart.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return 0;
  return hour * 60 + minute;
}

async function regenerateYear(year: string) {
  console.log(`\n=== REGENERATING YEAR ${year} ===`);
  
  const yearDir = path.join(DATA_DIR, 'daily', year);
  if (!fs.existsSync(yearDir)) {
    console.log(`No data directory for year ${year}`);
    return;
  }

  const months = fs.readdirSync(yearDir).sort();
  let totalDaysProcessed = 0;
  let totalHoursFixed = 0;

  for (const month of months) {
    const dailyMonthDir = path.join(DATA_DIR, 'daily', year, month);
    const hourlyMonthDir = path.join(DATA_DIR, 'hourly', year, month);
    
    if (!fs.existsSync(dailyMonthDir)) continue;

    const dailyFiles = fs.readdirSync(dailyMonthDir).filter(f => f.endsWith('.json')).sort();
    
    for (const file of dailyFiles) {
      const day = file.replace('.json', '');
      const date = `${year}-${month}-${day}`;
      
      // Read daily data
      const dailyFilePath = path.join(dailyMonthDir, file);
      const dailyData: DailyData = JSON.parse(fs.readFileSync(dailyFilePath, 'utf8'));
      
      // Read hourly data
      const hourlyFilePath = path.join(hourlyMonthDir, file);
      let hourlyData: HourlyData[] = [];
      if (fs.existsSync(hourlyFilePath)) {
        hourlyData = JSON.parse(fs.readFileSync(hourlyFilePath, 'utf8'));
      }

      const sunrise = dailyData.sunrise;
      const sunset = dailyData.sunset;

      if (!sunrise || !sunset) {
        console.log(`  ⚠️  ${date}: Missing sunrise/sunset, skipping`);
        continue;
      }

      // Recalculate hourly sunshine
      let hoursFixed = 0;
      const correctedHourlyData = hourlyData.map(hour => {
        const oldEstimated = hour.estimated_hourly_sunshine_minutes;
        const newEstimated = calculateHourlySunshineWithDaylight(
          hour.weather_code ?? 0,
          hour.time,
          sunrise,
          sunset
        );
        if (oldEstimated !== newEstimated) hoursFixed++;
        return {
          ...hour,
          estimated_hourly_sunshine_minutes: newEstimated
        };
      });

      // Recalculate daily sunshine
      const estimatedDailyMinutes = calculateDailySunshine(
        correctedHourlyData,
        sunrise,
        sunset
      );
      
      const sunshineDurationSeconds = dailyData.sunshine ?? null;
      const sunshineDurationMinutes = convertOfficialSunshineToMinutes(sunshineDurationSeconds);
      
      const sunshineDifferenceMinutes = (sunshineDurationMinutes !== null && estimatedDailyMinutes !== null)
        ? Math.abs(sunshineDurationMinutes - estimatedDailyMinutes)
        : null;
      const consistency = calculateSunshineConsistency(sunshineDurationMinutes, estimatedDailyMinutes);
      const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);

      // Update daily data
      const correctedDailyData: DailyData = {
        ...dailyData,
        sunshine_duration_seconds: sunshineDurationSeconds,
        sunshine_duration_minutes: sunshineDurationMinutes,
        estimated_daily_sunshine_minutes: estimatedDailyMinutes,
        estimated_daily_sunshine: estimatedDailySunshine,
        sunshine_difference_minutes: sunshineDifferenceMinutes,
        sunshine_consistency: consistency
      };

      // Save corrected data
      fs.writeFileSync(dailyFilePath, JSON.stringify(correctedDailyData, null, 2));
      
      if (correctedHourlyData.length > 0) {
        fs.writeFileSync(hourlyFilePath, JSON.stringify(correctedHourlyData, null, 2));
      }

      totalDaysProcessed++;
      totalHoursFixed += hoursFixed;
      
      if (hoursFixed > 0) {
        console.log(`  ✅ ${date}: Fixed ${hoursFixed} hourly values, Daily: ${estimatedDailyMinutes} min`);
      }
    }
  }

  console.log(`\n=== YEAR ${year} COMPLETE ===`);
  console.log(`Days processed: ${totalDaysProcessed}`);
  console.log(`Hourly values fixed: ${totalHoursFixed}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/regenerate-year.ts <year>');
    console.log('Example: npx tsx scripts/regenerate-year.ts 1999');
    process.exit(1);
  }

  const year = args[0];
  
  if (!/^\d{4}$/.test(year)) {
    console.error('Year must be a 4-digit number (e.g., 1999)');
    process.exit(1);
  }

  const yearNum = parseInt(year);
  if (yearNum < 1940 || yearNum > 2026) {
    console.error('Year must be between 1940 and 2026');
    process.exit(1);
  }

  await regenerateYear(year);
}

main().catch((error) => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});