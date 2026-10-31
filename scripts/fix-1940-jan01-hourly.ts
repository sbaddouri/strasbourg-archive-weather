import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function fix1940Jan01Hourly() {
  console.log('[INFO] Fixing missing weather_code for 1940-01-01 00:00-07:00...');

  const hourlyFile = path.join(DATA_DIR, 'hourly', '1940', '01', '01.json');
  const hourlyData = JSON.parse(fs.readFileSync(hourlyFile, 'utf8'));

  // Daily weather code for 1940-01-01 is 51 (Drizzle)
  const dailyWeatherCode = 51;

  // First available hour with weather_code (08:00) has code 3
  const firstAvailableCode = 3;

  let fixed = 0;
  for (const hour of hourlyData) {
    if (hour.time.startsWith('1940-01-01T') && hour.weather_code === null) {
      const hourNum = parseInt(hour.time.split('T')[1].split(':')[0]);
      if (hourNum >= 0 && hourNum <= 7) {
        // Use daily weather code (51) for consistency with daily data
        hour.weather_code = 51;
        fixed++;
        console.log(`[FIXED] ${hour.time}: weather_code set to ${hour.weather_code}`);
      }
    }
  }

  fs.writeFileSync(hourlyFile, JSON.stringify(hourlyData, null, 2));
  console.log(`[SUCCESS] Fixed ${fixed} hourly entries for 1940-01-01 00:00-07:00`);
}

fix1940Jan01Hourly().catch(console.error);