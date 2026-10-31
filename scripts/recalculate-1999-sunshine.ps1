# Recalcul de l'ensoleillement estimé pour l'année 1999
# Reprend exactement la méthode et les formules des années 2000 à 2026

$wmoSunshine = @{
    0  = 60
    1  = 45
    2  = 30
    3  = 0
    45 = 0
    48 = 0
    51 = 15
    53 = 10
    55 = 0
    56 = 0
    57 = 0
    61 = 5
    63 = 0
    65 = 0
    66 = 0
    67 = 0
    71 = 5
    73 = 0
    75 = 0
    77 = 0
    80 = 20
    81 = 5
    82 = 5
    85 = 5
    86 = 5
    95 = 10
    96 = 10
    99 = 10
}

function Get-TimeMinutes($timeStr) {
    if (-not $timeStr -or -not $timeStr.Contains('T')) { return 0 }
    $parts = $timeStr.Split('T')[1].Split(':')
    return [int]$parts[0] * 60 + [int]$parts[1]
}

function Format-SunshineDuration($totalMinutes) {
    if ($null -eq $totalMinutes) { return "Données indisponibles" }
    $hours = [math]::Floor($totalMinutes / 60)
    $mins = $totalMinutes % 60
    return "{0} h {1:d2} min" -f $hours, $mins
}

function Get-SunshineConsistency($diff) {
    if ($null -eq $diff) { return $null }
    if ($diff -le 5)  { return "Excellent" }
    if ($diff -le 15) { return "Bon" }
    if ($diff -le 30) { return "Moyen" }
    return "Faible"
}

$dailyDir = "data/daily/1999"
$hourlyDir = "data/hourly/1999"

$count = 0

Get-ChildItem -Path $dailyDir -Directory | ForEach-Object {
    $month = $_.Name
    Get-ChildItem -Path $_.FullName -Filter "*.json" | ForEach-Object {
        $dailyFile = $_.FullName
        $day = $_.BaseName
        $hourlyFile = Join-Path $hourlyDir "$month/$day.json"

        if (Test-Path $hourlyFile) {
            $dailyJson = Get-Content $dailyFile -Raw -Encoding UTF8 | ConvertFrom-Json
            $hourlyJson = Get-Content $hourlyFile -Raw -Encoding UTF8 | ConvertFrom-Json

            $sunriseMin = Get-TimeMinutes $dailyJson.sunrise
            $sunsetMin = Get-TimeMinutes $dailyJson.sunset

            $estMinutes = 0
            foreach ($h in $hourlyJson) {
                $tMin = Get-TimeMinutes $h.time
                if ($tMin -ge $sunriseMin -and $tMin -lt $sunsetMin) {
                    $code = [int]$h.weather_code
                    if ($wmoSunshine.ContainsKey($code)) {
                        $estMinutes += $wmoSunshine[$code]
                    }
                }
            }

            $offMinutes = $dailyJson.sunshine_duration_minutes
            if ($null -eq $offMinutes -and $null -ne $dailyJson.sunshine_duration_seconds) {
                $offMinutes = [math]::Round($dailyJson.sunshine_duration_seconds / 60)
            }

            $diff = $null
            if ($null -ne $offMinutes -and $null -ne $estMinutes) {
                $diff = [math]::Abs($offMinutes - $estMinutes)
            }

            $consistency = Get-SunshineConsistency $diff
            $formattedEst = Format-SunshineDuration $estMinutes

            # Mettre à jour les propriétés
            $dailyJson.sunshine_duration_minutes = $offMinutes
            $dailyJson.estimated_daily_sunshine_minutes = $estMinutes
            $dailyJson.estimated_daily_sunshine = $formattedEst
            $dailyJson.sunshine_difference_minutes = $diff
            $dailyJson.sunshine_consistency = $consistency

            $newJson = $dailyJson | ConvertTo-Json -Depth 5
            [System.IO.File]::WriteAllText($dailyFile, $newJson, [System.Text.Encoding]::UTF8)
            $count++
        }
    }
}

Write-Output "Recalcul terminé : $count jours mis à jour avec succès pour l'année 1999."
