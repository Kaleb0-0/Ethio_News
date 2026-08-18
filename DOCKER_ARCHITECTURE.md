# Ethio News - Docker Architecture Guide

## Architecture Overview

This project follows a modern, scalable Docker architecture with clear service separation and environment layering.

```
ethio-news/
├── docker-compose.yml           # Shared base service definition
├── docker-compose.dev.yml       # Local development overrides
├── docker-compose.test.yml      # Test environment overrides
├── docker-compose.prod.yml      # Production overrides
├── .env                         # Root env values used by local compose
├── ethio-news-backend/
│   ├── env/
│   │   ├── .env.development     # Dev env file
│   │   ├── .env.test            # Test env file
│   │   └── .env.production      # Prod env file
│   ├── src/
│   └── Dockerfile
├── ethio-news-frontend/
│   ├── src/
│   ├── Dockerfile
│   └── Dockerfile.dev
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── DATA/                        # Persistent volumes
│   ├── db_backups/
│   ├── nginx_logs/
│   └── certs/                   # SSL certificates (production)
└── README.md
```

## Services

### 1. **Backend API** (`backend`)

- NestJS application
- Internal port: 3000
- Networks: app-net, db-net, redis-net
- Healthcheck: HTTP endpoint
- Runs in watch mode during development

### 2. **Frontend** (`frontend`)

- React + Vite application
- Development port: 5173
- Production/edge flow: served through nginx on port 80
- Network: app-net
- Hot reload in dev mode with Vite

### 3. **PostgreSQL Database** (`postgres`)

- Version: 16-alpine
- Network: db-net (isolated from frontend)
- Persistent volume: `postgres_data`
- Healthcheck: pg_isready command
- Backups: Mounted to `DATA/db_backups`

### 4. **Redis Cache** (`redis`)

- Version: 7-alpine
- Network: redis-net (isolated)
- Persistent volume: `redis_data`
- AOF persistence enabled
- Healthcheck: redis-cli ping

### 5. **Nginx Reverse Proxy** (`nginx`)

- Alpine-based image
- Ports: 80, 443
- Network: app-net
- Routes:
  - `/` → Frontend
  - `/api/` → Backend API
  - `/health` → Health check endpoint
- CORS headers configured for API
- Gzip compression enabled
- SSL/TLS ready (commented out by default)

## Networks

```
app-net (frontend ↔ nginx)
  ├── frontend
  ├── backend
  └── nginx

db-net (backend ↔ postgres)
  ├── backend
  └── postgres

redis-net (backend ↔ redis)
  ├── backend
  └── redis
```

This segmentation provides:

- Security: Services only access what they need
- Performance: Isolated traffic
- Maintainability: Clear dependencies

## Environment Variables

The project uses environment files to keep configuration separate per environment.

### Development (`.env.development`)

- Fresh database for each session
- Debug logging enabled
- Hot reload for source code
- Local ports exposed for frontend and backend
- Frontend runs on http://localhost:5173

### Test (`.env.test`)

- Isolated test database
- Minimal logging
- No persistence in Redis
- Services run in test mode

### Production (`.env.production`)

- Uses secrets and deployment config
- Minimal logging
- Full persistence
- SSL/TLS ready
- Nginx is the public edge

## Quick Start

### Development

```bash
# Start the full base stack with development overrides
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Access:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Nginx: http://localhost

> The `-f` files are merged together. The base file defines the services, and the dev file overrides the behavior for local development.

### Testing

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml \
  --env-file ./ethio-news-backend/env/.env.test \
  up --build
```

### Production

```bash
# Set production secrets first
export PROD_DB_USERNAME=your_db_user
export PROD_DB_PASSWORD=your_db_password
export PROD_JWT_SECRET=your_jwt_secret
export PROD_FRONTEND_URL=your.domain.com

# Run with production overrides
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file ./ethio-news-backend/env/.env.production \
  up -d
```

Access:

- Frontend: http://localhost (via Nginx)
- API: http://localhost/api (via Nginx)

## Common Commands

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Follow API errors
docker compose logs -f backend --tail 100
```

### Execute commands in containers

```bash
# Database backup
docker exec ethio_news_db pg_dump -U $DB_USERNAME $DB_DATABASE > backup.sql

# Database restore
docker exec -i ethio_news_db psql -U $DB_USERNAME $DB_DATABASE < backup.sql

# Backend shell
docker exec -it ethio_news_api bash

# Redis CLI
docker exec -it ethio_news_redis redis-cli
```

### Restart services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend

# Full rebuild
docker compose down && docker compose up --build
```

### Cleanup

```bash
# Stop services
docker compose down

# Remove volumes (CAUTION: deletes data)
docker compose down -v

# Clean everything (containers, images, volumes)
docker compose down -v --rmi all
```

## Database Management

### Create backup

```bash
docker exec ethio_news_db pg_dump -U $DB_USERNAME $DB_DATABASE \
  | gzip > DATA/db_backups/backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Restore from backup

```bash
gunzip < DATA/db_backups/backup-*.sql.gz | \
  docker exec -i ethio_news_db psql -U $DB_USERNAME $DB_DATABASE
```

### Run migrations

```bash
docker exec ethio_news_api npm run migration:run
```

## Nginx Configuration

### Enable HTTPS in production

1. Place SSL certificates in `DATA/certs/`:
   - `fullchain.pem` (certificate chain)
   - `privkey.pem` (private key)

2. Uncomment the HTTPS block in `nginx/nginx.conf`

3. Enable HTTP → HTTPS redirect

## Health Checks

Each service includes a healthcheck that runs every 30 seconds:

```bash
# View health status
docker ps
# Look for "healthy" or "unhealthy" in the STATUS column

# Check specific service
docker inspect --format='{{.State.Health.Status}}' ethio_news_api
```

## Performance Tips

1. **Development**: Use bind mounts for hot reload
   - Changes to `src/` immediately reflect in containers
   - Node debug port (9229) available for IDE debugging

2. **Production**: No bind mounts, optimized images
   - Faster startup, less I/O overhead
   - Only Nginx exposes ports

3. **Caching**: Redis for session/data caching
   - Backend configured to use Redis
   - Persistent storage in `DATA/redis_data`

## Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs --tail 50

# Verify network
docker network ls | grep ethio

# Check disk space
docker system df
```

### Database connection errors

```bash
# Verify PostgreSQL is healthy
docker exec ethio_news_db pg_isready

# Check credentials
grep DB_ ethio-news-backend/env/.env.development
```

### Nginx routing issues

```bash
# Test backend connectivity
docker exec ethio_news_proxy curl -v http://backend:3000/health

# Check nginx config
docker exec ethio_news_proxy nginx -t
```

### High memory usage

```bash
# Check resource usage
docker stats

# Clean up unused images/containers
docker system prune
```

## Environment Variable Reference

| Variable         | Purpose               | Example                       |
| ---------------- | --------------------- | ----------------------------- |
| `NODE_ENV`       | Execution environment | development, test, production |
| `DB_HOST`        | Database hostname     | postgres                      |
| `DB_PORT`        | Database port         | 5432                          |
| `DB_USERNAME`    | Database user         | ethio_news_dev                |
| `DB_PASSWORD`    | Database password     | dev_password_123              |
| `DB_DATABASE`    | Database name         | ethio_news_dev                |
| `REDIS_HOST`     | Redis hostname        | redis                         |
| `REDIS_PORT`     | Redis port            | 6379                          |
| `JWT_SECRET`     | JWT signing secret    | dev_jwt_secret_change_me      |
| `JWT_EXPIRATION` | JWT token lifetime    | 7d, 1d, 30d                   |
| `API_PORT`       | API server port       | 3000                          |
| `FRONTEND_URL`   | Frontend URL for CORS | http://localhost:5173         |
| `LOG_LEVEL`      | Logging verbosity     | debug, info, warn, error      |
| `DEBUG`          | Enable debug mode     | true, false                   |

## Best Practices

✅ **DO:**

- Keep database data in `DATA/` volumes
- Use environment files for all credentials
- Separate concerns with networks
- Health checks on all services
- Use named volumes for persistence

❌ **DON'T:**

- Commit `DATA/` folder to git
- Hardcode secrets in docker-compose files
- Expose internal ports unnecessarily
- Skip healthchecks in production
- Mix frontend and backend Dockerfiles

## Security Checklist

- [ ] Use strong database password
- [ ] Set unique JWT_SECRET
- [ ] Enable HTTPS/SSL in production
- [ ] Restrict Nginx to HTTPS only
- [ ] Use environment-specific secrets
- [ ] Never commit .env files
- [ ] Regularly update base images
- [ ] Enable Redis authentication if exposed
- [ ] Monitor logs for errors
- [ ] Run database backups regularly
