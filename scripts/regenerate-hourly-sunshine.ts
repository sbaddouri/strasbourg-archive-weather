import fs from 'fs';
import path from 'path';
import { calculateHourlySunshineWithDaylight } from '../src/lib/weather-colors';

const DATA_DIR = path.join(process.cwd(), 'data');
const HOURLY_DIR = path.join(DATA_DIR, 'hourly');
const DAILY_DIR = path.join(DATA_DIR, 'daily');

function getTimeMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes('T')) return 0;
  const timePart = timeStr.split('T')[1];
  if (!timePart || !timePart.includes(':')) return 0;
  const [hour, minute] = timePart.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return 0;
  return hour * 60 + minute;
}

async function regenerateHourlyFile(year: string, month: string, day: string) {
  const hourlyFilePath = path.join(HOURLY_DIR, year, month, `${day}.json`);
  const dailyFilePath = path.join(DAILY_DIR, year, month, `${day}.json`);

  if (!fs.existsSync(hourlyFilePath)) return;

  const hourlyData = JSON.parse(fs.readFileSync(hourlyFilePath, 'utf8'));
  
  let sunrise: string | null | undefined = null;
  let sunset: string | null | undefined = null;
  
  if (fs.existsSync(dailyFilePath)) {
    const dailyData = JSON.parse(fs.readFileSync(dailyFilePath, 'utf8'));
    sunrise = dailyData.sunrise ?? null;
    sunset = dailyData.sunset ?? null;
  }

  // Recalculate estimated_hourly_sunshine_minutes for each hour
  const updatedData = hourlyData.map((hour: any) => {
    const weatherCode = hour.weather_code ?? 0;
    const timeStr = hour.time;
    
    const estimatedMinutes = calculateHourlySunshineWithDaylight(
      weatherCode,
      timeStr,
      sunrise,
      sunset
    );

    return {
      ...hour,
      estimated_hourly_sunshine_minutes: estimatedMinutes
    };
  });

  fs.writeFileSync(hourlyFilePath, JSON.stringify(updatedData, null, 2));
  console.log(`Regenerated: ${year}/${month}/${day}.json`);
}

async function main() {
  const years = fs.readdirSync(HOURLY_DIR).filter(f => !f.startsWith('.')).sort();
  
  for (const year of years) {
    const yearPath = path.join(HOURLY_DIR, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;
    
    const months = fs.readdirSync(yearPath).filter(f => !f.startsWith('.')).sort();
    
    for (const month of months) {
      const monthPath = path.join(yearPath, month);
      if (!fs.statSync(monthPath).isDirectory()) continue;
      
      const days = fs.readdirSync(monthPath)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''))
        .sort();
      
      for (const day of days) {
        await regenerateHourlyFile(year, month, day);
      }
    }
  }
  
  console.log('All hourly files regenerated!');
}

main().catch(console.error);