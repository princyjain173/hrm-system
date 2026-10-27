@echo off
echo ===============================================================
echo Starting StaffSync - Modern Human Resource Management Solution
echo ===============================================================
echo Unified Server running on http://localhost:5000
cd /d "%~dp0hrm\server"
start http://localhost:5000
node server.js
pause
