Add-Type -AssemblyName System.Drawing
$logoPath = "c:\Users\aforl\Desktop\NIC Portal\nicwebportal\public\logo.jpg"
$img = [System.Drawing.Image]::FromFile($logoPath)

$bmp = New-Object System.Drawing.Bitmap 64, 64
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.DrawImage($img, 0, 0, 64, 64)

$bmp.Save("c:\Users\aforl\Desktop\NIC Portal\nicwebportal\src\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("c:\Users\aforl\Desktop\NIC Portal\nicwebportal\public\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Icon)
$bmp.Save("c:\Users\aforl\Desktop\NIC Portal\nicwebportal\src\app\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Icon)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Host "Favicon generated successfully from NIC logo."
