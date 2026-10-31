/**
 * Wikipédia English Weather Box color mapping logic
 * Based on the provided JSON scale: -89.2°C to 56.7°C
 */

/**
 * Table de correspondance complète WMO 4677 (codes 0-99) → Facteur d'ensoleillement maximal (0-1)
 * Basé sur la nébulosité et le type de phénomène météorologique
 * Groupes logiques selon la table OMM 4677 :
 * 0-3: État du ciel (nébulosité)
 * 10-19: Précipitations légères / Caractère du temps
 * 20-29: Précipitations / Neige / Grêle (non utilisées dans Open-Meteo)
 * 30-39: Tempêtes / Poussière / Sable
 * 40-49: Brouillard / Brume
 * 50-59: Bruine
 * 60-69: Pluie
 * 70-79: Neige
 * 80-89: Averses
 * 90-99: Orages
 */
const WMO_SUNSHINE_FACTOR: Record<number, number> = {
  // 0-3: État du ciel (Nébulosité) - Facteur basé sur l'okta de nébulosité
  0: 1.00,  // Ciel dégagé (0 oktas)
  1: 0.75,  // Principalement dégagé (1-2 oktas)
  2: 0.50,  // Partiellement nuageux (3-4 oktas)
  3: 0.10,  // Couvert (5-8 oktas)

  // 10-19: Précipitations légères / Caractère du temps (Open-Meteo n'utilise pas tous)
  10: 0.30, // Brume légère
  11: 0.20, // Brume
  12: 0.10, // Brume épaisse
  13: 0.05, // Brume givrante
  14: 0.00, // Brouillard (visible < 1km)
  15: 0.00, // Brouillard givrant
  16: 0.00, // Brouillard épais
  17: 0.00, // Brouillard givrant épais
  18: 0.20, // Précipitations légères intermittentes
  19: 0.10, // Précipitations légères continues

  // 20-29: Neige / Grêle (codes météo non standard Open-Meteo)
  20: 0.05, 21: 0.05, 22: 0.05, 23: 0.05, 24: 0.05,
  25: 0.05, 26: 0.05, 27: 0.05, 28: 0.05, 29: 0.05,

  // 30-39: Tempêtes de poussière/sable
  30: 0.10, 31: 0.05, 32: 0.00, 33: 0.00, 34: 0.00,
  35: 0.00, 36: 0.00, 37: 0.00, 38: 0.00, 39: 0.00,

  // 40-49: Brouillard / Brume (Open-Meteo: 45, 48)
  40: 0.05, 41: 0.00, 42: 0.00, 43: 0.00, 44: 0.00,
  45: 0.00,  // Brouillard
  46: 0.00, 47: 0.00,
  48: 0.00,  // Brouillard givrant (dépôt de givre)
  49: 0.00,

  // 50-59: Bruine (Open-Meteo: 51, 53, 55, 56, 57)
  50: 0.20, // Bruine intermittente faible
  51: 0.25, // Bruine faible
  52: 0.15, // Bruine modérée
  53: 0.15, // Bruine modérée
  54: 0.05, // Bruine forte
  55: 0.05, // Bruine forte
  56: 0.00, // Bruine verglaçante faible
  57: 0.00, // Bruine verglaçante forte
  58: 0.00, 59: 0.00,

  // 60-69: Pluie (Open-Meteo: 61, 63, 65, 66, 67)
  60: 0.10, // Pluie intermittente faible
  61: 0.10, // Pluie faible
  62: 0.05, // Pluie modérée
  63: 0.05, // Pluie modérée
  64: 0.00, // Pluie forte
  65: 0.00, // Pluie forte
  66: 0.00, // Pluie verglaçante faible
  67: 0.00, // Pluie verglaçante forte
  68: 0.00, 69: 0.00,

  // 70-79: Neige (Open-Meteo: 71, 73, 75, 77)
  70: 0.10, // Neige intermittente faible
  71: 0.10, // Neige faible
  72: 0.05, // Neige modérée
  73: 0.05, // Neige modérée
  74: 0.00, // Neige forte
  75: 0.00, // Neige forte
  76: 0.00, // Grains de neige (diamond dust)
  77: 0.00, // Grains de neige
  78: 0.00, 79: 0.00,

  // 80-89: Averses (Open-Meteo: 80, 81, 82, 85, 86)
  80: 0.30, // Averses de pluie faibles
  81: 0.10, // Averses de pluie modérées
  82: 0.05, // Averses de pluie violentes
  83: 0.20, // Averses pluie/neige mélangées faibles
  84: 0.10, // Averses pluie/neige mélangées modérées
  85: 0.10, // Averses de neige faibles
  86: 0.05, // Averses de neige fortes
  87: 0.00, 88: 0.00, 89: 0.00,

  // 90-99: Orages (Open-Meteo: 95, 96, 99)
  90: 0.05, 91: 0.05, 92: 0.05, 93: 0.05, 94: 0.05,
  95: 0.05, // Orage faible ou modéré
  96: 0.05, // Orage avec grêle faible
  97: 0.00, 98: 0.00,
  99: 0.00  // Orage avec forte grêle
};

/**
 * Calcule le facteur d'élévation solaire pour les transitions lever/coucher
 * Retourne un facteur 0-1 basé sur la position du soleil
 * AUCUN ensoleillement en dehors des heures de jour strictes (lever à coucher)
 * @param timeMinutes - Minutes depuis minuit
 * @param sunriseMinutes - Lever du soleil en minutes depuis minuit
 * @param sunsetMinutes - Coucher du soleil en minutes depuis minuit
 * @returns Facteur 0-1 pour l'ensoleillement potentiel (0 la nuit, sinusoïdal le jour)
 */
function getSolarElevationFactor(
  timeMinutes: number,
  sunriseMinutes: number,
  sunsetMinutes: number
): number {
  // Nuit complète - AUCUN ensoleillement avant lever ou après coucher
  if (timeMinutes < sunriseMinutes || timeMinutes >= sunsetMinutes) {
    return 0;
  }

  // Plein jour - calcul basé sur l'élévation solaire (courbe sinusoïdale)
  const dayLength = sunsetMinutes - sunriseMinutes;
  const progress = (timeMinutes - sunriseMinutes) / dayLength; // 0 à 1

  // Courbe sinusoïdale pour l'élévation solaire (max à midi solaire)
  // sin(π * progress) donne 0 au lever/coucher, 1 au midi
  return Math.sin(Math.PI * progress);
}

/**
 * Calcule l'ensoleillement estimé pour une heure donnée
 * en tenant compte du code WMO, du lever/coucher du soleil, et de l'élévation solaire
 * @param code - Code WMO horaire
 * @param timeStr - Heure ISO (ex: "2025-06-15T14:00")
 * @param sunriseStr - Lever du soleil ISO
 * @param sunsetStr - Coucher du soleil ISO
 * @returns Minutes d'ensoleillement estimées pour cette heure (0-60)
 */
export function calculateHourlySunshineWithDaylight(
  code: number,
  timeStr: string,
  sunriseStr: string | null | undefined,
  sunsetStr: string | null | undefined
): number {
  // Pas de données de lever/coucher = on suppose jour complet (fallback)
  if (!sunriseStr || !sunsetStr) {
    return Math.round((WMO_SUNSHINE_FACTOR[code] ?? 0) * 60);
  }

  const getTimeMinutes = (timeStr: string): number => {
    if (!timeStr || !timeStr.includes('T')) return 0;
    const timePart = timeStr.split('T')[1];
    if (!timePart || !timePart.includes(':')) return 0;
    const [hour, minute] = timePart.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) return 0;
    return hour * 60 + minute;
  };

  const timeMinutes = getTimeMinutes(timeStr);
  const sunriseMinutes = getTimeMinutes(sunriseStr);
  const sunsetMinutes = getTimeMinutes(sunsetStr);

  // Facteur d'élévation solaire (0-1)
  const elevationFactor = getSolarElevationFactor(timeMinutes, sunriseMinutes, sunsetMinutes);

  // Si nuit (facteur 0), pas d'ensoleillement possible
  if (elevationFactor <= 0) {
    return 0;
  }

  // Facteur météo (0-1) basé sur le code WMO
  const weatherFactor = WMO_SUNSHINE_FACTOR[code] ?? 0;

  // Ensoleillement = 60 min * facteur_météo * facteur_élévation
  // Arrondi à la minute
  return Math.round(60 * weatherFactor * elevationFactor);
}

/**
 * Convertit un code WMO horaire en durée d'ensoleillement estimée en minutes (version legacy)
 * @deprecated Utiliser calculateHourlySunshineWithDaylight
 * @param code - Code WMO horaire
 * @returns Durée estimée en minutes (0 si code inconnu)
 */
export function calculateHourlySunshine(code: number): number {
  return Math.round((WMO_SUNSHINE_FACTOR[code] ?? 0) * 60);
}

export function isHourBetweenSunriseAndSunset(timeStr: string, sunriseStr: string | null | undefined, sunsetStr: string | null | undefined): boolean {
  const getTimeMinutes = (timeStr: string) => {
    if (!timeStr || !timeStr.includes('T')) return 0;
    const timePart = timeStr.split('T')[1];
    if (!timePart || !timePart.includes(':')) return 0;
    const [hour, minute] = timePart.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) return 0;
    return hour * 60 + minute;
  };

  // Si sunrise ou sunset sont manquants, on ne peut pas déterminer jour/nuit -> on retourne false (nuit)
  // Cela évite d'afficher l'ensoleillement sans données de lever/coucher de soleil
  if (!sunriseStr || !sunsetStr) return false;

  const timeMinutes = getTimeMinutes(timeStr);
  const sunriseMinutes = getTimeMinutes(sunriseStr);
  const sunsetMinutes = getTimeMinutes(sunsetStr);

  // Une heure (ex: 07:00 = période 07:00-08:00) est considérée "jour" 
  // SEULEMENT si elle commence APRÈS le lever du soleil ET AVANT le coucher du soleil
  // Cela garantit AUCUN ensoleillement pendant les heures de nuit
  return timeMinutes >= sunriseMinutes && timeMinutes < sunsetMinutes;
}

/**
 * Agrège les valeurs horaires pour obtenir une durée journalière totale en minutes,
 * seulement pour les heures entre le lever et le coucher du soleil
 * @param hourlyData - Tableau des données horaires avec time et weather_code
 * @param sunrise - Heure du lever du soleil (format ISO)
 * @param sunset - Heure du coucher du soleil (format ISO)
 * @returns Durée journalière totale en minutes, ou null si données insuffisantes
 */
export function calculateDailySunshine(
  hourlyData: { time: string; weather_code: number }[],
  sunrise: string | null | undefined,
  sunset: string | null | undefined
): number | null {
  if (!hourlyData || hourlyData.length === 0) return null;

  return hourlyData.reduce((total, hour) => {
    if (isHourBetweenSunriseAndSunset(hour.time, sunrise, sunset)) {
      return total + calculateHourlySunshine(hour.weather_code);
    }
    return total;
  }, 0);
}

/**
 * Agrège les valeurs journalières pour obtenir une durée mensuelle totale en minutes
 * @param dailyMinutes - Tableau des durées journalières en minutes
 * @returns Durée mensuelle totale en minutes
 */
export function calculateMonthlySunshine(dailyMinutes: (number | null)[]): number | null {
  const validDays = dailyMinutes.filter((d): d is number => d !== null);
  if (validDays.length === 0) return null;
  return validDays.reduce((total, minutes) => total + minutes, 0);
}

/**
 * Agrège les valeurs mensuelles pour obtenir une durée annuelle totale en minutes
 * @param monthlyMinutes - Tableau des durées mensuelles en minutes
 * @returns Durée annuelle totale en minutes
 */
export function calculateYearlySunshine(monthlyMinutes: (number | null)[]): number | null {
  const validMonths = monthlyMinutes.filter((m): m is number => m !== null);
  if (validMonths.length === 0) return null;
  return validMonths.reduce((total, minutes) => total + minutes, 0);
}

/**
 * Formate une durée en minutes en chaîne de caractères "X h Y min"
 * @param totalMinutes - Durée totale en minutes
 * @returns Chaîne formatée, ou "Données indisponibles" si null
 */
export function formatSunshineDuration(totalMinutes: number | null): string {
  if (totalMinutes === null) return "Données indisponibles";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes.toString().padStart(2, '0')} min`;
}

/**
 * Calcule l'indice de cohérence entre la durée officielle et l'estimation
 * @param officialMinutes - Durée officielle en minutes
 * @param estimatedMinutes - Durée estimée en minutes
 * @returns Indice de cohérence (Excellent/Bon/Moyen/Faible), ou null si données manquantes
 */
export function calculateSunshineConsistency(officialMinutes: number | null, estimatedMinutes: number | null): 'Excellent' | 'Bon' | 'Moyen' | 'Faible' | null {
  if (officialMinutes === null || estimatedMinutes === null) return null;
  const difference = Math.abs(officialMinutes - estimatedMinutes);
  if (difference <= 5) return 'Excellent';
  if (difference <= 15) return 'Bon';
  if (difference <= 30) return 'Moyen';
  return 'Faible';
}

/**
 * Convertit la durée officielle Open-Meteo (en secondes) en minutes
 * @param sunshineSeconds - Durée officielle en secondes
 * @returns Durée en minutes, ou null si valeur invalide
 */
export function convertOfficialSunshineToMinutes(sunshineSeconds: number | null | undefined): number | null {
  if (sunshineSeconds === null || sunshineSeconds === undefined) return null;
  return Math.round(sunshineSeconds / 60);
}

const tempScale: Record<number, { b: string; t: string }> = {
  "-89": { b: "#000005", t: "#FFFFFF" },
  "-88": { b: "#00000A", t: "#FFFFFF" },
  "-87": { b: "#000010", t: "#FFFFFF" },
  "-86": { b: "#000015", t: "#FFFFFF" },
  "-85": { b: "#00001B", t: "#FFFFFF" },
  "-84": { b: "#000020", t: "#FFFFFF" },
  "-83": { b: "#000025", t: "#FFFFFF" },
  "-82": { b: "#00002B", t: "#FFFFFF" },
  "-81": { b: "#000030", t: "#FFFFFF" },
  "-80": { b: "#000036", t: "#FFFFFF" },
  "-79": { b: "#00003B", t: "#FFFFFF" },
  "-78": { b: "#000040", t: "#FFFFFF" },
  "-77": { b: "#000046", t: "#FFFFFF" },
  "-76": { b: "#00004B", t: "#FFFFFF" },
  "-75": { b: "#000051", t: "#FFFFFF" },
  "-74": { b: "#000056", t: "#FFFFFF" },
  "-73": { b: "#00005B", t: "#FFFFFF" },
  "-72": { b: "#000061", t: "#FFFFFF" },
  "-71": { b: "#000066", t: "#FFFFFF" },
  "-70": { b: "#00006C", t: "#FFFFFF" },
  "-69": { b: "#000071", t: "#FFFFFF" },
  "-68": { b: "#000076", t: "#FFFFFF" },
  "-67": { b: "#00007C", t: "#FFFFFF" },
  "-66": { b: "#000081", t: "#FFFFFF" },
  "-65": { b: "#000087", t: "#FFFFFF" },
  "-64": { b: "#00008C", t: "#FFFFFF" },
  "-63": { b: "#000091", t: "#FFFFFF" },
  "-62": { b: "#000097", t: "#FFFFFF" },
  "-61": { b: "#00009C", t: "#FFFFFF" },
  "-60": { b: "#0000A2", t: "#FFFFFF" },
  "-59": { b: "#0000A7", t: "#FFFFFF" },
  "-58": { b: "#0000AC", t: "#FFFFFF" },
  "-57": { b: "#0000B2", t: "#FFFFFF" },
  "-56": { b: "#0000B7", t: "#FFFFFF" },
  "-55": { b: "#0000BD", t: "#FFFFFF" },
  "-54": { b: "#0000C2", t: "#FFFFFF" },
  "-53": { b: "#0000C7", t: "#FFFFFF" },
  "-52": { b: "#0000CD", t: "#FFFFFF" },
  "-51": { b: "#0000D2", t: "#FFFFFF" },
  "-50": { b: "#0000D8", t: "#FFFFFF" },
  "-49": { b: "#0000DD", t: "#FFFFFF" },
  "-48": { b: "#0000E2", t: "#FFFFFF" },
  "-47": { b: "#0000E8", t: "#FFFFFF" },
  "-46": { b: "#0000ED", t: "#FFFFFF" },
  "-45": { b: "#0000F3", t: "#FFFFFF" },
  "-44": { b: "#0000F8", t: "#FFFFFF" },
  "-43": { b: "#0000FD", t: "#FFFFFF" },
  "-42": { b: "#0404FF", t: "#FFFFFF" },
  "-41": { b: "#0909FF", t: "#FFFFFF" },
  "-40": { b: "#0E0EFF", t: "#FFFFFF" },
  "-39": { b: "#1414FF", t: "#FFFFFF" },
  "-38": { b: "#1919FF", t: "#FFFFFF" },
  "-37": { b: "#1F1FFF", t: "#FFFFFF" },
  "-36": { b: "#2424FF", t: "#FFFFFF" },
  "-35": { b: "#2929FF", t: "#FFFFFF" },
  "-34": { b: "#2F2FFF", t: "#FFFFFF" },
  "-33": { b: "#3434FF", t: "#FFFFFF" },
  "-32": { b: "#3A3AFF", t: "#FFFFFF" },
  "-31": { b: "#3F3FFF", t: "#FFFFFF" },
  "-30": { b: "#4444FF", t: "#FFFFFF" },
  "-29": { b: "#4A4AFF", t: "#FFFFFF" },
  "-28": { b: "#4F4FFF", t: "#FFFFFF" },
  "-27": { b: "#5555FF", t: "#FFFFFF" },
  "-26": { b: "#5A5AFF", t: "#FFFFFF" },
  "-25": { b: "#5F5FFF", t: "#FFFFFF" },
  "-24": { b: "#6565FF", t: "#FFFFFF" },
  "-23": { b: "#6A6AFF", t: "#000000" },
  "-22": { b: "#6F6FFF", t: "#000000" },
  "-21": { b: "#7575FF", t: "#000000" },
  "-20": { b: "#7A7AFF", t: "#000000" },
  "-19": { b: "#8080FF", t: "#000000" },
  "-18": { b: "#8585FF", t: "#000000" },
  "-17": { b: "#8A8AFF", t: "#000000" },
  "-16": { b: "#9090FF", t: "#000000" },
  "-15": { b: "#9595FF", t: "#000000" },
  "-14": { b: "#9B9BFF", t: "#000000" },
  "-13": { b: "#A0A0FF", t: "#000000" },
  "-12": { b: "#A5A5FF", t: "#000000" },
  "-11": { b: "#ABABFF", t: "#000000" },
  "-10": { b: "#B0B0FF", t: "#000000" },
  "-9": { b: "#B6B6FF", t: "#000000" },
  "-8": { b: "#BBBBFF", t: "#000000" },
  "-7": { b: "#C0C0FF", t: "#000000" },
  "-6": { b: "#C6C6FF", t: "#000000" },
  "-5": { b: "#CBCBFF", t: "#000000" },
  "-4": { b: "#D1D1FF", t: "#000000" },
  "-3": { b: "#D6D6FF", t: "#000000" },
  "-2": { b: "#DBDBFF", t: "#000000" },
  "-1": { b: "#E1E1FF", t: "#000000" },
  "0": { b: "#E6E6FF", t: "#000000" },
  "1": { b: "#ECECFF", t: "#000000" },
  "2": { b: "#F1F1FF", t: "#000000" },
  "3": { b: "#F6F6FF", t: "#000000" },
  "4": { b: "#FCFCFF", t: "#000000" },
  "5": { b: "#FFFBF8", t: "#000000" },
  "6": { b: "#FFF4EA", t: "#000000" },
  "7": { b: "#FFEDDC", t: "#000000" },
  "8": { b: "#FFE6CE", t: "#000000" },
  "9": { b: "#FFDFC0", t: "#000000" },
  "10": { b: "#FFD9B3", t: "#000000" },
  "11": { b: "#FFD2A5", t: "#000000" },
  "12": { b: "#FFCB97", t: "#000000" },
  "13": { b: "#FFC489", t: "#000000" },
  "14": { b: "#FFBD7C", t: "#000000" },
  "15": { b: "#FFB66E", t: "#000000" },
  "16": { b: "#FFAF60", t: "#000000" },
  "17": { b: "#FFA852", t: "#000000" },
  "18": { b: "#FFA144", t: "#000000" },
  "19": { b: "#FF9B37", t: "#000000" },
  "20": { b: "#FF9429", t: "#000000" },
  "21": { b: "#FF8D1B", t: "#000000" },
  "22": { b: "#FF860D", t: "#000000" },
  "23": { b: "#FF7F00", t: "#000000" },
  "24": { b: "#FF7800", t: "#000000" },
  "25": { b: "#FF7100", t: "#000000" },
  "26": { b: "#FF6A00", t: "#000000" },
  "27": { b: "#FF6300", t: "#000000" },
  "28": { b: "#FF5D00", t: "#000000" },
  "29": { b: "#FF5600", t: "#000000" },
  "30": { b: "#FF4F00", t: "#000000" },
  "31": { b: "#FF4800", t: "#FFFFFF" },
  "32": { b: "#FF4100", t: "#FFFFFF" },
  "33": { b: "#FF3A00", t: "#FFFFFF" },
  "34": { b: "#FF3300", t: "#FFFFFF" },
  "35": { b: "#FF2C00", t: "#FFFFFF" },
  "36": { b: "#FF2500", t: "#FFFFFF" },
  "37": { b: "#FF1F00", t: "#FFFFFF" },
  "38": { b: "#FF1800", t: "#FFFFFF" },
  "39": { b: "#FF1100", t: "#FFFFFF" },
  "40": { b: "#FF0A00", t: "#FFFFFF" },
  "41": { b: "#FF0300", t: "#FFFFFF" },
  "42": { b: "#F80000", t: "#FFFFFF" },
  "43": { b: "#EA0000", t: "#FFFFFF" },
  "44": { b: "#DC0000", t: "#FFFFFF" },
  "45": { b: "#CE0000", t: "#FFFFFF" },
  "46": { b: "#C00000", t: "#FFFFFF" },
  "47": { b: "#B30000", t: "#FFFFFF" },
  "48": { b: "#A50000", t: "#FFFFFF" },
  "49": { b: "#970000", t: "#FFFFFF" },
  "50": { b: "#890000", t: "#FFFFFF" },
  "51": { b: "#7C0000", t: "#FFFFFF" },
  "52": { b: "#6E0000", t: "#FFFFFF" },
  "53": { b: "#600000", t: "#FFFFFF" },
  "54": { b: "#520000", t: "#FFFFFF" },
  "55": { b: "#440000", t: "#FFFFFF" },
  "56": { b: "#370000", t: "#FFFFFF" },
};

export function getTemperatureColor(temp: number): string {
  if (temp === null || temp === undefined) return "transparent";
  const roundedTemp = Math.round(temp);

  // Clamp values to the scale range
  const key = Math.max(-89, Math.min(56, roundedTemp));
  return tempScale[key]?.b || "#ffffff";
}

export function getTextColor(bgColor: string): string {
  // Find the temp key associated with this background color
  const entry = Object.values(tempScale).find(e => e.b === bgColor);
  return entry?.t || "#000000";
}

export function getPrecipitationColor(precip: number): string {
  if (precip === null || precip === undefined || precip === 0) return "transparent";

  // Wikipedia's scale for monthly precipitation (mm)
  if (precip >= 300) return "#000033";
  if (precip >= 200) return "#000066";
  if (precip >= 150) return "#000099";
  if (precip >= 100) return "#0000cc";
  if (precip >= 75)  return "#0000ff";
  if (precip >= 50)  return "#3333ff";
  if (precip >= 30)  return "#6666ff";
  if (precip >= 15)  return "#9999ff";
  if (precip >= 5)   return "#ccccff";
  return "#e6e6ff";
}

export function getSunshineColor(hours: number): string {
  if (hours === null || hours === undefined) return "transparent";

  // Sunshine scale
  if (hours >= 300) return "#ffff00";
  if (hours >= 250) return "#ffff33";
  if (hours >= 200) return "#ffff66";
  if (hours >= 150) return "#ffff99";
  if (hours >= 100) return "#ffffcc";
  return "#ffffee";
}

function getTimeHM(timeStr?: string | null): number {
  // timeStr is like "2026-07-07T00:00" or "2026-07-07T06:08"
  if (!timeStr || !timeStr.includes('T')) return 720; // Retourne midi par défaut (sécurité)
  const timePart = timeStr.split('T')[1];
  if (!timePart || !timePart.includes(':')) return 720;
  const [hour, minute] = timePart.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return 720;
  return hour * 60 + minute;
}

// ============================================================
// Correspondance code WMO → icône / description
// Les fichiers d'icônes utilisent maintenant des noms numériques (0.png, 1.png, ... 99.png)
// dans /public/weather-icons/day/ et /night/
// Pour ajouter une nouvelle icône : ajoutez simplement le fichier {code}.png dans les dossiers day/ et night/
// ============================================================
interface WeatherIconInfo {
  icon: string;         // Emoji de jour (fallback)
  nightIcon?: string;   // Emoji de nuit (si différent de celui du jour)
  description: string;
}

// Descriptions standards WMO pour les codes 0-99 (Table 4677 - Temps présent)
// Codes 0-3 : Codes météo Open-Meteo (temps actuel) + WMO temps présent
// Codes 4-99 : Codes temps présent WMO (table 4677)
const WMO_DESCRIPTIONS: Record<number, string> = {
  0:  "Ciel dégagé - Aucun nuage significatif",
  1:  "Principalement dégagé - Peu nuageux, majorité de ciel clair",
  2:  "Partiellement nuageux - Alternance nuages / éclaircies",
  3:  "Couvert - Ciel très nuageux à totalement couvert",
  4:  "Visibilité réduite par de la fumée (feux de forêts, fumée industrielle, cendres volcaniques)",
  5:  "Brume sèche (Haze) - Obstacles à la vue consistant en lithométéores",
  6:  "Poussière généralisée en suspension dans l'air (non soulevée par le vent près de la station)",
  7:  "Poussière ou sable soulevé par le vent près de la station, mais pas de tourbillon ni de tempête",
  8:  "Tourbillon de poussière ou de sable (Dust devil) observé pendant l'heure précédente ou au moment de l'observation",
  9:  "Tempête de poussière ou de sable en vue de la station, ou trombe d'eau (trombe marine) pendant l'heure précédente",
  10: "Brume humide (Mist) - Brouillard ou brouillard glacé, visibilité ni < 5/8 mille ni > 6 milles",
  11: "Bancs de brouillard ou de brouillard de glace (épaisseur < 2m au sol)",
  12: "Brouillard ou brouillard de glace plus ou moins continu (épaisseur < 2m au sol)",
  13: "Éclairs visibles, mais aucun tonnerre entendu (au moment de l'observation ou 15 min avant)",
  14: "Virga (précipitations n'atteignant pas le sol)",
  15: "Précipitations atteignant le sol à distance (à plus de 5 km de la station)",
  16: "Précipitations proches mais n'atteignant pas la station (à moins de 5 km)",
  17: "Orage sans précipitations au moment de l'observation",
  18: "Grains (Squalls) au moment de l'observation ou pendant l'heure précédente",
  19: "Trombe marine ou terrestre (Tornado / Funnel cloud) observée",
  20: "Bruine ou neige en grains (non verglaçante) au cours de l'heure précédente, pas au moment de l'observation",
  21: "Pluie (non verglaçante) au cours de l'heure précédente, pas au moment de l'observation",
  22: "Neige (pas sous forme d'averses) ou cristaux de glace au cours de l'heure précédente, pas au moment de l'observation",
  23: "Pluie et neige mêlées ou granules de glace (non sous forme d'averses) au cours de l'heure précédente, pas au moment de l'observation",
  24: "Bruine verglaçante ou pluie verglaçante au cours de l'heure précédente, pas au moment de l'observation",
  25: "Averse(s) de pluie au cours de l'heure précédente, pas au moment de l'observation",
  26: "Averse(s) de neige, ou de pluie et neige mêlées au cours de l'heure précédente, pas au moment de l'observation",
  27: "Averse(s) de grêle, ou de pluie et de grêle au cours de l'heure précédente, pas au moment de l'observation",
  28: "Brouillard ou brouillard de glace, visibilité < 5/8 mille au cours de l'heure précédente, pas au moment de l'observation",
  29: "Orage (avec ou sans précipitations) au cours de l'heure précédente, pas au moment de l'observation",
  30: "Tempête de poussière ou de sable, intensité diminuée, visibilité < 5/8 mille mais >= 5/16 mille",
  31: "Tempête de poussière ou de sable, intensité inchangée, visibilité < 5/8 mille mais >= 5/16 mille",
  32: "Tempête de poussière ou de sable, intensité augmentée, visibilité < 5/8 mille mais >= 5/16 mille",
  33: "Tempête de poussière ou de sable, intensité diminuée, visibilité < 5/16 mille",
  34: "Tempête de poussière ou de sable, intensité inchangée, visibilité < 5/16 mille",
  35: "Tempête de poussière ou de sable, intensité augmentée, visibilité < 5/16 mille",
  36: "Poudrerie (chasse-neige) basse, faible ou modérée",
  37: "Poudrerie (chasse-neige) basse, forte",
  38: "Chasse-neige élevée, visibilité >= 5/16 mille",
  39: "Chasse-neige élevée, visibilité < 5/16 mille",
  40: "Banc de brouillard ou de brouillard glacé (épaisseur > 2m) observé à distance de la station",
  41: "Brouillard par bancs (épaisseur > 2m), visibilité dominante < 5/8 mille",
  42: "Brouillard devenu plus mince pendant l'heure précédente (ciel visible, visibilité < 5/8 mille)",
  43: "Brouillard devenu plus mince pendant l'heure précédente (ciel invisible, visibilité < 5/8 mille)",
  44: "Brouillard sans changement pendant l'heure précédente (ciel visible, visibilité < 5/8 mille)",
  45: "Brouillard sans changement pendant l'heure précédente (ciel invisible, visibilité < 5/8 mille)",
  46: "Brouillard commençant ou devenant plus épais pendant l'heure précédente (ciel visible, visibilité < 5/8 mille)",
  47: "Brouillard commençant ou devenant plus épais pendant l'heure précédente (ciel invisible, visibilité < 5/8 mille)",
  48: "Brouillard givrant (déposant du givre, ciel visible, visibilité < 5/8 mille)",
  49: "Brouillard givrant (déposant du givre, ciel invisible, visibilité < 5/8 mille)",
  50: "Bruine faible et intermittente",
  51: "Bruine faible et continue",
  52: "Bruine modérée et intermittente",
  53: "Bruine modérée et continue",
  54: "Bruine forte mais intermittente",
  55: "Bruine forte et continue",
  56: "Bruine verglaçante faible",
  57: "Bruine verglaçante modérée ou forte",
  58: "Bruine et pluie mêlées d'intensité faible",
  59: "Bruine et pluie mêlées d'intensité modérée ou forte",
  60: "Pluie faible et intermittente",
  61: "Pluie faible et continue",
  62: "Pluie modérée et intermittente",
  63: "Pluie modérée et continue",
  64: "Pluie forte mais intermittente",
  65: "Pluie forte et continue",
  66: "Pluie verglaçante faible",
  67: "Pluie verglaçante modérée ou forte",
  68: "Pluie ou bruine et neige mêlées, intensité faible",
  69: "Pluie ou bruine et neige mêlées, intensité modérée ou forte",
  70: "Chute de neige intermittente faible",
  71: "Chute de neige continue faible",
  72: "Chute de neige modérée et intermittente",
  73: "Chute de neige modérée et continue",
  74: "Chute de neige forte mais intermittente",
  75: "Chute de neige forte et continue",
  76: "Cristaux de glace (poudrin de glace)",
  77: "Neige en grains",
  78: "Étoiles de neige isolées",
  79: "Granules de glace (non sous forme d'averses)",
  80: "Averse de pluie faible",
  81: "Averse de pluie modérée ou forte",
  82: "Averse de pluie violente (exceptionnellement forte, tropicale ou torrentielle)",
  83: "Averse de pluie et neige mêlées faible",
  84: "Averse de pluie et neige mêlées modérée ou forte",
  85: "Averse de neige faible",
  86: "Averse de neige modérée ou forte",
  87: "Averse de grésil ou neige roulée, faible (avec ou sans pluie, ou pluie et neige mêlées)",
  88: "Averse de grésil ou neige roulée, modérée ou forte (avec ou sans pluie, ou pluie et neige mêlées)",
  89: "Averse de grêle faible (sans orage, avec ou sans pluie, ou pluie et neige mêlées)",
  90: "Averse de grêle modérée ou forte (sans orage, avec ou sans pluie, ou pluie et neige mêlées)",
  91: "Pluie faible au moment de l'observation, orage pendant l'heure précédente (terminé)",
  92: "Pluie modérée ou forte au moment de l'observation, orage pendant l'heure précédente (terminé)",
  93: "Neige, ou pluie et neige mêlées, ou grêle, ou granules de glace (faible), orage heure précédente (terminé)",
  94: "Neige, ou pluie et neige mêlées, ou grêle, ou granules de glace (modéré/fort), orage heure précédente (terminé)",
  95: "Orage faible ou modéré, avec pluie ou neige",
  96: "Orage faible ou modéré, avec grêle, neige roulée ou granules de glace",
  97: "Orage fort/violent, avec pluie ou neige",
  98: "Orage combiné avec une tempête de poussière ou de sable",
  99: "Orage fort/violent, avec grêle, neige roulée ou granules de glace"
};

export function getWeatherIcon(
  code: number,
  time?: string,
  sunrise?: string,
  sunset?: string
): { imagePath: string | null; description: string } {
  if (code === null || code === undefined || code < 0 || code > 99) {
    return { imagePath: null, description: "Code invalide" };
  }

  // Détermination jour / nuit
  let isNight = false;
  if (time && sunrise && sunset) {
    const hourMinutes = getTimeHM(time);
    const sunriseMinutes = getTimeHM(sunrise);
    const sunsetMinutes = getTimeHM(sunset);
    // Vérification de sécurité: éviter les inversions sunrise/sunset
    if (sunriseMinutes < sunsetMinutes) {
      isNight = hourMinutes < sunriseMinutes || hourMinutes > sunsetMinutes;
    } else {
      // Si sunrise est après sunset (données invalides), on suppose le jour
      isNight = false;
    }
  }

  const period = isNight ? "night" : "day";
  const imageName = `${code}.png`;
  const imagePath = `/weather-icons/${period}/${imageName}`;

  const description = WMO_DESCRIPTIONS[code] ?? `Code WMO ${code} - Non défini`;

  return {
    imagePath,
    description
  };
}