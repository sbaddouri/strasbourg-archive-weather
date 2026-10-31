# Commandes de Déploiement Vercel pour l'année 1999

## Résumé des changements
✅ **Année 1999 à ajouter** :
- 365 jours de données quotidiennes (année non bissextile)
- 365 fichiers de données horaires (24h par jour = 8760 heures)
- Modèle utilisé : `best_match` (comme spécifié par l'utilisateur)
- **Aucune approximation ni arrondi** - valeurs exactes de l'API Open-Meteo
- **Préservation intégrale** des années 2000-2026 existantes

## Configuration API Open-Meteo
- **Coordonnées** : `latitude=48.5388708`, `longitude=7.6254456` (exactement comme spécifié)
- **Fuseau horaire** : `Europe/Paris` 
- **Période** : `start_date=1999-01-01`, `end_date=1999-12-31`
- **Modèle** : `best_match` (Reanalysis models: Best Match)
- **Variables horaires** : temperature_2m, relative_humidity_2m, dew_point_2m, precipitation, weather_code, pressure_msl, wind_speed_10m, wind_gusts_10m, visibility, uv_index, sunshine_duration
- **Variables quotidiennes** : weather_code, temperature_2m_max, temperature_2m_min, temperature_2m_mean, precipitation_sum, sunshine_duration, wind_speed_10m_max, sunrise, sunset

## Commandes à exécuter MANUELLEMENT étape par étape

### 1. Vérifier l'état actuel du projet
```powershell
# Se positionner dans le dossier du projet
cd c:\Users\sofia\Desktop\strasbourgarchiveweather

# Vérifier les fichiers existants
git status

# Vérifier les années actuellement présentes
dir data\daily
dir data\hourly

# Compter le nombre d'années actuelles (devrait être 27 : 2000-2026)
(dir data\daily).Count
(dir data\hourly).Count
```

### 2. Installer les dépendances si nécessaire
```powershell
# Vérifier que Node.js est installé
node --version

# Vérifier que les dépendances sont installées
npm list axios date-fns

# Si besoin, installer les dépendances manquantes
npm install axios date-fns
```

### 3. Récupérer les données de l'année 1999 depuis Open-Meteo
```powershell
# Exécuter le script de récupération
npx tsx scripts/fetch-year-1999.ts

# OU avec node directement
node -r ts-node/register scripts/fetch-year-1999.ts
```

**Ce script va :**
1. Appeler l'API Open-Meteo avec les paramètres exacts spécifiés
2. Récupérer 365 jours de données (24h par jour)
3. Créer les dossiers `data/daily/1999` et `data/hourly/1999`
4. Générer les fichiers JSON pour chaque jour
5. Valider l'intégrité des données reçues

### 4. Vérifier l'intégrité des données récupérées
```powershell
# Exécuter le script de vérification
npx tsx scripts/verify-1999-data.ts
```

**Ce script va vérifier :**
1. Que tous les 365 jours sont présents
2. Que chaque fichier a le bon format JSON
3. Que les données sont cohérentes (temp_max >= temp_min, etc.)
4. Que les données horaires correspondent aux données quotidiennes
5. Qu'il n'y a pas de valeurs aberrantes

### 5. Vérifier que l'année 1999 a été correctement ajoutée
```powershell
# Vérifier la présence de l'année 1999
dir data\daily\1999
dir data\hourly\1999

# Compter le nombre de mois (devrait être 12)
(dir data\daily\1999).Count

# Vérifier un mois spécifique (ex: janvier)
dir data\daily\1999\01
dir data\hourly\1999\01

# Compter le nombre de jours dans janvier (devrait être 31)
(dir data\daily\1999\01).Count

# Vérifier un fichier de données quotidiennes
Get-Content data\daily\1999\01\01.json | ConvertFrom-Json | Select-Object date, temp_max, temp_min

# Vérifier un fichier de données horaires
Get-Content data\hourly\1999\01\01.json | ConvertFrom-Json | Select-Object -First 1
```

### 6. Vérifier que les années existantes sont intactes
```powershell
# Vérifier que l'année 2000 est toujours présente
Test-Path data\daily\2000
Test-Path data\hourly\2000

# Vérifier que 2026 est toujours présente
Test-Path data\daily\2026
Test-Path data\hourly\2026

# Vérifier le nombre total d'années (devrait maintenant être 28 : 1999-2026)
(dir data\daily).Count
(dir data\hourly).Count
```

### 7. Ajouter les nouveaux fichiers au git
```powershell
# Ajouter tous les fichiers de l'année 1999
git add data/daily/1999/*
git add data/hourly/1999/*

# Ajouter les nouveaux scripts
git add scripts/fetch-year-1999.ts
git add scripts/verify-1999-data.ts
git add DEPLOYMENT_COMMANDS_1999.md

# Vérifier ce qui sera commité
git status

# Voir les fichiers spécifiques qui seront ajoutés
git diff --cached --name-only
```

### 8. Créer un commit pour l'année 1999
```powershell
# Créer un commit descriptif
git commit -m "feat: ajout de l'année 1999 complète avec données exactes Open-Meteo

- Ajout de 365 jours de données météorologiques pour 1999
- Données exactes sans approximation ni arrondi (API Open-Meteo)
- Utilisation du modèle 'best_match' comme spécifié
- Coordonnées exactes: latitude=48.5388708, longitude=7.6254456
- 8760 heures de données horaires précises
- Préservation intacte des années 2000-2026 existantes
- Vérification d'intégrité réussie pour tous les jours
- Structure de dossiers cohérente avec les autres années"
```

### 9. Pousser les changements sur GitHub
```powershell
# Option A: Pousser sur la branche main directement
git push origin main

# Option B: Créer une branche dédiée (recommandé)
git checkout -b add-year-1999
git push -u origin add-year-1999

# Vérifier que le push a réussi
git log --oneline -5
```

### 10. Déployer sur Vercel

#### Option A : Déploiement automatique via GitHub (recommandé)
Si votre projet est connecté à Vercel avec GitHub :
1. Les changements seront automatiquement déployés après le push sur GitHub
2. Vérifiez le déploiement sur : https://vercel.com/{votre-compte}/strasbourgarchiveweather
3. Le site sera mis à jour à : https://strasbourgarchiveweather.vercel.app

#### Option B : Déploiement manuel via CLI Vercel
```powershell
# Installer Vercel CLI si ce n'est pas déjà fait
npm i -g vercel

# Se connecter à Vercel (si nécessaire)
vercel login

# Déployer en production
vercel --prod

# OU pour un déploiement de prévisualisation d'abord
vercel
```

### 11. Vérifier le déploiement et le site web
```powershell
# Vérifier que le site fonctionne
curl https://strasbourgarchiveweather.vercel.app

# Vérifier que l'année 1999 est accessible via l'API du site
# (dépend de l'implémentation de votre application)
```

### 12. Vérification finale
```powershell
# Vérifier le statut global
git status
git log --oneline -3

# Vérifier que toutes les années sont présentes
$years = 1999..2026
foreach ($year in $years) {
    $dailyExists = Test-Path "data\daily\$year"
    $hourlyExists = Test-Path "data\hourly\$year"
    Write-Host "Année $year : Daily=$dailyExists, Hourly=$hourlyExists"
}

# Vérifier le nombre total de jours de données
$totalDays = 0
foreach ($year in $years) {
    if (Test-Path "data\daily\$year") {
        foreach ($month in Get-ChildItem "data\daily\$year" -Directory) {
            $totalDays += (Get-ChildItem $month.FullName).Count
        }
    }
}
Write-Host "Total jours de données : $totalDays"
```

## Dépannage

### Si l'API Open-Meteo échoue :
```powershell
# Vérifier la connectivité
curl "https://archive-api.open-meteo.com/v1/archive?latitude=48.5388708&longitude=7.6254456&start_date=1999-01-01&end_date=1999-01-02&hourly=temperature_2m&daily=temperature_2m_max&timezone=Europe/Paris"

# Vérifier si l'année 1999 est disponible dans l'API
# Certaines API historiques peuvent avoir des limites
```

### Si les scripts TypeScript échouent :
```powershell
# Vérifier l'installation TypeScript
npx tsc --version

# Compiler les scripts manuellement
npx tsc scripts/fetch-year-1999.ts --outDir dist --module commonjs --target es2020

# Exécuter la version compilée
node dist/fetch-year-1999.js
```

### Si git échoue :
```powershell
# Vérifier la configuration git
git config --list

# Vérifier les permissions
git remote -v

# Annuler les changements si nécessaire
git reset --hard HEAD
```

### Si Vercel échoue :
```powershell
# Vérifier la configuration Vercel
vercel whoami

# Voir les logs de déploiement
vercel logs

# Déployer depuis le début
vercel --force
```

## Notes importantes

1. **Ne supprimez pas** les années existantes 2000-2026
2. **Vérifiez toujours** que les données sont exactes (pas d'approximations)
3. **Testez localement** avant de déployer en production
4. **Conservez une backup** des données avant toute modification
5. **Documentez** toute erreur ou problème rencontré

## Succès attendu
Après exécution complète de ces commandes, votre site https://strasbourgarchiveweather.vercel.app aura :
- ✅ Année 1999 complète (365 jours)
- ✅ Années 2000-2026 intactes
- ✅ Données exactes d'Open-Meteo (sans approximations)
- ✅ Modèle "best_match" utilisé
- ✅ Structure de dossiers cohérente
- ✅ Vérification d'intégrité réussie