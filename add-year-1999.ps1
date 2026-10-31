# Script PowerShell pour ajouter l'année 1999 au projet strasbourgarchiveweather
# À exécuter étape par étape, ne pas exécuter en une seule fois

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "AJOUT DE L'ANNEE 1999 - GUIDE INTERACTIF" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérification de l'environnement
Write-Host "ÉTAPE 1: VÉRIFICATION DE L'ENVIRONNEMENT" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Vérification de Node.js..." -ForegroundColor Gray
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js installé: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js non installé" -ForegroundColor Red
    Write-Host "   Téléchargez depuis: https://nodejs.org/" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "2. Vérification de Git..." -ForegroundColor Gray
$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "   ✅ Git installé: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Git non installé" -ForegroundColor Red
    Write-Host "   Téléchargez depuis: https://git-scm.com/" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "3. Positionnement dans le dossier du projet..." -ForegroundColor Gray
$projectPath = "c:\Users\sofia\Desktop\strasbourgarchiveweather"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "   ✅ Dossier trouvé: $projectPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dossier non trouvé: $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4. Vérification de l'état Git actuel..." -ForegroundColor Gray
git status

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer à l'étape 2..."

# Étape 2: Vérification des données existantes
Write-Host ""
Write-Host "ÉTAPE 2: VÉRIFICATION DES DONNÉES EXISTANTES" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Liste des années existantes..." -ForegroundColor Gray
if (Test-Path "data\daily") {
    $years = Get-ChildItem "data\daily" -Directory | Select-Object -ExpandProperty Name
    Write-Host "   Années trouvées: $($years -join ', ')" -ForegroundColor Green
    Write-Host "   Nombre d'années: $($years.Count)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dossier data\daily non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Vérification de l'année 2000..." -ForegroundColor Gray
if (Test-Path "data\daily\2000") {
    $days2000 = 0
    Get-ChildItem "data\daily\2000" -Directory | ForEach-Object {
        $days2000 += (Get-ChildItem $_).Count
    }
    Write-Host "   ✅ Année 2000 présente avec $days2000 jours" -ForegroundColor Green
} else {
    Write-Host "   ❌ Année 2000 manquante" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Vérification de l'année 2026..." -ForegroundColor Gray
if (Test-Path "data\daily\2026") {
    Write-Host "   ✅ Année 2026 présente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Année 2026 manquante" -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer à l'étape 3..."

# Étape 3: Installation des dépendances
Write-Host ""
Write-Host "ÉTAPE 3: INSTALLATION DES DÉPENDANCES" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Vérification des dépendances npm..." -ForegroundColor Gray
$deps = @("axios", "date-fns")
foreach ($dep in $deps) {
    $installed = npm list $dep 2>$null | Select-String $dep
    if ($installed) {
        Write-Host "   ✅ $dep installé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $dep non installé" -ForegroundColor Yellow
        $install = Read-Host "   Installer $dep ? (O/N)"
        if ($install -eq "O" -or $install -eq "o") {
            npm install $dep
        }
    }
}

Write-Host ""
Write-Host "2. Vérification de TypeScript..." -ForegroundColor Gray
$tsInstalled = npm list typescript 2>$null | Select-String "typescript"
if ($tsInstalled) {
    Write-Host "   ✅ TypeScript installé" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  TypeScript non installé" -ForegroundColor Yellow
    $install = Read-Host "   Installer TypeScript ? (O/N)"
    if ($install -eq "O" -or $install -eq "o") {
        npm install -D typescript ts-node
    }
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer à l'étape 4..."

# Étape 4: Récupération des données 1999
Write-Host ""
Write-Host "ÉTAPE 4: RÉCUPÉRATION DES DONNÉES 1999" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cette étape va récupérer les données de l'API Open-Meteo." -ForegroundColor Gray
Write-Host "URL utilisée: https://archive-api.open-meteo.com/v1/archive?" -ForegroundColor Gray
Write-Host "Paramètres: latitude=34.2257, longitude=-3.3536, modèle=best_match" -ForegroundColor Gray
Write-Host "Période: 1999-01-01 à 1999-12-31 (365 jours)" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "Exécuter le script de récupération ? (O/N)"
if ($confirmation -eq "O" -or $confirmation -eq "o") {
    Write-Host "Exécution de: npx tsx scripts/fetch-year-1999.ts" -ForegroundColor Gray
    npx tsx scripts/fetch-year-1999.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script exécuté avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du script (code: $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Étape ignorée" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer à l'étape 5..."

# Étape 5: Vérification des données
Write-Host ""
Write-Host "ÉTAPE 5: VÉRIFICATION DES DONNÉES" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Vérification de la présence de l'année 1999..." -ForegroundColor Gray
if (Test-Path "data\daily\1999") {
    Write-Host "   ✅ Dossier data\daily\1999 créé" -ForegroundColor Green
    
    $months = Get-ChildItem "data\daily\1999" -Directory
    Write-Host "   Nombre de mois: $($months.Count)" -ForegroundColor Green
    
    $totalDays = 0
    foreach ($month in $months) {
        $days = Get-ChildItem $month.FullName
        Write-Host "   Mois $($month.Name): $($days.Count) jours" -ForegroundColor Gray
        $totalDays += $days.Count
    }
    Write-Host "   Total jours: $totalDays (attendu: 365)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dossier data\daily\1999 non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Vérification d'intégrité..." -ForegroundColor Gray
$confirmation = Read-Host "Exécuter le script de vérification ? (O/N)"
if ($confirmation -eq "O" -or $confirmation -eq "o") {
    Write-Host "Exécution de: npx tsx scripts/verify-1999-data.ts" -ForegroundColor Gray
    npx tsx scripts/verify-1999-data.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vérification réussie" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec de la vérification (code: $LASTEXITCODE)" -ForegroundColor Red
    }
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer à l'étape 6..."

# Étape 6: Vérification de non-régression
Write-Host ""
Write-Host "ÉTAPE 6: VÉRIFICATION DE NON-RÉGRESSION" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Vérification que l'année 2000 est intacte..." -ForegroundColor Gray
if (Test-Path "data\daily\2000\01\01.json") {
    $date2000 = Get-Content "data\daily\2000\01\01.json" | ConvertFrom-Json | Select-Object -ExpandProperty date
    Write-Host "   ✅ Fichier 2000-01-01 présent: $date2000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fichier 2000-01-01 manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Comptage final des années..." -ForegroundColor Gray
if (Test-Path "data\daily") {
    $finalYears = Get-ChildItem "data\daily" -Directory | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "   Années finales: $($finalYears -join ', ')" -ForegroundColor Green
    Write-Host "   Nombre total: $($finalYears.Count) années (devrait être 28)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ÉTAPES SUIVANTES MANUELLES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les étapes suivantes doivent être exécutées manuellement:" -ForegroundColor Gray
Write-Host "1. Ajout des fichiers à Git" -ForegroundColor Gray
Write-Host "2. Création du commit" -ForegroundColor Gray
Write-Host "3. Push sur GitHub" -ForegroundColor Gray
Write-Host "4. Déploiement sur Vercel" -ForegroundColor Gray
Write-Host ""
Write-Host "Consultez le fichier DEPLOYMENT_COMMANDS_1999.md pour les commandes exactes." -ForegroundColor Gray
Write-Host ""

# Afficher les commandes Git recommandées
Write-Host "Commandes Git recommandées:" -ForegroundColor Yellow
Write-Host "1. git add data/daily/1999/*" -ForegroundColor Gray
Write-Host "2. git add data/hourly/1999/*" -ForegroundColor Gray
Write-Host "3. git add scripts/fetch-year-1999.ts scripts/verify-1999-data.ts" -ForegroundColor Gray
Write-Host "4. git add DEPLOYMENT_COMMANDS_1999.md" -ForegroundColor Gray
Write-Host "5. git status (pour vérifier)" -ForegroundColor Gray
Write-Host "6. git commit -m ""feat: ajout de l'année 1999 complète avec données exactes Open-Meteo""" -ForegroundColor Gray
Write-Host "7. git push origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "Script terminé. Bonne continuation !" -ForegroundColor Green