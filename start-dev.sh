#!/bin/bash
# Start EthioNews development environment on Linux/Mac
echo "Starting EthioNews development stack..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
