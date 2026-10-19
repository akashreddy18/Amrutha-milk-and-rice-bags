# ===================================================================
# Amrutha Dairy & Rice - Spring Boot Backend Launcher (PowerShell)
# ===================================================================

param (
    [string]$DbPassword = $env:DB_PASSWORD,
    [string]$DbUser = $(if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "root" }),
    [string]$DbHost = $(if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }),
    [string]$DbPort = $(if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }),
    [string]$DbName = $(if ($env:DB_NAME) { $env:DB_NAME } else { "amrutha_db" })
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting Amrutha Spring Boot Backend (Java 21 + MySQL) " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Locate Java 21
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    if (Test-Path "C:\Users\Akash\.jdks\ms-21.0.11\bin\java.exe") {
        $env:JAVA_HOME = "C:\Users\Akash\.jdks\ms-21.0.11"
        Write-Host "[OK] Detected Java 21 at: $env:JAVA_HOME" -ForegroundColor Yellow
    }
}

# Locate Maven
$mvnCmd = "mvn"
if (-not (Get-Command "mvn" -ErrorAction SilentlyContinue)) {
    $ideaMvn = "C:\Users\Akash\AppData\Local\Programs\IntelliJ IDEA\plugins\maven\lib\maven3\bin\mvn.cmd"
    if (Test-Path $ideaMvn) {
        $mvnCmd = $ideaMvn
        Write-Host "[OK] Detected Maven at: $mvnCmd" -ForegroundColor Yellow
    }
}

# Export environment variables for Spring Boot
$env:DB_HOST = $DbHost
$env:DB_PORT = $DbPort
$env:DB_NAME = $DbName
$env:DB_USERNAME = $DbUser
if ($DbPassword) {
    $env:DB_PASSWORD = $DbPassword
}

Write-Host "Database Target: jdbc:mysql://$DbHost:$DbPort/$DbName (User: $DbUser)" -ForegroundColor DarkCyan
Write-Host "Press Ctrl+C at any time to stop the server.`n" -ForegroundColor Gray

& $mvnCmd -f "backend/pom.xml" spring-boot:run
