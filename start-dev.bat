@echo off
REM Start EthioNews development environment on Windows
echo Starting EthioNews development stack...
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
