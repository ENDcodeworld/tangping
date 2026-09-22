# 生成躺平 PWA 图标：浅绿圆角方块 + 白色床形
Add-Type -AssemblyName System.Drawing

function Draw-RoundRect($g, $brush, $x, $y, $w, $h, $r) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $p.AddArc($x, $y, $d, $d, 180, 90)
    $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    $g.FillPath($brush, $p)
}

function New-Icon($size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $bgBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect,
        [System.Drawing.Color]::FromArgb(127,176,105),
        [System.Drawing.Color]::FromArgb(94,143,74), 45)
    Draw-RoundRect $g $bgBrush 0 0 $size $size ([int]($size * 0.218))

    $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    # 床板
    Draw-RoundRect $g $white ([float]($size*0.226)) ([float]($size*0.527)) ([float]($size*0.547)) ([float]($size*0.051)) ([int]($size*0.025))
    # 床腿
    $g.FillRectangle($white, [float]($size*0.226), [float]($size*0.586), [float]($size*0.035), [float]($size*0.09))
    $g.FillRectangle($white, [float]($size*0.738), [float]($size*0.586), [float]($size*0.035), [float]($size*0.09))
    # 枕头
    Draw-RoundRect $g $white ([float]($size*0.273)) ([float]($size*0.465)) ([float]($size*0.168)) ([float]($size*0.078)) ([int]($size*0.04))

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Output ("saved: " + $outPath)
}

$root = $PSScriptRoot
New-Icon 512 (Join-Path $root 'icons\icon-512.png')
New-Icon 192 (Join-Path $root 'icons\icon-192.png')
