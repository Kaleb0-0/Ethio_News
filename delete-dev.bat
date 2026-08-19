@echo off
REM Reset EthioNews development environment (wipes all data)
echo ⚠️  WARNING: This will delete all data including database and Redis!
echo Press Ctrl+C to cancel or any key to continue...
pause
echo Stopping and removing all containers and volumes...
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
echo ✅ Reset complete. Run start-dev.bat to start fresh.