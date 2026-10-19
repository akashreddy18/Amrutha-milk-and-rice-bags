$res = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing
Write-Host "HTTP Status:" $res.StatusCode
Write-Host "Has 'Send Quick Inquiry':" ($res.Content.Contains('Send Quick Inquiry'))
Write-Host "Has 'Enter your full name':" ($res.Content.Contains('Enter your full name'))
Write-Host "Has 'Enter your 10-digit number':" ($res.Content.Contains('Enter your 10-digit number'))
Write-Host "Has 'Amrutha Fresh Milk (Daily Subscription)':" ($res.Content.Contains('Amrutha Fresh Milk (Daily Subscription)'))
Write-Host "Has 'Enter your delivery locality or questions...':" ($res.Content.Contains('Enter your delivery locality or questions...'))
Write-Host "Has 'Submit Inquiry':" ($res.Content.Contains('Submit Inquiry'))
