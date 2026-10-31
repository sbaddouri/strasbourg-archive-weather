import axios from 'axios';
import { format, subDays } from 'date-fns';

async function testAvailability() {
  const LAT = 34.22199159989515;
  const LON = -3.3490744462380326;
  const TIMEZONE = 'Africa/Casablanca';
  
  const today = new Date();
  const oneDayAgo = format(subDays(today, 1), 'yyyy-MM-dd');
  const twoDaysAgo = format(subDays(today, 2), 'yyyy-MM-dd');
  
  console.log(`Checking data availability at ${today.toISOString()}`);
  console.log(`Target 1 day ago: ${oneDayAgo}`);
  console.log(`Target 2 days ago: ${twoDaysAgo}`);

  const checkDate = async (date: string) => {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&start_date=${date}&end_date=${date}&daily=weather_code&timezone=${TIMEZONE}`;
    try {
      const response = await axios.get(url);
      console.log(`✅ Data for ${date} is available!`);
      return true;
    } catch (error: any) {
      console.log(`❌ Data for ${date} is NOT available (Status: ${error.response?.status}). Error: ${error.response?.data?.reason || error.message}`);
      return false;
    }
  };

  await checkDate(oneDayAgo);
  await checkDate(twoDaysAgo);
}

testAvailability();