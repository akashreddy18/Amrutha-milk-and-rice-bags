@echo off
REM ===================================================================
REM Amrutha Dairy & Rice - Spring Boot Backend Launcher (Windows Batch)
REM ===================================================================
echo ==========================================================
echo   Starting Amrutha Spring Boot Backend (Java 21 + MySQL)
echo ==========================================================

IF NOT DEFINED JAVA_HOME (
    IF EXIST "C:\Users\Akash\.jdks\ms-21.0.11\bin\java.exe" (
        set "JAVA_HOME=C:\Users\Akash\.jdks\ms-21.0.11"
        set "PATH=%JAVA_HOME%\bin;%PATH%"
    )
)

SET MVN_CMD=mvn
WHERE mvn >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    IF EXIST "C:\Users\Akash\AppData\Local\Programs\IntelliJ IDEA\plugins\maven\lib\maven3\bin\mvn.cmd" (
        SET "MVN_CMD=C:\Users\Akash\AppData\Local\Programs\IntelliJ IDEA\plugins\maven\lib\maven3\bin\mvn.cmd"
    )
)

"%MVN_CMD%" -f backend\pom.xml spring-boot:run
pause
