import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  calculateHourlySunshineWithDaylight,
  calculateDailySunshine,
  formatSunshineDuration,
  calculateSunshineConsistency,
  convertOfficialSunshineToMinutes
} from '../src/lib/weather-colors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

interface HourlyDataRaw {
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
  estimated_hourly_sunshine_minutes?: number;
}

interface DailyDataRaw {
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

async function processDailyFile(
  dailyFilePath: string,
  hourlyFilePath: string
): Promise<boolean> {
  try {
    const dailyRaw = JSON.parse(fs.readFileSync(dailyFilePath, 'utf8')) as DailyDataRaw;
    
    const sunrise = dailyRaw.sunrise ?? null;
    const sunset = dailyRaw.sunset ?? null;

    if (!sunrise || !sunset) {
      console.log(`  ⚠️ Pas de lever/coucher pour ${dailyFilePath}`);
      return false;
    }

    // Charger les données horaires pour recalculer l'estimation journalière
    let hourlyData: HourlyDataRaw[] = [];
    if (fs.existsSync(hourlyFilePath)) {
      hourlyData = JSON.parse(fs.readFileSync(hourlyFilePath, 'utf8')) as HourlyDataRaw[];
    }

    // Recalculer l'ensoleillement estimé journalier à partir des données horaires corrigées
    const estimatedDailyMinutes = calculateDailySunshine(
      hourlyData.map(h => ({ time: h.time, weather_code: h.weather_code ?? 0 })),
      sunrise,
      sunset
    );

    const officialMinutes = convertOfficialSunshineToMinutes(dailyRaw.sunshine);
    const consistency = calculateSunshineConsistency(officialMinutes, estimatedDailyMinutes);
    const estimatedDailySunshine = formatSunshineDuration(estimatedDailyMinutes);
    const differenceMinutes = officialMinutes !== null && estimatedDailyMinutes !== null
      ? Math.abs(officialMinutes - estimatedDailyMinutes)
      : null;

    const needsUpdate = 
      dailyRaw.estimated_daily_sunshine_minutes !== estimatedDailyMinutes ||
      dailyRaw.estimated_daily_sunshine !== estimatedDailySunshine ||
      dailyRaw.sunshine_difference_minutes !== differenceMinutes ||
      dailyRaw.sunshine_consistency !== consistency ||
      dailyRaw.sunshine_duration_minutes !== officialMinutes;

    if (needsUpdate) {
      const updatedDaily = {
        ...dailyRaw,
        sunshine_duration_minutes: officialMinutes,
        estimated_daily_sunshine_minutes: estimatedDailyMinutes,
        estimated_daily_sunshine: estimatedDailySunshine,
        sunshine_difference_minutes: differenceMinutes,
        sunshine_consistency: consistency
      };
      
      fs.writeFileSync(dailyFilePath, JSON.stringify(updatedDaily, null, 2));
      console.log(`  ✅ Mis à jour: ${path.basename(dailyFilePath)} (est: ${estimatedDailyMinutes}min, off: ${officialMinutes}min, diff: ${differenceMinutes}min, coh: ${consistency})`);
      return true;
    } else {
      console.log(`  ⏭️ Déjà à jour: ${path.basename(dailyFilePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Erreur ${dailyFilePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔄 Régénération des valeurs d\'ensoleillement journalier...\n');
  
  const dailyDir = path.join(DATA_DIR, 'daily');
  if (!fs.existsSync(dailyDir)) {
    console.error('❌ Dossier daily non trouvé');
    return;
  }

  const years = fs.readdirSync(dailyDir).filter(f => fs.statSync(path.join(dailyDir, f)).isDirectory()).sort();
  let totalFiles = 0;
  let updatedFiles = 0;

  for (const year of years) {
    const yearDir = path.join(dailyDir, year);
    const months = fs.readdirSync(yearDir).filter(f => fs.statSync(path.join(yearDir, f)).isDirectory()).sort();
    
    console.log(`\n📅 Année ${year}:`);
    
    for (const month of months) {
      const monthDir = path.join(yearDir, month);
      const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.json')).sort();
      
      for (const file of files) {
        const dailyFilePath = path.join(monthDir, file);
        const day = file.replace('.json', '');
        const hourlyFilePath = path.join(DATA_DIR, 'hourly', year, month, `${day}.json`);
        
        totalFiles++;
        const updated = await processDailyFile(dailyFilePath, hourlyFilePath);
        if (updated) updatedFiles++;
      }
    }
  }

  console.log(`\n✨ Terminé !`);
  console.log(`   Fichiers traités: ${totalFiles}`);
  console.log(`   Fichiers mis à jour: ${updatedFiles}`);
  console.log(`   Fichiers inchangés: ${totalFiles - updatedFiles}`);
}

main().catch(console.error);