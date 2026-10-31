import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function fix1940Jan01() {
  console.log('[INFO] Calculating missing daily values for 1940-01-01 from hourly data...');

  // Load hourly data for 1940-01-01
  const hourlyFile = path.join(DATA_DIR, 'hourly', '1940', '01', '01.json');
  if (!fs.existsSync(hourlyFile)) {
    throw new Error('Hourly file not found');
  }

  const hourlyData = JSON.parse(fs.readFileSync(hourlyFile, 'utf8'));

  // Filter for 1940-01-01 hours (24 hours: 00:00 to 23:00)
  const jan01Hours = hourlyData.filter((h: any) => h.time.startsWith('1940-01-01T'));
  console.log(`[INFO] Found ${jan01Hours.length} hourly entries for 1940-01-01`);

  // Calculate temp_mean: average of available temperature_2m (skip null)
  const temps = jan01Hours.map((h: any) => h.temp).filter((t: any) => t !== null && t !== undefined);
  const tempMean = temps.length > 0 ? temps.reduce((a: number, b: number) => a + b, 0) / temps.length : null;
  console.log(`[INFO] temp_mean: ${tempMean?.toFixed(2)}°C (from ${temps.length}/24 hours)`);

  // Calculate precipitation_sum: sum of available precipitation (treat null as 0)
  const precip = jan01Hours.map((h: any) => h.precipitation ?? 0).reduce((a: number, b: number) => a + b, 0);
  console.log(`[INFO] precipitation_sum: ${precip.toFixed(2)}mm`);

  // Calculate sunshine_duration: sum of available sunshine_duration (treat null as 0)
  const sunshine = jan01Hours.map((h: any) => h.sunshine ?? 0).reduce((a: number, b: number) => a + b, 0);
  console.log(`[INFO] sunshine_duration: ${sunshine.toFixed(2)}s (${(sunshine/3600).toFixed(2)}h)`);

  // Update daily file
  const dailyFile = path.join(process.cwd(), 'data', 'daily', '1940', '01', '01.json');
  const dailyData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'daily', '1940', '01', '01.json'), 'utf8'));

  dailyData.temp_mean = tempMean;
  dailyData.precipitation = precip;
  dailyData.sunshine = sunshine;
  dailyData.sunshine_duration_seconds = sunshine;
  dailyData.sunshine_duration_minutes = sunshine > 0 ? Math.round(sunshine / 60) : null;

  // Recalculate estimated daily sunshine and consistency
  const { calculateDailySunshine, formatSunshineDuration, calculateSunshineConsistency, convertOfficialSunshineToMinutes } = await import('../src/lib/weather-colors');
  
  // We need to load hourly data with proper structure for calculateDailySunshine
  const hourlyForCalc = jan01Hours.map((h: any) => ({
    weather_code: h.weather_code,
    time: h.time,
    estimated_hourly_sunshine_minutes: h.estimated_hourly_sunshine_minutes
  }));

  // Get sunrise/sunset from daily data
  const sunrise = dailyData.sunrise;
  const sunset = dailyData.sunset;

  const estimatedDailyMinutes = calculateDailySunshine(hourlyForCalc, sunrise, sunset);
  const officialMinutes = sunshine > 0 ? Math.round(sunshine / 60) : null;
  const diffMinutes = (officialMinutes !== null && estimatedDailyMinutes !== null) ? Math.abs(officialMinutes - estimatedDailyMinutes) : null;
  const consistency = calculateSunshineConsistency(officialMinutes, estimatedDailyMinutes);
  const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);

  dailyData.estimated_daily_sunshine_minutes = estimatedDailyMinutes;
  dailyData.estimated_daily_sunshine = estimatedDailySunshine;
  dailyData.sunshine_difference_minutes = diffMinutes;
  dailyData.sunshine_consistency = consistency;

  fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2));
  console.log('[SUCCESS] Updated 1940-01-01 daily data with calculated values');
  console.log(`  temp_mean: ${tempMean?.toFixed(2)}°C`);
  console.log(`  precipitation: ${precip.toFixed(2)}mm`);
  console.log(`  sunshine: ${sunshine.toFixed(2)}s (${(sunshine/3600).toFixed(2)}h)`);
  console.log(`  estimated_daily_sunshine: ${estimatedDailySunshine}`);
  console.log(`  consistency: ${consistency}`);
}

fix1940Jan01().catch(console.error);