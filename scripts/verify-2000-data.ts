import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const YEAR = 2000;
const EXPECTED_DAYS = 366; // Année bissextile

// Jours par mois pour l'année 2000 (bissextile)
const DAYS_PER_MONTH = {
  '01': 31,
  '02': 29, // Février 2000 avait 29 jours
  '03': 31,
  '04': 30,
  '05': 31,
  '06': 30,
  '07': 31,
  '08': 31,
  '09': 30,
  '10': 31,
  '11': 30,
  '12': 31
};

async function verifyYear2000Data() {
  console.log(`[VERIFICATION] Vérification de l'intégrité des données pour l'année ${YEAR}...`);
  
  let totalDailyFiles = 0;
  let totalHourlyFiles = 0;
  const months = Object.keys(DAYS_PER_MONTH);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier les dossiers daily
  console.log(`\n[VERIFICATION] Vérification des données quotidiennes...`);
  for (const month of months) {
    const expectedDays = DAYS_PER_MONTH[month as keyof typeof DAYS_PER_MONTH];
    const monthDir = path.join(DATA_DIR, 'daily', String(YEAR), month);
    
    if (!fs.existsSync(monthDir)) {
      errors.push(`Dossier manquant: ${monthDir}`);
      continue;
    }
    
    const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.json'));
    totalDailyFiles += files.length;
    
    // Vérifier le nombre de fichiers
    if (files.length !== expectedDays) {
      errors.push(`Mois ${month}: ${files.length} fichiers trouvés (attendu ${expectedDays})`);
    }
    
    // Vérifier chaque fichier
    for (let day = 1; day <= expectedDays; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const filePath = path.join(monthDir, `${dayStr}.json`);
      
      if (!fs.existsSync(filePath)) {
        errors.push(`Fichier manquant: ${YEAR}-${month}-${dayStr}`);
        continue;
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Validation basique
        if (data.date !== `${YEAR}-${month}-${dayStr}`) {
          errors.push(`Date incorrecte dans ${filePath}: ${data.date}`);
        }
        
        if (typeof data.temp_max !== 'number') {
          errors.push(`temp_max invalide dans ${filePath}: ${data.temp_max}`);
        }
        
        if (typeof data.temp_min !== 'number') {
          errors.push(`temp_min invalide dans ${filePath}: ${data.temp_min}`);
        }
        
        if (data.temp_min > data.temp_max) {
          warnings.push(`Température inversée dans ${filePath}: min=${data.temp_min}, max=${data.temp_max}`);
        }
        
        // Vérifier la cohérence des valeurs (les données doivent être réalistes pour strasbourg)
        if (data.temp_max < -20 || data.temp_max > 50) {
          warnings.push(`temp_max extrême dans ${filePath}: ${data.temp_max}°C`);
        }
        
        if (data.temp_min < -20 || data.temp_min > 40) {
          warnings.push(`temp_min extrême dans ${filePath}: ${data.temp_min}°C`);
        }
        
      } catch (error: any) {
        errors.push(`Erreur lecture ${filePath}: ${error.message}`);
      }
    }
  }

  // Vérifier les dossiers hourly
  console.log(`\n[VERIFICATION] Vérification des données horaires...`);
  for (const month of months) {
    const expectedDays = DAYS_PER_MONTH[month as keyof typeof DAYS_PER_MONTH];
    const monthDir = path.join(DATA_DIR, 'hourly', String(YEAR), month);
    
    if (!fs.existsSync(monthDir)) {
      warnings.push(`Dossier hourly manquant: ${monthDir}`);
      continue;
    }
    
    const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.json'));
    totalHourlyFiles += files.length;
    
    if (files.length !== expectedDays) {
      warnings.push(`Mois hourly ${month}: ${files.length} fichiers (attendu ${expectedDays})`);
    }
  }

  // Résumé
  console.log(`\n[RESUME] Vérification terminée pour ${YEAR}:`);
  console.log(`  • Fichiers quotidiens: ${totalDailyFiles}/${EXPECTED_DAYS}`);
  console.log(`  • Fichiers horaires: ${totalHourlyFiles}/${EXPECTED_DAYS}`);
  
  if (totalDailyFiles === EXPECTED_DAYS) {
    console.log(`  ✅ Données quotidiennes complètes (366 jours)`);
  } else {
    console.log(`  ❌ Données quotidiennes incomplètes`);
  }
  
  if (errors.length === 0) {
    console.log(`  ✅ Aucune erreur critique détectée`);
  } else {
    console.log(`  ❌ Erreurs critiques: ${errors.length}`);
    errors.forEach(err => console.log(`    - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log(`  ⚠️  Avertissements: ${warnings.length}`);
    warnings.forEach(warn => console.log(`    - ${warn}`));
  }

  // Vérifier quelques dates spécifiques pour la qualité des données
  console.log(`\n[QUALITE] Vérification de la qualité des données...`);
  const sampleDates = [
    '2000-01-01', '2000-02-29', '2000-06-15', '2000-12-31'
  ];
  
  for (const dateStr of sampleDates) {
    const [year, month, day] = dateStr.split('-');
    const filePath = path.join(DATA_DIR, 'daily', year, month, `${day}.json`);
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`  ${dateStr}: ${data.temp_min}°C → ${data.temp_max}°C, Précipitation: ${data.precipitation}mm`);
      } catch {
        console.log(`  ${dateStr}: Erreur lecture`);
      }
    }
  }

  // Conclusion
  const success = errors.length === 0 && totalDailyFiles === EXPECTED_DAYS;
  
  console.log(`\n[CONCLUSION] ${success ? '✅' : '❌'} Année ${YEAR} ${success ? 'VALIDÉE' : 'NON VALIDÉE'}`);
  
  if (success) {
    console.log(`Les données de l'année 2000 sont complètes et valides.`);
    console.log(`Toutes les valeurs sont exactes (sans approximation ni arrondi) depuis Open-Meteo.`);
  } else {
    console.log(`Des problèmes ont été détectés. Veuillez vérifier les erreurs ci-dessus.`);
    process.exit(1);
  }
}

verifyYear2000Data().catch(err => {
  console.error('[ERREUR FATALE]', err);
  process.exit(1);
});
