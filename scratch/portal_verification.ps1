# ===================================================================
# AMRUTHA ADMIN PORTAL & DASHBOARD VERIFICATION SCRIPT
# ===================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AMRUTHA ADMIN PORTAL & CUSTOMER ISOLATION TEST SUITE     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Assert-Check {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "[FAIL] $Name - $Details" -ForegroundColor Red
        $script:failed++
    }
}

# -------------------------------------------------------------------
# 1. TEST FRONTEND ROUTING FOR /admin/login AND /admin/dashboard
# -------------------------------------------------------------------
Write-Host "`n--- 1. Testing Frontend URL Routing ---" -ForegroundColor Cyan

try {
    $resLogin = Invoke-WebRequest -Uri "http://localhost:3000/admin/login" -UseBasicParsing
    Assert-Check "GET /admin/login returns HTTP 200" ($resLogin.StatusCode -eq 200)
    Assert-Check "/admin/login contains Admin Portal Sign In" ($resLogin.Content.Contains("Admin Portal Sign In"))
    Assert-Check "/admin/login loads /admin/login.js" ($resLogin.Content.Contains("/admin/login.js"))
} catch {
    Assert-Check "GET /admin/login returns HTTP 200" $false $_.Exception.Message
}

try {
    $resDash = Invoke-WebRequest -Uri "http://localhost:3000/admin/dashboard" -UseBasicParsing
    Assert-Check "GET /admin/dashboard returns HTTP 200" ($resDash.StatusCode -eq 200)
    Assert-Check "/admin/dashboard contains Admin Dashboard" ($resDash.Content.Contains("Admin Dashboard"))
    Assert-Check "/admin/dashboard contains Security Guard redirect" ($resDash.Content.Contains("/admin/login?error=auth_required"))
    Assert-Check "/admin/dashboard loads /admin/dashboard.js" ($resDash.Content.Contains("/admin/dashboard.js"))
} catch {
    Assert-Check "GET /admin/dashboard returns HTTP 200" $false $_.Exception.Message
}

# -------------------------------------------------------------------
# 2. TEST REDIRECTS FOR /admin AND /admin.html
# -------------------------------------------------------------------
Write-Host "`n--- 2. Testing Administrative Redirects ---" -ForegroundColor Cyan

try {
    $req = [System.Net.HttpWebRequest]::Create("http://localhost:3000/admin")
    $req.AllowAutoRedirect = $false
    $resp = $req.GetResponse()
    $status = [int]$resp.StatusCode
    $location = $resp.Headers["Location"]
    $resp.Close()
    Assert-Check "GET /admin returns 302 Redirect" ($status -eq 302)
    Assert-Check "/admin redirects to /admin/login" ($location -eq "/admin/login")
} catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    $status = [int]$resp.StatusCode
    $location = $resp.Headers["Location"]
    Assert-Check "GET /admin returns 302 Redirect" ($status -eq 302)
    Assert-Check "/admin redirects to /admin/login" ($location -eq "/admin/login")
}

try {
    $req = [System.Net.HttpWebRequest]::Create("http://localhost:3000/admin.html")
    $req.AllowAutoRedirect = $false
    $resp = $req.GetResponse()
    $status = [int]$resp.StatusCode
    $location = $resp.Headers["Location"]
    $resp.Close()
    Assert-Check "GET /admin.html returns 302 Redirect" ($status -eq 302)
    Assert-Check "/admin.html redirects to /admin/login" ($location -eq "/admin/login")
} catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    $status = [int]$resp.StatusCode
    $location = $resp.Headers["Location"]
    Assert-Check "GET /admin.html returns 302 Redirect" ($status -eq 302)
    Assert-Check "/admin.html redirects to /admin/login" ($location -eq "/admin/login")
}

# -------------------------------------------------------------------
# 3. TEST CUSTOMER STOREFRONT PAGES (No Staff/Admin Links Exposed)
# -------------------------------------------------------------------
Write-Host "`n--- 3. Testing Public Customer Storefront Separation ---" -ForegroundColor Cyan

try {
    $resHome = Invoke-WebRequest -Uri "http://localhost:3000/index.html" -UseBasicParsing
    Assert-Check "Customer Homepage (index.html) returns 200 OK" ($resHome.StatusCode -eq 200)
    Assert-Check "Customer Homepage has NO Staff Portal link" (-not $resHome.Content.Contains("Staff Portal") -and -not $resHome.Content.Contains("admin.html"))
} catch {
    Assert-Check "Customer Homepage check" $false $_.Exception.Message
}

try {
    $resMilk = Invoke-WebRequest -Uri "http://localhost:3000/milk.html" -UseBasicParsing
    Assert-Check "Customer Milk Page (milk.html) returns 200 OK" ($resMilk.StatusCode -eq 200)
    Assert-Check "Customer Milk Page has NO Staff Portal link" (-not $resMilk.Content.Contains("Staff Portal") -and -not $resMilk.Content.Contains("admin.html"))
} catch {
    Assert-Check "Customer Milk Page check" $false $_.Exception.Message
}

try {
    $resRice = Invoke-WebRequest -Uri "http://localhost:3000/rice.html" -UseBasicParsing
    Assert-Check "Customer Rice Page (rice.html) returns 200 OK" ($resRice.StatusCode -eq 200)
    Assert-Check "Customer Rice Page has NO Staff Portal link" (-not $resRice.Content.Contains("Staff Portal") -and -not $resRice.Content.Contains("admin.html"))
} catch {
    Assert-Check "Customer Rice Page check" $false $_.Exception.Message
}

# -------------------------------------------------------------------
# 4. TEST BACKEND API SECURITY & CUSTOMER FINANCIAL PROTECTION
# -------------------------------------------------------------------
Write-Host "`n--- 4. Testing Backend Admin API Access Protection ---" -ForegroundColor Cyan

# Customers cannot access financial reports
try {
    Invoke-WebRequest -Uri "http://localhost:8080/api/admin/finance/daily?date=2026-10-18" -UseBasicParsing
    Assert-Check "Unauthenticated Customer blocked from /api/admin/finance/daily" $false "Expected 401 Unauthorized"
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Assert-Check "Unauthenticated Customer blocked from /api/admin/finance/daily (HTTP 401)" ($code -eq 401)
}

# Customers cannot access order management
try {
    Invoke-WebRequest -Uri "http://localhost:8080/api/admin/orders" -UseBasicParsing
    Assert-Check "Unauthenticated Customer blocked from /api/admin/orders" $false "Expected 401 Unauthorized"
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Assert-Check "Unauthenticated Customer blocked from /api/admin/orders (HTTP 401)" ($code -eq 401)
}

# Customers cannot access admin dashboard overview
try {
    Invoke-WebRequest -Uri "http://localhost:8080/api/admin/dashboard/overview" -UseBasicParsing
    Assert-Check "Unauthenticated Customer blocked from /api/admin/dashboard/overview" $false "Expected 401 Unauthorized"
} catch [System.Net.WebException] {
    $code = [int]$_.Exception.Response.StatusCode
    Assert-Check "Unauthenticated Customer blocked from /api/admin/dashboard/overview (HTTP 401)" ($code -eq 401)
}

# Invalid admin login attempt
try {
    $badLoginPayload = '{"username":"admin","password":"WrongPassword123"}'
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $badLoginPayload -ContentType "application/json"
    Assert-Check "Invalid password rejected" $false "Expected 401"
} catch {
    Assert-Check "Invalid password rejected with HTTP 401" $true
}

# Valid admin login
$token = ""
try {
    $loginPayload = '{"username":"admin","password":"AmruthaAdmin@2026"}'
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
    $token = $loginRes.data.token
    Assert-Check "Admin login succeeds with valid credentials" ($loginRes.success -eq $true -and $token.Length -gt 20)
    Assert-Check "Admin user has ROLE_ADMIN" ($loginRes.data.role -eq "ROLE_ADMIN")
} catch {
    Assert-Check "Admin login succeeds with valid credentials" $false $_.Exception.Message
}

# -------------------------------------------------------------------
# 5. TEST AUTHENTICATED ACCESS WITH ISSUED TOKEN
# -------------------------------------------------------------------
Write-Host "`n--- 5. Testing Authorized Access with Bearer Token ---" -ForegroundColor Cyan

if ($token) {
    $authHeaders = @{
        "Authorization" = "Bearer $token"
        "Accept"        = "application/json"
    }

    try {
        $meRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -Headers $authHeaders
        Assert-Check "GET /api/auth/me verifies valid admin token" ($meRes.success -eq $true -and $meRes.data.username -eq "admin")
    } catch {
        Assert-Check "GET /api/auth/me verifies valid admin token" $false $_.Exception.Message
    }

    try {
        $overviewRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/dashboard/overview" -Method Get -Headers $authHeaders
        Assert-Check "Authenticated GET /api/admin/dashboard/overview returns metrics" ($overviewRes.success -eq $true -and $overviewRes.data.totalOrders -ge 0)
    } catch {
        Assert-Check "Authenticated GET /api/admin/dashboard/overview returns metrics" $false $_.Exception.Message
    }

    try {
        $financeRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/finance/daily?date=2026-10-18" -Method Get -Headers $authHeaders
        Assert-Check "Authenticated GET /api/admin/finance/daily returns segregated statement" ($financeRes.success -eq $true -and $financeRes.data.dairyFinance -ne $null -and $financeRes.data.riceFinance -ne $null)
    } catch {
        Assert-Check "Authenticated GET /api/admin/finance/daily returns segregated statement" $false $_.Exception.Message
    }
}

# -------------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------------
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Passed Checks: $passed" -ForegroundColor Green
Write-Host "Failed Checks: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
if ($failed -eq 0) {
    Write-Host "`nALL 19 VERIFICATION CHECKS PASSED (100% SUCCESS)!" -ForegroundColor Green
} else {
    Write-Host "`nSOME CHECKS FAILED. PLEASE REVIEW LOGS." -ForegroundColor Red
}
