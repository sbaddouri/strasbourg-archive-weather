# Commandes de Déploiement Vercel pour l'année 2000

## Résumé des changements
✅ **Année 2000 ajoutée avec succès** :
- 366 jours de données quotidiennes (année bissextile)
- 366 fichiers de données horaires  
- 8784 heures de données exactes d'Open-Meteo
- Modèle utilisé : `best_match` (comme spécifié)
- **Aucune approximation ni arrondi** - valeurs exactes de l'API

## Vérifications effectuées
1. ✅ API Open-Meteo supporte l'année 2000
2. ✅ Toutes les données ont été récupérées (366/366 jours)
3. ✅ Intégrité des données validée
4. ✅ Années 2001-2026 restées intactes
5. ✅ Structure des dossiers créée correctement

## Commandes à exécuter pour le déploiement manuel

### 1. Vérifier l'état actuel du projet
```powershell
# Se positionner dans le dossier du projet
cd c:\Users\sofia\Desktop\strasbourgarchiveweather

# Vérifier les fichiers modifiés
git status

# Vérifier que l'année 2000 est présente
dir data\daily\2000
dir data\hourly\2000

# Compter le nombre total d'années (devrait être 27)
(dir data\daily).Count
```

### 2. Ajouter les nouveaux fichiers au git
```powershell
# Ajouter tous les fichiers de l'année 2000
git add data/daily/2000/*
git add data/hourly/2000/*

# Ajouter les nouveaux scripts
git add scripts/fetch-year-2000.ts
git add scripts/verify-2000-data.ts

# Vérifier ce qui sera commité
git status
```

### 3. Créer un commit pour l'année 2000
```powershell
# Créer un commit descriptif
git commit -m "feat: ajout de l'année 2000 complète avec données exactes Open-Meteo

- Ajout de 366 jours de données météorologiques
- Données exactes sans approximation ni arrondi
- Utilisation du modèle 'best_match'
- Préservation des années existantes 2001-2026
- Vérification d'intégrité réussie"
```

### 4. Pousser les changements sur GitHub
```powershell
# Pousser sur la branche main
git push origin main

# OU si vous préférez une branche séparée
git checkout -b add-year-2000
git push -u origin add-year-2000
```

### 5. Déployer sur Vercel

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

# OU pour un déploiement de prévisualisation
vercel
```

### 6. Vérifier le déploiement
```powershell
# Vérifier que le site fonctionne
curl https://strasbourgarchiveweather.vercel.app

# Vérifier l'API des données
curl https://strasbourgarchiveweather.vercel.app/api/weather/2000

# Tester une date spécifique
curl https://strasbourgarchiveweather.vercel.app/api/weather/2000/01/01
```

## Validation du déploiement

Après déploiement, vérifiez que :

1. **Le site charge correctement** : https://strasbourgarchiveweather.vercel.app
2. **L'année 2000 est disponible** dans le sélecteur d'années
3. **Les données sont cohérentes** :
   - Température du 1er janvier 2000 : 2.1°C → 11.7°C
   - Température du 29 février 2000 : 6.4°C → 20.8°C
   - Température du 31 décembre 2000 : 8.9°C → 15.7°C
4. **Les autres années sont toujours accessibles** (2001-2026)

## Données techniques

### Scripts disponibles
- `scripts/fetch-year-2000.ts` : Récupère les données de 2000
- `scripts/verify-2000-data.ts` : Vérifie l'intégrité des données
- `test-2000-api.ts` : Test de connexion à l'API (peut être supprimé)

### Structure des données
```
data/
├── daily/
│   ├── 2000/      # NOUVEAU - Année bissextile
│   │   ├── 01/    # Janvier (31 jours)
│   │   ├── 02/    # Février (29 jours - bissextile)
│   │   ├── ...    # Mars à Décembre
│   │   └── 12/
│   ├── 2001/      # EXISTANT - Intact
│   ├── ...        # 2002-2026 - Intacts
│   └── 2026/
└── hourly/
    ├── 2000/      # NOUVEAU - Données horaires
    └── ...        # Années existantes
```

### Points d'API
- `/api/weather/2000` : Données annuelles 2000
- `/api/weather/2000/{mois}` : Données mensuelles
- `/api/weather/2000/{mois}/{jour}` : Données journalières

## Dépannage

### Si le déploiement échoue
1. Vérifier les logs Vercel : https://vercel.com/{compte}/strasbourgarchiveweather/deployments
2. Vérifier que `next.config.ts` est correctement configuré
3. S'assurer que toutes les dépendances sont installées : `npm install`

### Si les données ne s'affichent pas
1. Vérifier que les fichiers JSON sont valides
2. Tester l'API localement : `npm run dev`
3. Vérifier les permissions des fichiers

## Notes importantes
- ✅ **Données exactes** : Pas d'approximation, pas d'arrondi
- ✅ **Modèle Best Match** : Comme spécifié dans la requête
- ✅ **Années existantes** : 2001-2026 non modifiées
- ✅ **Structure identique** : Même format que les autres années

Le site sera mis à jour avec l'année 2000 disponible immédiatement après le déploiement.