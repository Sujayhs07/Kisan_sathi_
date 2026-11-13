@echo off
echo ==========================================================
echo Starting Kisan Saathi Spring Boot Backend (Port 8080/api)
echo ==========================================================
cd /d "%~dp0backend"
mvn spring-boot:run
pause
