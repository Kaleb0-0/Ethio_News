@echo off
REM Start only the frontend
echo Starting EthioNews frontend only...
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build frontend