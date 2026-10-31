import axios from 'axios';
import fs from 'fs';
import path from 'path';

const LAT = 34.2257;
const LON = -3.3536;
const TIMEZONE = 'Africa/Casablanca';
const MODEL = 'best_match';

const DATA_DIR = path.join(process.cwd(), 'data');

async function verifyDates() {
  const sampleDates = [
    '2016-01-01',
    '2016-02-29',
    '2016-03-21',
    '2016-06-21',
    '2016-08-15',
    '2016-11-28',
    '2016-12-31'
  ];

  console.log(`=== VÉRIFICATION 2016 vs API OPEN-METEO (best_match) ===\n`);

  const dailyDir = path.join(DATA_DIR, 'daily', '2016');
  const hourlyDir = path.join(DATA_DIR, 'hourly', '2016');
  const dailyCount = countJsonFiles(dailyDir);
  const hourlyCount = countJsonFiles(hourlyDir);
  console.log(`Fichiers locaux: ${dailyCount} daily, ${hourlyCount} hourly (attendu 366 chacun)`);
  if (dailyCount !== 366 || hourlyCount !== 366) {
    throw new Error(`Comptage incomplet: daily=${dailyCount}, hourly=${hourlyCount}`);
  }

  let allMatches = true;

  for (const date of sampleDates) {
    const [year, month, day] = date.split('-');
    const dailyFile = path.join(DATA_DIR, 'daily', year, month, `${day}.json`);
    const hourlyFile = path.join(DATA_DIR, 'hourly', year, month, `${day}.json`);

    const localDaily = JSON.parse(fs.readFileSync(dailyFile, 'utf8'));
    const localHourly = JSON.parse(fs.readFileSync(hourlyFile, 'utf8'));

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m,visibility,uv_index,sunshine_duration&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,sunrise,sunset&timezone=${TIMEZONE}&models=${MODEL}`;

    const res = await axios.get(url, { timeout: 30000 });
    const apiDaily = res.data.daily;
    const apiHourly = res.data.hourly;

    const dailyChecks = [
      { name: 'temp_max', local: localDaily.temp_max, api: apiDaily.temperature_2m_max[0] },
      { name: 'temp_min', local: localDaily.temp_min, api: apiDaily.temperature_2m_min[0] },
      { name: 'temp_mean', local: localDaily.temp_mean, api: apiDaily.temperature_2m_mean[0] },
      { name: 'precipitation', local: localDaily.precipitation, api: apiDaily.precipitation_sum[0] },
      { name: 'sunshine', local: localDaily.sunshine, api: apiDaily.sunshine_duration[0] },
      { name: 'wind_speed_max', local: localDaily.wind_speed_max, api: apiDaily.wind_speed_10m_max[0] },
      { name: 'weather_code', local: localDaily.weather_code, api: apiDaily.weather_code[0] },
      { name: 'sunrise', local: localDaily.sunrise, api: apiDaily.sunrise[0] },
      { name: 'sunset', local: localDaily.sunset, api: apiDaily.sunset[0] }
    ];

    let dateMatches = true;
    for (const check of dailyChecks) {
      if (check.local !== check.api) {
        console.error(`[MISMATCH] ${date} ${check.name}: local=${check.local} vs api=${check.api}`);
        dateMatches = false;
        allMatches = false;
      }
    }

    if (localHourly.length !== apiHourly.time.length) {
      console.error(`[MISMATCH HOURLY COUNT] ${date}: local=${localHourly.length} vs api=${apiHourly.time.length}`);
      dateMatches = false;
      allMatches = false;
    }

    for (let i = 0; i < apiHourly.time.length; i++) {
      const localHour = localHourly[i];
      const hourlyChecks = [
        { name: 'time', local: localHour?.time, api: apiHourly.time[i] },
        { name: 'temp', local: localHour?.temp, api: apiHourly.temperature_2m[i] },
        { name: 'humidity', local: localHour?.humidity, api: apiHourly.relative_humidity_2m[i] },
        { name: 'dew_point', local: localHour?.dew_point, api: apiHourly.dew_point_2m[i] },
        { name: 'precipitation', local: localHour?.precipitation, api: apiHourly.precipitation[i] },
        { name: 'weather_code', local: localHour?.weather_code, api: apiHourly.weather_code[i] },
        { name: 'pressure', local: localHour?.pressure, api: apiHourly.pressure_msl[i] },
        { name: 'wind_speed', local: localHour?.wind_speed, api: apiHourly.wind_speed_10m[i] },
        { name: 'wind_gusts', local: localHour?.wind_gusts, api: apiHourly.wind_gusts_10m[i] },
        { name: 'visibility', local: localHour?.visibility, api: apiHourly.visibility[i] },
        { name: 'uv_index', local: localHour?.uv_index, api: apiHourly.uv_index[i] },
        { name: 'sunshine', local: localHour?.sunshine, api: apiHourly.sunshine_duration[i] }
      ];

      for (const check of hourlyChecks) {
        if (check.local !== check.api) {
          console.error(`[MISMATCH HOURLY] ${date} h${i} ${check.name}: local=${check.local} vs api=${check.api}`);
          dateMatches = false;
          allMatches = false;
        }
      }
    }

    if (dateMatches) {
      console.log(`OK ${date} : concordance exacte avec Open-Meteo best_match`);
      console.log(`   Min: ${localDaily.temp_min}°C, Max: ${localDaily.temp_max}°C, Pluie: ${localDaily.precipitation}mm, Vent: ${localDaily.wind_speed_max}km/h, WMO: ${localDaily.weather_code}`);
    }
  }

  if (allMatches) {
    console.log(`\nSUCCÈS : les dates testées sont identiques à l'API Open-Meteo (best_match).`);
  } else {
    console.error(`\nDes discordances ont été détectées.`);
    process.exit(1);
  }
}

function countJsonFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const month of fs.readdirSync(dir)) {
    const monthDir = path.join(dir, month);
    if (!fs.statSync(monthDir).isDirectory()) continue;
    count += fs.readdirSync(monthDir).filter(f => f.endsWith('.json')).length;
  }
  return count;
}

verifyDates().catch(err => {
  console.error(err);
  process.exit(1);
});
