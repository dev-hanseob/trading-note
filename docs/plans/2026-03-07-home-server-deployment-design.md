# Home Server Deployment Design

## Date: 2026-03-07

## Overview
Docker Compose를 사용하여 macOS 홈서버(59.26.14.109:50000)에 trading-note 풀스택 배포.

## Architecture

```
[Internet] → 59.26.14.109:80
                    ↓
              [Nginx Reverse Proxy]
              /         \
    :3000              :8080
  [Next.js FE]    [Spring Boot BE]
                        ↓
                  [PostgreSQL 16]
                        ↓
                  [Volume: pgdata]
```

## Services (docker-compose.yml)

| Service | Image | Port | Notes |
|---------|-------|------|-------|
| db | postgres:16 | 5432 (internal) | Persistent volume |
| backend | Custom (Java 17, Maven) | 8080 (internal) | Spring Boot JAR |
| frontend | Custom (Node 20) | 3000 (internal) | Next.js production |
| nginx | nginx:alpine | 80 (external) | Reverse proxy |

## Nginx Routing

- `/` → frontend:3000
- `/api/*` → backend:8080
- `/uploads/*` → backend:8080

## Configuration Changes

### Backend
- `server.address`: 0.0.0.0
- DB host: `db` (Docker internal network)
- `frontend.url`: http://59.26.14.109

### Frontend
- `NEXT_PUBLIC_API_URL`: empty (Nginx proxies on same origin)

## Deployment Flow

```bash
# On home server
git clone <repo>
docker compose up --build -d
```

## File Structure

```
trading-note/
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── trading-note-be/
│   └── Dockerfile
└── trading-note-fe/
    └── Dockerfile
```

## Future

- Domain + SSL (Let's Encrypt via certbot)
- GitHub Actions for CI/CD
- Automated backup for PostgreSQL volume
