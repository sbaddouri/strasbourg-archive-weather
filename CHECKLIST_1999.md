# Checklist pour l'ajout de l'année 1999

## ✅ Préparation
- [ ] Ouvrir PowerShell en tant qu'administrateur si nécessaire
- [ ] Se placer dans le dossier du projet : `cd c:\Users\sofia\Desktop\strasbourgarchiveweather`
- [ ] Vérifier que Node.js est installé : `node --version`
- [ ] Vérifier que Git est installé : `git --version`

## ✅ Vérification de l'état actuel
- [ ] Vérifier les fichiers modifiés : `git status`
- [ ] Vérifier les années existantes : `dir data\daily`
- [ ] Compter le nombre d'années : `(dir data\daily).Count` (devrait être 27 : 2000-2026)
- [ ] Vérifier une année spécifique (ex: 2000) : `Test-Path data\daily\2000`

## ✅ Installation des dépendances
- [ ] Vérifier les dépendances Node.js : `npm list`
- [ ] Installer axios si nécessaire : `npm install axios`
- [ ] Installer date-fns si nécessaire : `npm install date-fns`
- [ ] Installer ts-node/typescript si nécessaire : `npm install -D ts-node typescript`

## ✅ Récupération des données 1999
- [ ] Exécuter le script de récupération : `npx tsx scripts/fetch-year-1999.ts`
- [ ] **VÉRIFIER** que le script se termine avec "[SUCCESS]"
- [ ] **VÉRIFIER** qu'il y a 365 jours mentionnés
- [ ] **VÉRIFIER** qu'il n'y a pas d'erreur API

## ✅ Vérification des données récupérées
- [ ] Vérifier que le dossier 1999 existe : `Test-Path data\daily\1999`
- [ ] Vérifier les mois : `dir data\daily\1999` (devrait être 12 dossiers)
- [ ] Vérifier janvier : `dir data\daily\1999\01` (devrait être 31 fichiers)
- [ ] Vérifier décembre : `dir data\daily\1999\12` (devrait être 31 fichiers)
- [ ] Vérifier février : `dir data\daily\1999\02` (devrait être 28 fichiers)

## ✅ Validation d'intégrité
- [ ] Exécuter le script de vérification : `npx tsx scripts/verify-1999-data.ts`
- [ ] **VÉRIFIER** que le script se termine avec "[SUCCESS] ✅"
- [ ] **VÉRIFIER** qu'il y a 365 jours valides
- [ ] **VÉRIFIER** qu'il n'y a pas de jours invalides

## ✅ Vérification de non-régression
- [ ] Vérifier que l'année 2000 est intacte : `Test-Path data\daily\2000`
- [ ] Vérifier un fichier de 2000 : `Get-Content data\daily\2000\01\01.json | ConvertFrom-Json | Select-Object date`
- [ ] Vérifier que l'année 2026 est intacte : `Test-Path data\daily\2026`
- [ ] Compter le nombre total d'années : `(dir data\daily).Count` (devrait maintenant être 28)

## ✅ Préparation Git
- [ ] Ajouter les fichiers 1999 : `git add data/daily/1999/*`
- [ ] Ajouter les fichiers horaires 1999 : `git add data/hourly/1999/*`
- [ ] Ajouter les nouveaux scripts : `git add scripts/fetch-year-1999.ts scripts/verify-1999-data.ts`
- [ ] Ajouter le guide : `git add DEPLOYMENT_COMMANDS_1999.md`
- [ ] Vérifier ce qui sera commité : `git status`
- [ ] Voir les fichiers spécifiques : `git diff --cached --name-only | Select-Object -First 20`

## ✅ Commit
- [ ] Créer le commit : `git commit -m "feat: ajout de l'année 1999 complète avec données exactes Open-Meteo"`
- [ ] **VÉRIFIER** que le commit a réussi : `git log --oneline -1`

## ✅ Push sur GitHub
- [ ] Pousser sur GitHub : `git push origin main`
- [ ] **OU** créer une branche : `git checkout -b add-year-1999`
- [ ] **ET** pousser la branche : `git push -u origin add-year-1999`
- [ ] Vérifier que le push a réussi

## ✅ Déploiement Vercel
- [ ] Attendre le déploiement automatique (si configuré)
- [ ] **OU** déployer manuellement : `vercel --prod`
- [ ] Vérifier le site : https://strasbourgarchiveweather.vercel.app
- [ ] Vérifier que l'année 1999 est accessible

## ✅ Vérification finale
- [ ] Vérifier le statut Git final : `git status`
- [ ] Vérifier tous les dossiers annuels : `1999..2026 | % { "$_ : $(Test-Path data\daily\$_)" }`
- [ ] Vérifier le nombre total de jours : (1999:365 + 2000:366 + 2001-2025:365*25 + 2026:365 = ?)
- [ ] Documenter toute anomalie

## ⚠️ Points de vigilance
- **NE PAS** supprimer les années 2000-2026 existantes
- **VÉRIFIER** que les données sont exactes (pas d'approximations)
- **TESTER** localement avant déploiement
- **CONSERVER** une backup avant modifications
- **DOCUMENTER** les problèmes rencontrés

## 📊 Métriques de succès
- [ ] 365 fichiers dans `data/daily/1999/`
- [ ] 365 fichiers dans `data/hourly/1999/`
- [ ] 28 années totales dans `data/daily/` (1999-2026)
- [ ] Script de vérification avec succès complet
- [ ] Commit créé avec message descriptif
- [ ] Push réussi sur GitHub
- [ ] Déploiement Vercel réussi
- [ ] Site web accessible avec année 1999

## 🔧 Commandes de secours
```powershell
# En cas d'erreur, annuler les changements
git reset --hard HEAD

# Supprimer l'année 1999 si problème
Remove-Item -Recurse -Force data\daily\1999
Remove-Item -Recurse -Force data\hourly\1999

# Revenir en arrière
git checkout -- data/
git clean -fd
```

## 📝 Journal de bord
| Date | Étape | Résultat | Problèmes | Actions |
|------|-------|----------|-----------|---------|
| | Initialisation | | | |
| | Vérification état | | | |
| | Récupération données | | | |
| | Validation données | | | |
| | Commit Git | | | |
| | Déploiement | | | |