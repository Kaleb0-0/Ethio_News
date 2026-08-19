# EthioNews

A full-stack news aggregation and summarization platform for Ethiopian news sources. Built with NestJS, React, PostgreSQL, and Redis.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Testing](#testing)
- [Production](#production)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Windows

**Full Stack:**

```bash
start-dev.bat
```

**Backend Only:**

```bash
start-backend.bat
```

**Frontend Only:**

```bash
start-frontend.bat
```

**Stop & Clean Up:**

```bash
delete-dev.bat
```

### Linux/Mac

```bash
chmod +x start-dev.sh
./start-dev.sh
```

Access:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379

## 📁 Project Structure

```
ethio-news/
├── start-dev.bat              # Windows: full stack development
├── start-backend.bat          # Windows: backend only
├── start-frontend.bat         # Windows: frontend only
├── delete-dev.bat             # Windows: stop and remove containers
├── start-dev.sh               # Linux/Mac: full stack development
├── docker-compose.yml         # Shared service definitions
├── docker-compose.dev.yml     # Development overrides
├── docker-compose.test.yml    # Testing overrides
├── docker-compose.prod.yml    # Production overrides
├── .env                       # Root environment file
├── .env.example               # Environment template
├── DOCKER_ARCHITECTURE.md     # Docker setup documentation
├── ethio-news-backend/        # NestJS API
│   ├── src/
│   ├── env/
│   │   ├── .env.development
│   │   ├── .env.test
│   │   └── .env.production
│   ├── Dockerfile
│   └── package.json
├── ethio-news-frontend/       # React + Vite app
│   ├── src/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
├── nginx/                     # Reverse proxy config
│   ├── Dockerfile
│   └── nginx.conf
└── DATA/                      # Persistent volumes (git-ignored)
    ├── db_backups/
    ├── nginx_logs/
    └── certs/
```

## 🛠 Tech Stack

### Backend

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **API Documentation**: Swagger

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Package Manager**: npm

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Networks**: Isolated bridge networks

## 📦 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git

No need to install Node.js, Python, or databases locally — everything runs in containers.

## ⚙️ Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DB_USERNAME=ethio_news_dev
DB_PASSWORD=your_secure_password
DB_DATABASE=ethio_news_dev
GROQ_API_KEY=your_groq_api_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your-email@example.com
```

## 🧪 Development

### Start the Dev Stack

```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh

# Or use Docker Compose directly
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### View Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Stop the Stack

```bash
docker compose down
```

### Development Features

- Hot reload for backend and frontend code
- Debug port exposed on 9229 for Node debugger
- Database and Redis ports exposed for local access
- Vite dev server with HMR on port 5173

## 🧬 Testing

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml \
  --env-file ./ethio-news-backend/env/.env.test \
  up --build
```

Tests run in isolated containers with:

- Dedicated test database
- In-memory Redis (no persistence)
- Separate test schema
- No host port exposure

## 🏭 Production

Set production secrets:

```bash
export PROD_DB_USERNAME=your_db_user
export PROD_DB_PASSWORD=your_secure_password
export PROD_JWT_SECRET=your_jwt_secret
export PROD_FRONTEND_URL=your.domain.com
```

Start production stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file ./ethio-news-backend/env/.env.production \
  up -d
```

Production features:

- No source code mounts
- Persistent data storage
- SSL/TLS ready (uncomment cert volumes)
- Optimized logging
- Always restart on failure

## 🐳 Docker

### Common Commands

```bash
# Build all images
docker compose build

# View running containers
docker compose ps

# Clean up unused images and containers
docker system prune

# Remove volumes (WARNING: deletes database)
docker compose down -v

# Restart a service
docker compose restart backend

# Execute command in container
docker compose exec backend npm run migration:run
```

For detailed Docker architecture and configuration, see [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md).

## 🔧 Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs --tail 100

# Verify all containers are running
docker compose ps

# Restart everything
docker compose restart
```

### Database connection errors

```bash
# Check PostgreSQL status
docker compose exec postgres pg_isready

# View database credentials
grep DB_ ethio-news-backend/env/.env.development
```

### Frontend not hot-reloading

- Ensure `VITE_API_URL` matches your backend URL
- Check that port 5173 is not blocked
- Verify browser WebSocket connection to dev server

### Port conflicts

- Change port mappings in `docker-compose.dev.yml`
- Or stop other services using those ports

### Permission denied on .sh file (Linux/Mac)

```bash
chmod +x start-dev.sh
```

## 📚 Additional Resources

- [Docker Architecture Guide](DOCKER_ARCHITECTURE.md)
- [Backend README](ethio-news-backend/README.md)
- [Frontend README](ethio-news-frontend/README.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)

## 📝 License

Proprietary — EthioNews
