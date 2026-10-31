# Script de génération des icônes météorologiques pour le jour et la nuit
# Crée les dossiers et génère des images PNG transparentes haute qualité

Add-Type -AssemblyName System.Drawing

$dayDir = "public/weather-icons/day"
$nightDir = "public/weather-icons/night"

if (-not (Test-Path $dayDir)) { New-Item -ItemType Directory -Path $dayDir -Force | Out-Null }
if (-not (Test-Path $nightDir)) { New-Item -ItemType Directory -Path $nightDir -Force | Out-Null }

# 1. Dossiers d'icônes
if (-not (Test-Path $dayDir)) { New-Item -ItemType Directory -Path $dayDir -Force | Out-Null }
if (-not (Test-Path $nightDir)) { New-Item -ItemType Directory -Path $nightDir -Force | Out-Null }

# Fonctions d'assistance graphique
function New-Canvas {
    $bmp = New-Object System.Drawing.Bitmap(160, 160)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    return @{ Bitmap = $bmp; Graphics = $g }
}

function Save-And-Dispose($canvas, $path) {
    $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Graphics.Dispose()
    $canvas.Bitmap.Dispose()
}

function Draw-Sun($g, $cx, $cy, $radius) {
    # Rayons dorés
    for ($i = 0; $i -lt 12; $i++) {
        $angle = $i * [Math]::PI / 6.0
        $x1 = $cx + ($radius + 6) * [Math]::Cos($angle)
        $y1 = $cy + ($radius + 6) * [Math]::Sin($angle)
        $x2 = $cx + ($radius + 18) * [Math]::Cos($angle)
        $y2 = $cy + ($radius + 18) * [Math]::Sin($angle)
        
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 255, 175, 20), 4.5)
        $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $g.DrawLine($pen, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
        $pen.Dispose()
    }

    # Halo externe doux
    $haloBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 255, 200, 0))
    $g.FillEllipse($haloBrush, [float]($cx - $radius - 6), [float]($cy - $radius - 6), [float](($radius + 6) * 2), [float](($radius + 6) * 2))
    $haloBrush.Dispose()

    # Corps du soleil avec dégradé chaud
    $rect = New-Object System.Drawing.RectangleF([float]($cx - $radius), [float]($cy - $radius), [float]($radius * 2), [float]($radius * 2))
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 255, 220, 50), [System.Drawing.Color]::FromArgb(255, 255, 130, 0), [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    $g.FillEllipse($gradBrush, $rect)
    $gradBrush.Dispose()

    # Reflet spéculaire
    $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 255, 255, 255))
    $g.FillEllipse($highlightBrush, [float]($cx - $radius * 0.55), [float]($cy - $radius * 0.65), [float]($radius * 0.8), [float]($radius * 0.55))
    $highlightBrush.Dispose()
}

function Draw-Cloud($g, $x, $y, $scale, $isDark = $false) {
    # Forme de nuage volumétrique
    $cTop = if ($isDark) { [System.Drawing.Color]::FromArgb(240, 140, 150, 165) } else { [System.Drawing.Color]::FromArgb(255, 255, 255, 255) }
    $cBottom = if ($isDark) { [System.Drawing.Color]::FromArgb(255, 75, 85, 100) } else { [System.Drawing.Color]::FromArgb(245, 195, 205, 218) }

    $rect = New-Object System.Drawing.RectangleF($x, $y, (90 * $scale), (55 * $scale))
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBottom, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(($x + 10 * $scale), ($y + 15 * $scale), (35 * $scale), (35 * $scale))
    $path.AddEllipse(($x + 30 * $scale), ($y + 2 * $scale), (40 * $scale), (40 * $scale))
    $path.AddEllipse(($x + 55 * $scale), ($y + 12 * $scale), (35 * $scale), (35 * $scale))
    $path.AddEllipse(($x + 5 * $scale), ($y + 22 * $scale), (75 * $scale), (30 * $scale))

    # Ombre portée douce
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
    $shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shadowPath.AddEllipse(($x + 5 * $scale), ($y + 25 * $scale), (75 * $scale), (30 * $scale))
    $g.FillPath($shadowBrush, $shadowPath)
    $shadowBrush.Dispose()
    $shadowPath.Dispose()

    $g.FillPath($gradBrush, $path)
    $gradBrush.Dispose()
    $path.Dispose()
}

function Draw-Raindrops($g, $startX, $startY, $count, $isHeavy = $false) {
    $thickness = [float]2.5
    if ($isHeavy) { $thickness = [float]3.5 }
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230, 80, 160, 240), $thickness)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    for ($i = 0; $i -lt $count; $i++) {
        $rx = $startX + ($i * 18)
        $ry = $startY + (($i % 2) * 8)
        $len = 15
        if ($isHeavy) { $len = 22 }
        $g.DrawLine($pen, [float]$rx, [float]$ry, [float]($rx - 4), [float]($ry + $len))
    }
    $pen.Dispose()
}

function Draw-Snowflakes($g, $startX, $startY, $count) {
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 210, 235, 255), 2.2)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    for ($i = 0; $i -lt $count; $i++) {
        $cx = $startX + ($i * 22)
        $cy = $startY + (($i % 2) * 10)
        $r = 6.0
        # Croix flocon
        $g.DrawLine($pen, [float]($cx - $r), [float]$cy, [float]($cx + $r), [float]$cy)
        $g.DrawLine($pen, [float]$cx, [float]($cy - $r), [float]$cx, [float]($cy + $r))
        $g.DrawLine($pen, [float]($cx - $r*0.7), [float]($cy - $r*0.7), [float]($cx + $r*0.7), [float]($cy + $r*0.7))
        $g.DrawLine($pen, [float]($cx - $r*0.7), [float]($cy + $r*0.7), [float]($cx + $r*0.7), [float]($cy - $r*0.7))
    }
    $pen.Dispose()
}

function Draw-Lightning($g, $x, $y) {
    $penGlow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 180, 100, 255), 6.0)
    $penGlow.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penGlow.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $penCore = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 180), 3.0)
    $penCore.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penCore.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    $pts = @(
        [System.Drawing.PointF]::new($x, $y),
        [System.Drawing.PointF]::new(($x + 10), ($y + 20)),
        [System.Drawing.PointF]::new(($x + 3), ($y + 22)),
        [System.Drawing.PointF]::new(($x + 15), ($y + 45))
    )

    for ($i = 0; $i -lt ($pts.Length - 1); $i++) {
        $g.DrawLine($penGlow, $pts[$i], $pts[$i+1])
        $g.DrawLine($penCore, $pts[$i], $pts[$i+1])
    }

    $penGlow.Dispose()
    $penCore.Dispose()
}

function Draw-FogBands($g, $startX, $startY, $w, $count) {
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190, 215, 225, 235), 4.5)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    for ($i = 0; $i -lt $count; $i++) {
        $y = $startY + ($i * 12)
        $offset = ($i % 2) * 8
        $g.DrawLine($pen, [float]($startX + $offset), [float]$y, [float]($startX + $w - $offset), [float]$y)
    }
    $pen.Dispose()
}

# --- GENERATION DES ICONES DE JOUR ---

# 1. Ciel dégagé (Soleil franc)
$c = New-Canvas
Draw-Sun $c.Graphics 80 80 40
Save-And-Dispose $c "$dayDir/ciel-degage.png"

# 2. Ciel voilé (Soleil + léger voile)
$c = New-Canvas
Draw-Sun $c.Graphics 75 70 36
$veilBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 255, 255, 255))
$c.Graphics.FillEllipse($veilBrush, 35, 60, 95, 30)
$c.Graphics.FillEllipse($veilBrush, 45, 80, 85, 25)
$veilBrush.Dispose()
Save-And-Dispose $c "$dayDir/ciel-voile.png"

# 3. Éclaircies / Nuages et soleil
$c = New-Canvas
Draw-Sun $c.Graphics 105 55 32
Draw-Cloud $c.Graphics 20 60 1.25 $false
Save-And-Dispose $c "$dayDir/eclaircies.png"

# 4. Couvert / Très nuageux
$c = New-Canvas
Draw-Cloud $c.Graphics 20 30 1.2 $true
Draw-Cloud $c.Graphics 40 55 1.3 $true
Save-And-Dispose $c "$dayDir/couvert.png"

# 5. Brouillard
$c = New-Canvas
Draw-Sun $c.Graphics 80 50 30
Draw-FogBands $c.Graphics 25 85 110 4
Save-And-Dispose $c "$dayDir/brouillard.png"

# 6. Bruine
$c = New-Canvas
Draw-Cloud $c.Graphics 30 40 1.15 $false
Draw-Raindrops $c.Graphics 52 105 3 $false
Save-And-Dispose $c "$dayDir/bruine.png"

# 7. Pluie faible
$c = New-Canvas
Draw-Cloud $c.Graphics 30 38 1.15 $true
Draw-Raindrops $c.Graphics 50 102 3 $false
Save-And-Dispose $c "$dayDir/pluie-faible.png"

# 8. Pluie (modérée / forte)
$c = New-Canvas
Draw-Cloud $c.Graphics 25 35 1.25 $true
Draw-Raindrops $c.Graphics 45 100 4 $true
Save-And-Dispose $c "$dayDir/pluie.png"

# 9. Pluie verglaçante
$c = New-Canvas
Draw-Cloud $c.Graphics 30 38 1.15 $true
Draw-Raindrops $c.Graphics 48 102 2 $false
Draw-Snowflakes $c.Graphics 80 102 2
Save-And-Dispose $c "$dayDir/pluie-verglacante.png"

# 10. Neige
$c = New-Canvas
Draw-Cloud $c.Graphics 30 35 1.15 $true
Draw-Snowflakes $c.Graphics 45 102 4
Save-And-Dispose $c "$dayDir/neige.png"

# 11. Averses de pluie
$c = New-Canvas
Draw-Sun $c.Graphics 105 52 30
Draw-Cloud $c.Graphics 22 55 1.2 $true
Draw-Raindrops $c.Graphics 48 115 3 $false
Save-And-Dispose $c "$dayDir/averses-pluie.png"

# 12. Averses de neige
$c = New-Canvas
Draw-Sun $c.Graphics 105 52 30
Draw-Cloud $c.Graphics 22 55 1.2 $true
Draw-Snowflakes $c.Graphics 45 115 3
Save-And-Dispose $c "$dayDir/averses-neige.png"

# 13. Orage
$c = New-Canvas
Draw-Cloud $c.Graphics 25 32 1.3 $true
Draw-Lightning $c.Graphics 70 85
Draw-Raindrops $c.Graphics 45 110 3 $true
Save-And-Dispose $c "$dayDir/orage.png"

# --- GENERATION DES ICONES MANQUANTES DE NUIT ---

# Bruine nuit
$c = New-Canvas
Draw-Cloud $c.Graphics 30 40 1.15 $true
Draw-Raindrops $c.Graphics 52 105 3 $false
Save-And-Dispose $c "$nightDir/bruine.png"

# Pluie nuit
$c = New-Canvas
Draw-Cloud $c.Graphics 25 35 1.25 $true
Draw-Raindrops $c.Graphics 45 100 4 $true
Save-And-Dispose $c "$nightDir/pluie.png"

# Pluie faible nuit
$c = New-Canvas
Draw-Cloud $c.Graphics 30 38 1.15 $true
Draw-Raindrops $c.Graphics 50 102 3 $false
Save-And-Dispose $c "$nightDir/pluie-faible.png"

# Pluie verglaçante nuit
$c = New-Canvas
Draw-Cloud $c.Graphics 30 38 1.15 $true
Draw-Raindrops $c.Graphics 48 102 2 $false
Draw-Snowflakes $c.Graphics 80 102 2
Save-And-Dispose $c "$nightDir/pluie-verglacante.png"

# Neige nuit
$c = New-Canvas
Draw-Cloud $c.Graphics 30 35 1.15 $true
Draw-Snowflakes $c.Graphics 45 102 4
Save-And-Dispose $c "$nightDir/neige.png"

Write-Output "Génération des icônes jour et nuit terminée avec succès."
