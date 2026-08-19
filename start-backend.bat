@echo off
REM Start only the backend services
echo Starting EthioNews backend only...
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build backend postgres redis