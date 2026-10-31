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
    '2014-01-01',
    '2014-03-21',
    '2014-06-21',
    '2014-08-15',
    '2014-11-28',
    '2014-12-31'
  ];

  console.log(`=== VÉRIFICATION DE CONCORDANCE DES DONNÉES AVEC L'API OPEN-METEO ===\n`);

  let allMatches = true;

  for (const date of sampleDates) {
    const [year, month, day] = date.split('-');
    const dailyFile = path.join(DATA_DIR, 'daily', year, month, `${day}.json`);
    const hourlyFile = path.join(DATA_DIR, 'hourly', year, month, `${day}.json`);

    const localDaily = JSON.parse(fs.readFileSync(dailyFile, 'utf8'));
    const localHourly = JSON.parse(fs.readFileSync(hourlyFile, 'utf8'));

    // Appel direct à l'API Open-Meteo
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m,visibility,uv_index,sunshine_duration&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,sunrise,sunset&timezone=${TIMEZONE}&models=${MODEL}`;

    const res = await axios.get(url, { timeout: 30000 });
    const apiDaily = res.data.daily;
    const apiHourly = res.data.hourly;

    // Comparaison daily
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

    // Comparaison hourly sur 24 heures (échantillon heure 12h)
    const noonLocal = localHourly.find((h: any) => h.time === `${date}T12:00`);
    const noonApiIdx = apiHourly.time.indexOf(`${date}T12:00`);
    if (noonLocal && noonApiIdx !== -1) {
      const hourlyChecks = [
        { name: 'temp 12h', local: noonLocal.temp, api: apiHourly.temperature_2m[noonApiIdx] },
        { name: 'humidity 12h', local: noonLocal.humidity, api: apiHourly.relative_humidity_2m[noonApiIdx] },
        { name: 'dew_point 12h', local: noonLocal.dew_point, api: apiHourly.dew_point_2m[noonApiIdx] },
        { name: 'precipitation 12h', local: noonLocal.precipitation, api: apiHourly.precipitation[noonApiIdx] },
        { name: 'weather_code 12h', local: noonLocal.weather_code, api: apiHourly.weather_code[noonApiIdx] },
        { name: 'pressure 12h', local: noonLocal.pressure, api: apiHourly.pressure_msl[noonApiIdx] },
        { name: 'wind_speed 12h', local: noonLocal.wind_speed, api: apiHourly.wind_speed_10m[noonApiIdx] },
        { name: 'sunshine 12h', local: noonLocal.sunshine, api: apiHourly.sunshine_duration[noonApiIdx] }
      ];

      for (const check of hourlyChecks) {
        if (check.local !== check.api) {
          console.error(`[MISMATCH HOURLY] ${date} ${check.name}: local=${check.local} vs api=${check.api}`);
          dateMatches = false;
          allMatches = false;
        }
      }
    }

    if (dateMatches) {
      console.log(`✅ ${date} : Concordance parfaite à 100% avec l'API Open-Meteo`);
      console.log(`   Min: ${localDaily.temp_min}°C, Max: ${localDaily.temp_max}°C, Pluie: ${localDaily.precipitation}mm, Vent: ${localDaily.wind_speed_max}km/h, WMO: ${localDaily.weather_code}`);
    }
  }

  if (allMatches) {
    console.log(`\n🎉 SUCCÈS TOTAL : Toutes les données testées sont rigoureusement et exactement identiques aux réponses directes de l'API Open-Meteo.`);
  } else {
    console.error(`\n❌ Des discordances ont été détectées.`);
    process.exit(1);
  }
}

verifyDates().catch(err => {
  console.error(err);
  process.exit(1);
});
