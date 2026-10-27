@echo off
echo ===============================================================
echo Deploying StaffSync - Modern Human Resource Management Solution
echo ===============================================================
echo.
echo [1/3] Seeding MongoDB database...
cd /d "%~dp0hrm\server"
call node seed.js
if %errorlevel% neq 0 (
    echo Error during database seeding.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building production frontend client...
cd /d "%~dp0hrm\client"
call npm run build
if %errorlevel% neq 0 (
    echo Error during client build.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Launching StaffSync Unified Server on http://localhost:5000...
cd /d "%~dp0hrm\server"
start http://localhost:5000
node server.js
pause
