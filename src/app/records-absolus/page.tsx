import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDailyDataForMonth, listAvailableYears } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { getTemperatureColor, getPrecipitationColor, getSunshineColor, getTextColor } from "@/lib/weather-colors";
import { RecordNavLinks, getDayHref, getYearHref } from "@/components/record-nav-links";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function getContrastTextColor(bgColor: string): string {
  if (!bgColor || bgColor === 'transparent') return '#000000';
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 10; // October

function isIncompletePeriod(year: number, monthNum: string): boolean {
  const month = parseInt(monthNum);
  // Exclude current incomplete month
  if (year === CURRENT_YEAR && month === CURRENT_MONTH) return true;
  return false;
}

function isIncompleteYear(year: number): boolean {
  // Exclude current incomplete year
  return year === CURRENT_YEAR;
}

const months = [
  { num: "01", name: "Janvier", short: "Jan" },
  { num: "02", name: "Février", short: "Fév" },
  { num: "03", name: "Mars", short: "Mar" },
  { num: "04", name: "Avril", short: "Avr" },
  { num: "05", name: "Mai", short: "Mai" },
  { num: "06", name: "Juin", short: "Juin" },
  { num: "07", name: "Juillet", short: "Juil" },
  { num: "08", name: "Août", short: "Août" },
  { num: "09", name: "Septembre", short: "Sep" },
  { num: "10", name: "Octobre", short: "Oct" },
  { num: "11", name: "Novembre", short: "Nov" },
  { num: "12", name: "Décembre", short: "Déc" },
];

async function getAbsoluteMaxTempForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let absoluteMax: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    for (const day of data) {
      if (day.temp_max !== null && day.temp_max !== undefined) {
        const temp = day.temp_max;
        if (absoluteMax === null || temp > absoluteMax.value) {
          absoluteMax = {
            value: temp,
            date: day.date,
            year: year
          };
        }
      }
    }
  }

  return absoluteMax;
}

async function getAbsoluteMinTempForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let absoluteMin: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    for (const day of data) {
      if (day.temp_min !== null && day.temp_min !== undefined) {
        const temp = day.temp_min;
        if (absoluteMin === null || temp < absoluteMin.value) {
          absoluteMin = {
            value: temp,
            date: day.date,
            year: year
          };
        }
      }
    }
  }

  return absoluteMin;
}

async function getMinOfMaxTempForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let minOfMax: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    for (const day of data) {
      if (day.temp_max !== null && day.temp_max !== undefined) {
        const temp = day.temp_max;
        if (minOfMax === null || temp < minOfMax.value) {
          minOfMax = {
            value: temp,
            date: day.date,
            year: year
          };
        }
      }
    }
  }

  return minOfMax;
}

async function getMaxOfMinTempForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let maxOfMin: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    for (const day of data) {
      if (day.temp_min !== null && day.temp_min !== undefined) {
        const temp = day.temp_min;
        if (maxOfMin === null || temp > maxOfMin.value) {
          maxOfMin = {
            value: temp,
            date: day.date,
            year: year
          };
        }
      }
    }
  }

  return maxOfMin;
}

async function getHighestMonthlyAvgMaxTempForMonth(monthNum: string): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let highestAvgMax: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    // Calculate average max temp for this month in this year
    const validDays = data.filter(d => d.temp_max !== null && d.temp_max !== undefined);
    if (validDays.length === 0) continue;
    
    const sumMax = validDays.reduce((sum, d) => sum + (d.temp_max as number), 0);
    const avgMax = sumMax / validDays.length;
    
    if (highestAvgMax === null || avgMax > highestAvgMax.value) {
      highestAvgMax = {
        value: avgMax,
        year: year
      };
    }
  }

  return highestAvgMax;
}

async function getLowestMonthlyAvgMaxTempForMonth(monthNum: string): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let lowestAvgMax: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    // Calculate average max temp for this month in this year
    const validDays = data.filter(d => d.temp_max !== null && d.temp_max !== undefined);
    if (validDays.length === 0) continue;
    
    const sumMax = validDays.reduce((sum, d) => sum + (d.temp_max as number), 0);
    const avgMax = sumMax / validDays.length;
    
    if (lowestAvgMax === null || avgMax < lowestAvgMax.value) {
      lowestAvgMax = {
        value: avgMax,
        year: year
      };
    }
  }

  return lowestAvgMax;
}

async function getLowestMonthlyAvgMinTempForMonth(monthNum: string): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let lowestAvgMin: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    // Calculate average min temp for this month in this year
    const validDays = data.filter(d => d.temp_min !== null && d.temp_min !== undefined);
    if (validDays.length === 0) continue;
    
    const sumMin = validDays.reduce((sum, d) => sum + (d.temp_min as number), 0);
    const avgMin = sumMin / validDays.length;
    
    if (lowestAvgMin === null || avgMin < lowestAvgMin.value) {
      lowestAvgMin = {
        value: avgMin,
        year: year
      };
    }
  }

  return lowestAvgMin;
}

async function getHighestMonthlyAvgMinTempForMonth(monthNum: string): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let highestAvgMin: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    // Calculate average min temp for this month in this year
    const validDays = data.filter(d => d.temp_min !== null && d.temp_min !== undefined);
    if (validDays.length === 0) continue;
    
    const sumMin = validDays.reduce((sum, d) => sum + (d.temp_min as number), 0);
    const avgMin = sumMin / validDays.length;
    
    if (highestAvgMin === null || avgMin > highestAvgMin.value) {
      highestAvgMin = {
        value: avgMin,
        year: year
      };
    }
  }

  return highestAvgMin;
}

async function getAverageAbsoluteMinTempForMonth(monthNum: string): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let absoluteMinRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    // Find the absolute minimum temperature for this month in this year
    const validDays = data.filter(d => d.temp_min !== null && d.temp_min !== undefined);
    if (validDays.length === 0) continue;
    
    const minTemp = Math.min(...validDays.map(d => d.temp_min as number));
    absoluteMinRecords.push(minTemp);
  }

  if (absoluteMinRecords.length === 0) return null;
  
  const avg = absoluteMinRecords.reduce((sum, v) => sum + v, 0) / absoluteMinRecords.length;
  return { value: avg };
}

async function getAverageAbsoluteMinTempOverall(): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let annualMinRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearMin: number | null = null;

    // Check all 12 months for this year
    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      const validDays = data.filter(d => d.temp_min !== null && d.temp_min !== undefined);
      if (validDays.length === 0) continue;
      
      const monthMin = Math.min(...validDays.map(d => d.temp_min as number));
      if (yearMin === null || monthMin < yearMin) {
        yearMin = monthMin;
      }
    }

    if (yearMin !== null) {
      annualMinRecords.push(yearMin);
    }
  }

  if (annualMinRecords.length === 0) return null;
  
  const avg = annualMinRecords.reduce((sum, v) => sum + v, 0) / annualMinRecords.length;
  return { value: avg };
}

async function getAverageAbsoluteMaxTempForMonth(monthNum: string): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let absoluteMaxRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    // Find the absolute maximum temperature for this month in this year
    const validDays = data.filter(d => d.temp_max !== null && d.temp_max !== undefined);
    if (validDays.length === 0) continue;
    
    const maxTemp = Math.max(...validDays.map(d => d.temp_max as number));
    absoluteMaxRecords.push(maxTemp);
  }

  if (absoluteMaxRecords.length === 0) return null;
  
  const avg = absoluteMaxRecords.reduce((sum, v) => sum + v, 0) / absoluteMaxRecords.length;
  return { value: avg };
}

async function getAverageAbsoluteMaxTempOverall(): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let annualMaxRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearMax: number | null = null;

    // Check all 12 months for this year
    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      const validDays = data.filter(d => d.temp_max !== null && d.temp_max !== undefined);
      if (validDays.length === 0) continue;
      
      const monthMax = Math.max(...validDays.map(d => d.temp_max as number));
      if (yearMax === null || monthMax > yearMax) {
        yearMax = monthMax;
      }
    }

    if (yearMax !== null) {
      annualMaxRecords.push(yearMax);
    }
  }

  if (annualMaxRecords.length === 0) return null;
  
  const avg = annualMaxRecords.reduce((sum, v) => sum + v, 0) / annualMaxRecords.length;
  return { value: avg };
}

async function getSunniestMonthForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let sunniestMonth: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
        monthTotal += day.estimated_daily_sunshine_minutes;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    const monthTotalHours = monthTotal / 60;
    if (sunniestMonth === null || monthTotalHours > sunniestMonth.value) {
      sunniestMonth = {
        value: monthTotalHours,
        date: `${year}-${monthNum}`,
        year: year
      };
    }
  }

  return sunniestMonth;
}

async function getSunniestYearOverall(): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let sunniestYear: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
          monthTotal += day.estimated_daily_sunshine_minutes;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    const yearTotalHours = yearTotal / 60;
    if (sunniestYear === null || yearTotalHours > sunniestYear.value) {
      sunniestYear = {
        value: yearTotalHours,
        year: year
      };
    }
  }

  return sunniestYear;
}

async function getAverageSunniestMonthPerMonth(monthNum: string): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let monthlySunshineRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
        monthTotal += day.estimated_daily_sunshine_minutes;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    monthlySunshineRecords.push(monthTotal / 60);
  }

  if (monthlySunshineRecords.length === 0) return null;
  
  const avg = monthlySunshineRecords.reduce((sum, v) => sum + v, 0) / monthlySunshineRecords.length;
  return { value: avg };
}

async function getAverageSunniestYearOverall(): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let annualSunshineRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
          monthTotal += day.estimated_daily_sunshine_minutes;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    annualSunshineRecords.push(yearTotal / 60);
  }

  if (annualSunshineRecords.length === 0) return null;
  
  const avg = annualSunshineRecords.reduce((sum, v) => sum + v, 0) / annualSunshineRecords.length;
  return { value: avg };
}

async function getLeastSunnyMonthForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let leastSunnyMonth: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
        monthTotal += day.estimated_daily_sunshine_minutes;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    const monthTotalHours = monthTotal / 60;
    if (leastSunnyMonth === null || monthTotalHours < leastSunnyMonth.value) {
      leastSunnyMonth = {
        value: monthTotalHours,
        date: `${year}-${monthNum}`,
        year: year
      };
    }
  }

  return leastSunnyMonth;
}

async function getLeastSunnyYearOverall(): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let leastSunnyYear: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
          monthTotal += day.estimated_daily_sunshine_minutes;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    const yearTotalHours = yearTotal / 60;
    if (leastSunnyYear === null || yearTotalHours < leastSunnyYear.value) {
      leastSunnyYear = {
        value: yearTotalHours,
        year: year
      };
    }
  }

  return leastSunnyYear;
}

async function getAverageLeastSunnyMonthPerMonth(monthNum: string): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let monthlySunshineRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
        monthTotal += day.estimated_daily_sunshine_minutes;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    monthlySunshineRecords.push(monthTotal / 60);
  }

  if (monthlySunshineRecords.length === 0) return null;
  
  const avg = monthlySunshineRecords.reduce((sum, v) => sum + v, 0) / monthlySunshineRecords.length;
  return { value: avg };
}

async function getAverageLeastSunnyYearOverall(): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let annualSunshineRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.estimated_daily_sunshine_minutes !== null && day.estimated_daily_sunshine_minutes !== undefined) {
          monthTotal += day.estimated_daily_sunshine_minutes;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    annualSunshineRecords.push(yearTotal / 60);
  }

  if (annualSunshineRecords.length === 0) return null;
  
  const avg = annualSunshineRecords.reduce((sum, v) => sum + v, 0) / annualSunshineRecords.length;
  return { value: avg };
}

async function getWettestMonthForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let wettestMonth: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined) {
        monthTotal += day.precipitation;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    if (wettestMonth === null || monthTotal > wettestMonth.value) {
      wettestMonth = {
        value: monthTotal,
        date: `${year}-${monthNum}`,
        year: year
      };
    }
  }

  return wettestMonth;
}

async function getWettestYearOverall(): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let wettestYear: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined) {
          monthTotal += day.precipitation;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    if (wettestYear === null || yearTotal > wettestYear.value) {
      wettestYear = {
        value: yearTotal,
        year: year
      };
    }
  }

  return wettestYear;
}

async function getDriestMonthForMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let driestMonth: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined) {
        monthTotal += day.precipitation;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    if (driestMonth === null || monthTotal < driestMonth.value) {
      driestMonth = {
        value: monthTotal,
        date: `${year}-${monthNum}`,
        year: year
      };
    }
  }

  return driestMonth;
}

async function getDriestYearOverall(): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let driestYear: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined) {
          monthTotal += day.precipitation;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    if (driestYear === null || yearTotal < driestYear.value) {
      driestYear = {
        value: yearTotal,
        year: year
      };
    }
  }

  return driestYear;
}

async function getAveragePrecipitationPerMonth(monthNum: string): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let monthlyPrecipRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let monthTotal = 0;
    let validDays = 0;
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined) {
        monthTotal += day.precipitation;
        validDays++;
      }
    }
    if (validDays === 0) continue;

    monthlyPrecipRecords.push(monthTotal);
  }

  if (monthlyPrecipRecords.length === 0) return null;
  
  const avg = monthlyPrecipRecords.reduce((sum, v) => sum + v, 0) / monthlyPrecipRecords.length;
  return { value: avg };
}

async function getAveragePrecipitationYearOverall(): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let annualPrecipRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearTotal = 0;
    let validMonths = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      let monthTotal = 0;
      let validDays = 0;
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined) {
          monthTotal += day.precipitation;
          validDays++;
        }
      }
      if (validDays > 0) {
        yearTotal += monthTotal;
        validMonths++;
      }
    }

    if (validMonths === 0) continue;

    annualPrecipRecords.push(yearTotal);
  }

  if (annualPrecipRecords.length === 0) return null;
  
  const avg = annualPrecipRecords.reduce((sum, v) => sum + v, 0) / annualPrecipRecords.length;
  return { value: avg };
}

async function getMaxDailyPrecipPerMonth(monthNum: string): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let maxDailyPrecip: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined) {
        const precip = day.precipitation;
        if (maxDailyPrecip === null || precip > maxDailyPrecip.value) {
          maxDailyPrecip = {
            value: precip,
            date: day.date,
            year: year
          };
        }
      }
    }
  }

  return maxDailyPrecip;
}

async function getMaxDailyPrecipOverall(): Promise<{ value: number; date: string; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let maxDailyPrecip: { value: number; date: string; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (yearNum === CURRENT_YEAR && month === CURRENT_MONTH) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined) {
          const precip = day.precipitation;
          if (maxDailyPrecip === null || precip > maxDailyPrecip.value) {
            maxDailyPrecip = {
              value: precip,
              date: day.date,
              year: year
            };
          }
        }
      }
    }
  }

  return maxDailyPrecip;
}

async function getMostPrecipDaysPerMonth(monthNum: string): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let mostDays: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let precipDays = 0;
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined && day.precipitation >= 1) {
        precipDays++;
      }
    }
    
    if (mostDays === null || precipDays > mostDays.value) {
      mostDays = {
        value: precipDays,
        year: year
      };
    }
  }

  return mostDays;
}

async function getMostPrecipDaysYearOverall(): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let mostDaysYear: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearPrecipDays = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined && day.precipitation >= 1) {
          yearPrecipDays++;
        }
      }
    }

    if (mostDaysYear === null || yearPrecipDays > mostDaysYear.value) {
      mostDaysYear = {
        value: yearPrecipDays,
        year: year
      };
    }
  }

  return mostDaysYear;
}

async function getFewestPrecipDaysPerMonth(monthNum: string): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let fewestDays: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let precipDays = 0;
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined && day.precipitation >= 1) {
        precipDays++;
      }
    }
    
    if (fewestDays === null || precipDays < fewestDays.value) {
      fewestDays = {
        value: precipDays,
        year: year
      };
    }
  }

  return fewestDays;
}

async function getFewestPrecipDaysYearOverall(): Promise<{ value: number; year: string } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let fewestDaysYear: { value: number; year: string } | null = null;

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearPrecipDays = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined && day.precipitation >= 1) {
          yearPrecipDays++;
        }
      }
    }

    if (fewestDaysYear === null || yearPrecipDays < fewestDaysYear.value) {
      fewestDaysYear = {
        value: yearPrecipDays,
        year: year
      };
    }
  }

  return fewestDaysYear;
}

async function getAveragePrecipDaysPerMonth(monthNum: string): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let monthlyPrecipDaysRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompletePeriod(yearNum, monthNum)) continue;

    const data = await getDailyDataForMonth(year, monthNum);
    
    let precipDays = 0;
    for (const day of data) {
      if (day.precipitation !== null && day.precipitation !== undefined && day.precipitation >= 1) {
        precipDays++;
      }
    }
    
    monthlyPrecipDaysRecords.push(precipDays);
  }

  if (monthlyPrecipDaysRecords.length === 0) return null;
  
  const avg = monthlyPrecipDaysRecords.reduce((sum, v) => sum + v, 0) / monthlyPrecipDaysRecords.length;
  return { value: avg };
}

async function getAveragePrecipDaysYearOverall(): Promise<{ value: number } | null> {
  const years = listAvailableYears().sort((a, b) => parseInt(a) - parseInt(b));
  let annualPrecipDaysRecords: number[] = [];

  for (const year of years) {
    const yearNum = parseInt(year);
    if (yearNum < 1940 || yearNum > 2026) continue;
    if (isIncompleteYear(yearNum)) continue;

    let yearPrecipDays = 0;

    for (let month = 1; month <= 12; month++) {
      const monthNum = month.toString().padStart(2, '0');
      if (isIncompletePeriod(yearNum, monthNum)) continue;
      
      const data = await getDailyDataForMonth(year, monthNum);
      
      for (const day of data) {
        if (day.precipitation !== null && day.precipitation !== undefined && day.precipitation >= 1) {
          yearPrecipDays++;
        }
      }
    }

    annualPrecipDaysRecords.push(yearPrecipDays);
  }

  if (annualPrecipDaysRecords.length === 0) return null;
  
  const avg = annualPrecipDaysRecords.reduce((sum, v) => sum + v, 0) / annualPrecipDaysRecords.length;
  return { value: avg };
}

export default async function RecordsAbsolusPage() {
  // Fetch all records in parallel
  const maxTempPromises = months.map(m => getAbsoluteMaxTempForMonth(m.num));
  const minTempPromises = months.map(m => getAbsoluteMinTempForMonth(m.num));
  const minOfMaxPromises = months.map(m => getMinOfMaxTempForMonth(m.num));
  const maxOfMinPromises = months.map(m => getMaxOfMinTempForMonth(m.num));
  const highestAvgMaxPromises = months.map(m => getHighestMonthlyAvgMaxTempForMonth(m.num));
  const lowestAvgMaxPromises = months.map(m => getLowestMonthlyAvgMaxTempForMonth(m.num));
  const lowestAvgMinPromises = months.map(m => getLowestMonthlyAvgMinTempForMonth(m.num));
  const highestAvgMinPromises = months.map(m => getHighestMonthlyAvgMinTempForMonth(m.num));
  const avgAbsMinPromises = months.map(m => getAverageAbsoluteMinTempForMonth(m.num));
  const avgAbsMinOverallPromise = getAverageAbsoluteMinTempOverall();
  const avgAbsMaxPromises = months.map(m => getAverageAbsoluteMaxTempForMonth(m.num));
  const avgAbsMaxOverallPromise = getAverageAbsoluteMaxTempOverall();
  const sunniestMonthPromises = months.map(m => getSunniestMonthForMonth(m.num));
  const sunniestYearPromise = getSunniestYearOverall();
  const avgSunniestMonthPromises = months.map(m => getAverageSunniestMonthPerMonth(m.num));
  const avgSunniestYearPromise = getAverageSunniestYearOverall();
  const leastSunnyMonthPromises = months.map(m => getLeastSunnyMonthForMonth(m.num));
  const leastSunnyYearPromise = getLeastSunnyYearOverall();
  const wettestMonthPromises = months.map(m => getWettestMonthForMonth(m.num));
  const wettestYearPromise = getWettestYearOverall();
  const driestMonthPromises = months.map(m => getDriestMonthForMonth(m.num));
  const driestYearPromise = getDriestYearOverall();
  const avgPrecipMonthPromises = months.map(m => getAveragePrecipitationPerMonth(m.num));
  const avgPrecipYearPromise = getAveragePrecipitationYearOverall();
  const maxDailyPrecipMonthPromises = months.map(m => getMaxDailyPrecipPerMonth(m.num));
  const maxDailyPrecipOverallPromise = getMaxDailyPrecipOverall();
  const mostPrecipDaysMonthPromises = months.map(m => getMostPrecipDaysPerMonth(m.num));
  const mostPrecipDaysYearPromise = getMostPrecipDaysYearOverall();
  const fewestPrecipDaysMonthPromises = months.map(m => getFewestPrecipDaysPerMonth(m.num));
  const fewestPrecipDaysYearPromise = getFewestPrecipDaysYearOverall();
  const avgPrecipDaysMonthPromises = months.map(m => getAveragePrecipDaysPerMonth(m.num));
  const avgPrecipDaysYearPromise = getAveragePrecipDaysYearOverall();

  const [maxTemps, minTemps, minOfMaxTemps, maxOfMinTemps, highestAvgMaxTemps, lowestAvgMaxTemps, lowestAvgMinTemps, highestAvgMinTemps, avgAbsMinTemps, avgAbsMinOverall, avgAbsMaxTemps, avgAbsMaxOverall, sunniestMonths, sunniestYear, avgSunniestMonths, avgSunniestYear, leastSunnyMonths, leastSunnyYear, wettestMonths, wettestYear, driestMonths, driestYear, avgPrecipMonths, avgPrecipYear, maxDailyPrecipMonths, maxDailyPrecipOverall, mostPrecipDaysMonths, mostPrecipDaysYear, fewestPrecipDaysMonths, fewestPrecipDaysYear, avgPrecipDaysMonths, avgPrecipDaysYear] = await Promise.all([
    Promise.all(maxTempPromises),
    Promise.all(minTempPromises),
    Promise.all(minOfMaxPromises),
    Promise.all(maxOfMinPromises),
    Promise.all(highestAvgMaxPromises),
    Promise.all(lowestAvgMaxPromises),
    Promise.all(lowestAvgMinPromises),
    Promise.all(highestAvgMinPromises),
    Promise.all(avgAbsMinPromises),
    avgAbsMinOverallPromise,
    Promise.all(avgAbsMaxPromises),
    avgAbsMaxOverallPromise,
    Promise.all(sunniestMonthPromises),
    sunniestYearPromise,
    Promise.all(avgSunniestMonthPromises),
    avgSunniestYearPromise,
    Promise.all(leastSunnyMonthPromises),
    leastSunnyYearPromise,
    Promise.all(wettestMonthPromises),
    wettestYearPromise,
    Promise.all(driestMonthPromises),
    driestYearPromise,
    Promise.all(avgPrecipMonthPromises),
    avgPrecipYearPromise,
    Promise.all(maxDailyPrecipMonthPromises),
    maxDailyPrecipOverallPromise,
    Promise.all(mostPrecipDaysMonthPromises),
    mostPrecipDaysYearPromise,
    Promise.all(fewestPrecipDaysMonthPromises),
    fewestPrecipDaysYearPromise,
    Promise.all(avgPrecipDaysMonthPromises),
    avgPrecipDaysYearPromise
  ]);

  // Ensure all arrays are defined (fallback to empty arrays)
  const maxTempsSafe = maxTemps ?? [];
  const minTempsSafe = minTemps ?? [];
  const minOfMaxTempsSafe = minOfMaxTemps ?? [];
  const maxOfMinTempsSafe = maxOfMinTemps ?? [];
  const highestAvgMaxTempsSafe = highestAvgMaxTemps ?? [];
  const lowestAvgMaxTempsSafe = lowestAvgMaxTemps ?? [];
  const lowestAvgMinTempsSafe = lowestAvgMinTemps ?? [];
  const highestAvgMinTempsSafe = highestAvgMinTemps ?? [];
  const avgAbsMinTempsSafe = avgAbsMinTemps ?? [];
  const avgAbsMaxTempsSafe = avgAbsMaxTemps ?? [];
  const sunniestMonthsSafe = sunniestMonths ?? [];
  const avgSunniestMonthsSafe = avgSunniestMonths ?? [];
  const leastSunnyMonthsSafe = leastSunnyMonths ?? [];
  const wettestMonthsSafe = wettestMonths ?? [];
  const driestMonthsSafe = driestMonths ?? [];
  const avgPrecipMonthsSafe = avgPrecipMonths ?? [];
  const maxDailyPrecipMonthsSafe = maxDailyPrecipMonths ?? [];
  const mostPrecipDaysMonthsSafe = mostPrecipDaysMonths ?? [];
  const fewestPrecipDaysMonthsSafe = fewestPrecipDaysMonths ?? [];
  const avgPrecipDaysMonthsSafe = avgPrecipDaysMonths ?? [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Records Absolus - strasbourg</h1>
        <p className="text-muted-foreground">
          Records absolus de température (1940-2026) basés sur les données journalières Open-Meteo.
        </p>
        <p className="text-sm text-muted-foreground">
          Chaque record dispose d&apos;un bouton <span className="font-semibold">Jour</span> (le cas échéant) et d&apos;un bouton{' '}
          <span className="font-semibold">Mois</span> qui mènent directement à la page du jour ou du mois concerné.
        </p>
      </div>

      {/* Max Temperature Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. maxi extrême (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. maxi extrême (°C)</TableCell>
                  {maxTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks date={record.date} year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Date</TableCell>
                  {maxTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getDayHref(record.date) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de ce jour"
                        >
                          {format(parseISO(record.date), 'dd/MM/yyyy')}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Min Temperature Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. mini extrême (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. mini extrême (°C)</TableCell>
                  {minTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks date={record.date} year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Date</TableCell>
                  {minTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getDayHref(record.date) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de ce jour"
                        >
                          {format(parseISO(record.date), 'dd/MM/yyyy')}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Min of Max Temperature Records (TXN) */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. maxi minimale (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. maxi minimale (°C)</TableCell>
{minOfMaxTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks date={record.date} year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Date</TableCell>
                  {minOfMaxTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getDayHref(record.date) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de ce jour"
                        >
                          {format(parseISO(record.date), 'dd/MM/yyyy')}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Max of Min Temperature Records (TNX) */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. mini maximale (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. mini maximale (°C)</TableCell>
                  {maxOfMinTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks date={record.date} year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Date</TableCell>
                  {maxOfMinTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getDayHref(record.date) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de ce jour"
                        >
                          {format(parseISO(record.date), 'dd/MM/yyyy')}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Highest Monthly Average Max Temperature Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. maxi moyenne la plus haute (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
<TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. maxi moyenne la plus haute (°C)</TableCell>
                  {highestAvgMaxTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
<TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Année</TableCell>
                  {highestAvgMaxTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getYearHref(record.year) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de cette année"
                        >
                          {record.year}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lowest Monthly Average Max Temperature Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. maxi moyenne la plus basse (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. maxi moyenne la plus basse (°C)</TableCell>
                  {lowestAvgMaxTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Année</TableCell>
                  {lowestAvgMaxTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getYearHref(record.year) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de cette année"
                        >
                          {record.year}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lowest Monthly Average Min Temperature Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. mini moyenne la plus basse (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
<TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. mini moyenne la plus basse (°C)</TableCell>
                  {lowestAvgMinTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Année</TableCell>
                  {lowestAvgMinTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getYearHref(record.year) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de cette année"
                        >
                          {record.year}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Highest Monthly Average Min Temperature Records */}
      <Card>
        <CardHeader>
          <CardTitle>Tempé. mini moyenne la plus haute (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
<TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Tempé. mini moyenne la plus haute (°C)</TableCell>
                  {highestAvgMinTempsSafe?.map((record, idx) => {
                      if (!record) {
                        return (
                          <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                        );
                      }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                </TableRow>
<TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Année</TableCell>
                  {highestAvgMinTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center text-[11px] text-muted-foreground">
                        <Link
                          href={getYearHref(record.year) ?? "#"}
                          className="underline-offset-2 hover:underline"
                          title="Voir la page de cette année"
                        >
                          {record.year}
                        </Link>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Average of Absolute Minimum Records per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Moyenne des records de froid absolu (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Moyenne records froid absolu (°C)</TableCell>
                  {avgAbsMinTempsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getTemperatureColor(avgAbsMinOverall?.value ?? 0), color: getTextColor(getTemperatureColor(avgAbsMinOverall?.value ?? 0)) }}>
                    {avgAbsMinOverall?.value?.toFixed(1) ?? '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Average of Absolute Maximum Records per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Moyenne des records de chaleur absolu (°C)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
<TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Moyenne records chaleur absolu (°C)</TableCell>
                  {avgAbsMaxTempsSafe?.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getTemperatureColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getTemperatureColor(avgAbsMaxOverall?.value ?? 0), color: getTextColor(getTemperatureColor(avgAbsMaxOverall?.value ?? 0)) }}>
                    {avgAbsMaxOverall?.value?.toFixed(1) ?? '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
</Card>

      {/* Sunniest Month Records (Estimated Sunshine) */}
      <Card>
        <CardHeader>
          <CardTitle>Mois le plus ensoleillé (Estimé) - Total mensuel (h)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Total ensoleillement estimé (h)</TableCell>
                  {sunniestMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getSunshineColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getSunshineColor(sunniestYear?.value ?? 0), color: getContrastTextColor(getSunshineColor(sunniestYear?.value ?? 0)) }}>
                    {sunniestYear?.value?.toFixed(1) ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{sunniestYear?.year ?? ''}</div>
                    <RecordNavLinks year={sunniestYear?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Average of Sunniest Month per Month (Estimated Sunshine) */}
      <Card>
        <CardHeader>
          <CardTitle>Moyenne mensuelle d'ensoleillement estimé (h)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Moyenne ensoleillement estimé (h)</TableCell>
                  {avgSunniestMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getSunshineColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getSunshineColor(avgSunniestYear?.value ?? 0), color: getContrastTextColor(getSunshineColor(avgSunniestYear?.value ?? 0)) }}>
                    {avgSunniestYear?.value?.toFixed(1) ?? '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Least Sunny Month Records (Estimated Sunshine) */}
      <Card>
        <CardHeader>
          <CardTitle>Mois le moins ensoleillé (Estimé) - Total mensuel (h)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Total ensoleillement estimé (h)</TableCell>
                  {leastSunnyMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getSunshineColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getSunshineColor(leastSunnyYear?.value ?? 0), color: getContrastTextColor(getSunshineColor(leastSunnyYear?.value ?? 0)) }}>
                    {leastSunnyYear?.value?.toFixed(1) ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{leastSunnyYear?.year ?? ''}</div>
                    <RecordNavLinks year={leastSunnyYear?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Wettest Month Records (Precipitation) */}
      <Card>
        <CardHeader>
          <CardTitle>Mois le plus humide (Précipitations) - Total mensuel (mm)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Total précipitations (mm)</TableCell>
                  {wettestMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor(wettestYear?.value ?? 0), color: getContrastTextColor(getPrecipitationColor(wettestYear?.value ?? 0)) }}>
                    {wettestYear?.value?.toFixed(1) ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{wettestYear?.year ?? ''}</div>
                    <RecordNavLinks year={wettestYear?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Driest Month Records (Precipitation) */}
      <Card>
        <CardHeader>
          <CardTitle>Mois le plus sec (Précipitations) - Total mensuel (mm)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Total précipitations (mm)</TableCell>
                  {driestMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor(driestYear?.value ?? 0), color: getContrastTextColor(getPrecipitationColor(driestYear?.value ?? 0)) }}>
                    {driestYear?.value?.toFixed(1) ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{driestYear?.year ?? ''}</div>
                    <RecordNavLinks year={driestYear?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Average Precipitation per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Moyenne mensuelle de précipitations (mm)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Moyenne précipitations (mm)</TableCell>
                  {avgPrecipMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor(avgPrecipYear?.value ?? 0), color: getContrastTextColor(getPrecipitationColor(avgPrecipYear?.value ?? 0)) }}>
                    {avgPrecipYear?.value?.toFixed(1) ?? '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Max Daily Precipitation Records */}
      <Card>
        <CardHeader>
          <CardTitle>Hauteur quotidienne maximale de précipitations (mm) - Mensuel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Record absolu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Max quotidien (mm)</TableCell>
                  {maxDailyPrecipMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                        <div className="text-[10px] text-muted-foreground/80">{format(parseISO(record.date), 'dd/MM/yyyy')}</div>
                        <RecordNavLinks date={record.date} year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor(maxDailyPrecipOverall?.value ?? 0), color: getContrastTextColor(getPrecipitationColor(maxDailyPrecipOverall?.value ?? 0)) }}>
                    {maxDailyPrecipOverall?.value?.toFixed(1) ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{maxDailyPrecipOverall ? format(parseISO(maxDailyPrecipOverall.date), 'dd/MM/yyyy') : ''}</div>
                    <RecordNavLinks date={maxDailyPrecipOverall?.date} year={maxDailyPrecipOverall?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Most Precipitation Days Per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Nombre de jours de précipitations record élevé (≥1mm) - Mensuel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Record absolu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Jours ≥ 1mm</TableCell>
                  {mostPrecipDaysMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value * 10);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor((mostPrecipDaysYear?.value ?? 0) * 10), color: getContrastTextColor(getPrecipitationColor((mostPrecipDaysYear?.value ?? 0) * 10)) }}>
                    {mostPrecipDaysYear?.value ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{mostPrecipDaysYear?.year ?? ''}</div>
                    <RecordNavLinks year={mostPrecipDaysYear?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Fewest Precipitation Days Per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Nombre de jours de précipitations record bas (≥1mm) - Mensuel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Record absolu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Jours ≥ 1mm</TableCell>
                  {fewestPrecipDaysMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value * 10);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value}</div>
                        <div className="text-[10px] text-muted-foreground/80">{record.year}</div>
                        <RecordNavLinks year={record.year} month={months[idx]?.num} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor((fewestPrecipDaysYear?.value ?? 0) * 10), color: getContrastTextColor(getPrecipitationColor((fewestPrecipDaysYear?.value ?? 0) * 10)) }}>
                    {fewestPrecipDaysYear?.value ?? '—'}
                    <div className="text-[10px] text-muted-foreground/80">{fewestPrecipDaysYear?.year ?? ''}</div>
                    <RecordNavLinks year={fewestPrecipDaysYear?.year} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Average Precipitation Days Per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Nombre de jours de précipitations moyen (≥1mm) - Mensuel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="border px-3 py-2 font-bold text-left sticky left-0 z-10">Record</TableHead>
                  {months.map(m => (
                    <TableHead key={m.num} className="border px-2 py-2 font-bold text-center text-sm capitalize">
                      {m.short}
                    </TableHead>
                  ))}
                  <TableHead className="border px-3 py-2 font-bold text-center text-sm capitalize bg-primary/10">Moyenne annuelle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border font-bold px-3 py-2 text-left bg-muted/50">Jours ≥ 1mm (moyenne)</TableCell>
                  {avgPrecipDaysMonthsSafe.map((record, idx) => {
                    if (!record) {
                      return (
                        <TableCell key={idx} className="border px-2 py-2 text-center text-muted-foreground">—</TableCell>
                      );
                    }
                    const bgColor = getPrecipitationColor(record.value * 10);
                    return (
                      <TableCell key={idx} className="border px-2 py-2 text-center" style={{ backgroundColor: bgColor, color: getContrastTextColor(bgColor) }}>
                        <div className="font-bold">{record.value?.toFixed(1) ?? '-'}</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="border font-bold px-3 py-2 text-center" style={{ backgroundColor: getPrecipitationColor((avgPrecipDaysYear?.value ?? 0) * 10), color: getContrastTextColor(getPrecipitationColor((avgPrecipDaysYear?.value ?? 0) * 10)) }}>
                    {avgPrecipDaysYear?.value?.toFixed(1) ?? '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="text-sm text-muted-foreground">
        <CardHeader>
          <CardTitle>Sources & Méthodologie</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Données basées sur les relevés journaliers Open-Meteo (ERA5 reanalysis) pour strasbourg (34.2257°N, -3.3536°W).</li>
            <li>Période couverte : janvier 1940 à janvier 2026 (87 années).</li>
            <li>Tempé. maxi extrême : valeur maximale de temp_max journalière pour chaque mois sur toute la période.</li>
            <li>Tempé. mini maximale : valeur maximale de temp_min journalière pour chaque mois sur toute la période (nuit la plus chaude).</li>
            <li>Tempé. maxi moyenne la plus haute : moyenne mensuelle des maximales la plus élevée pour chaque mois sur toute la période (mois le plus chaud en moyenne).</li>
            <li>Tempé. maxi moyenne la plus basse : moyenne mensuelle des maximales la plus basse pour chaque mois sur toute la période (mois le plus froid en moyenne).</li>
            <li>Tempé. mini moyenne la plus haute : moyenne mensuelle des minimales la plus élevée pour chaque mois sur toute la période (mois le plus chaud en moyenne des minimales).</li>
            <li>Tempé. mini moyenne la plus basse : moyenne mensuelle des minimales la plus basse pour chaque mois sur toute la période (mois le plus froid en moyenne des minimales).</li>
            <li>Moyenne des records de froid absolu : moyenne des températures minimales absolues pour chaque mois sur toute la période, avec moyenne annuelle en 13ème colonne.</li>
            <li>Mois le plus ensoleillé (estimé) : mois ayant le total d'ensoleillement estimé le plus élevé pour chaque mois sur la période 1940-2026, basé sur les codes WMO horaires (estimation). La 13ème colonne affiche l'année la plus ensoleillée globalement.</li>
            <li>Moyenne mensuelle d'ensoleillement estimé : moyenne des totaux mensuels d'ensoleillement estimé pour chaque mois sur la période, avec moyenne annuelle en 13ème colonne.</li>
            <li>Mois le moins ensoleillé (estimé) : mois ayant le total d'ensoleillement estimé le plus faible pour chaque mois sur la période 1940-2026, basé sur les codes WMO horaires (estimation). La 13ème colonne affiche l'année la moins ensoleillée globalement.</li>
            <li>Mois le plus humide (précipitations) : mois ayant le total de précipitations le plus élevé pour chaque mois sur la période 1940-2026. La 13ème colonne affiche l'année la plus humide globalement.</li>
            <li>Mois le plus sec (précipitations) : mois ayant le total de précipitations le plus faible pour chaque mois sur la période 1940-2026. La 13ème colonne affiche l'année la plus sèche globalement.</li>
            <li>Moyenne mensuelle de précipitations : moyenne des totaux mensuels de précipitations pour chaque mois sur la période, avec moyenne annuelle en 13ème colonne.</li>
            <li>Hauteur quotidienne maximale de précipitations : valeur maximale de précipitation journalière pour chaque mois sur la période 1940-2026. La 13ème colonne affiche le record absolu (valeur + date) sur toute la période.</li>
            <li>Nombre de jours de précipitations record élevé : mois ayant le plus grand nombre de jours avec précipitations ≥ 1mm pour chaque mois sur la période 1940-2026. La 13ème colonne affiche l'année avec le plus grand nombre de jours de précipitations sur toute la période.</li>
            <li>Nombre de jours de précipitations record bas : mois ayant le plus petit nombre de jours avec précipitations ≥ 1mm pour chaque mois sur la période 1940-2026. La 13ème colonne affiche l'année avec le plus petit nombre de jours de précipitations sur toute la période.</li>
            <li>Nombre de jours de précipitations moyen : moyenne du nombre de jours avec précipitations ≥ 1mm pour chaque mois sur la période, avec moyenne annuelle en 13ème colonne.</li>
            <li>Modèle utilisé : ERA5-Land / best_match Open-Meteo.</li>
            <li>Les données horaires ont été utilisées pour compléter les valeurs journalières manquantes quand nécessaire</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}



