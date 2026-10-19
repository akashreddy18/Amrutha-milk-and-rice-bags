$r = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing
Write-Host "Homepage Status:" $r.StatusCode
$css = Invoke-WebRequest -Uri 'http://localhost:3000/styles.css' -UseBasicParsing
Write-Host "Styles.css Status:" $css.StatusCode
$js = Invoke-WebRequest -Uri 'http://localhost:3000/app.js' -UseBasicParsing
Write-Host "App.js Status:" $js.StatusCode
