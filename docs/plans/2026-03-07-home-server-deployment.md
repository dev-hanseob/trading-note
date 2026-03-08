# Home Server Docker Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Docker Compose로 macOS 홈서버(59.26.14.109)에 trading-note 풀스택 배포

**Architecture:** Nginx reverse proxy가 80번 포트에서 요청을 받아 Next.js(3000)와 Spring Boot(8080)로 라우팅. PostgreSQL은 Docker volume으로 데이터 영속화. 모든 서비스는 Docker 내부 네트워크로 통신.

**Tech Stack:** Docker Compose, Nginx, PostgreSQL 16, Java 17 (Maven), Node 20

---

### Task 1: Backend Dockerfile

**Files:**
- Create: `trading-note-be/Dockerfile`

**Step 1: Create multi-stage Dockerfile**

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Step 2: Create .dockerignore**

Create `trading-note-be/.dockerignore`:
```
target/
.git
.env
*.md
.idea/
```

---

### Task 2: Frontend Dockerfile

**Files:**
- Create: `trading-note-fe/Dockerfile`

**Step 1: Create multi-stage Dockerfile**

Docker 내부에서는 Next.js rewrite가 `backend:8080`을 가리켜야 하므로, 빌드 시점이 아닌 런타임에서 Next.js가 백엔드와 통신할 수 있도록 설정.

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 2: Enable standalone output in next.config.ts**

Modify `trading-note-fe/next.config.ts` - `output: 'standalone'` 추가.
Docker 내부에서는 Nginx가 프록시하므로 rewrite destination을 `backend:8080`으로 변경.

```typescript
import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${backendUrl}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
```

**Step 3: Create .dockerignore**

Create `trading-note-fe/.dockerignore`:
```
node_modules/
.next/
.git
*.md
.env.local
```

---

### Task 3: Nginx Configuration

**Files:**
- Create: `nginx/default.conf`

**Step 1: Create nginx config**

```nginx
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:8080;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /login/oauth2/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

### Task 4: Docker Compose

**Files:**
- Create: `docker-compose.yml`

**Step 1: Create docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: trading_note
      POSTGRES_USER: seob
      POSTGRES_PASSWORD: seob
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U seob -d trading_note"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./trading-note-be
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/trading_note
      SPRING_DATASOURCE_USERNAME: seob
      SPRING_DATASOURCE_PASSWORD: seob
      SERVER_ADDRESS: 0.0.0.0
      FRONTEND_URL: http://59.26.14.109
      FILE_BASE_URL: http://59.26.14.109/uploads
    volumes:
      - uploads:/app/uploads

  frontend:
    build: ./trading-note-fe
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      BACKEND_URL: http://backend:8080

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  pgdata:
  uploads:
```

---

### Task 5: Backend Configuration for Docker

**Files:**
- Modify: `trading-note-be/src/main/resources/application.yml`

**Step 1: Ensure env var overrides work**

Spring Boot의 환경변수 오버라이드를 활용. `application.yml`에서 `server.address`와 `file.base-url`이 환경변수로 오버라이드 가능하도록 변경:

```yaml
server:
  address: ${SERVER_ADDRESS:127.0.0.1}
```

```yaml
file:
  upload-dir: ./uploads
  base-url: ${FILE_BASE_URL:http://localhost:8080/uploads}
```

이렇게 하면 로컬 개발 시에는 기존대로 동작하고, Docker에서는 환경변수로 오버라이드.

---

### Task 6: Deploy to Home Server

**Step 1: SSH into home server**

```bash
ssh seob@59.26.14.109 -p50000
```

**Step 2: Clone repository**

```bash
git clone https://github.com/dev-hanseob/trading-note-fe.git trading-note
```

Note: 모노레포 구조이므로 전체 프로젝트를 담을 방법 확인 필요. 백엔드/프론트엔드가 별도 레포라면 각각 클론.

**Step 3: Build and run**

```bash
cd trading-note
docker compose up --build -d
```

**Step 4: Verify**

```bash
docker compose ps          # 모든 서비스 running 확인
docker compose logs -f     # 로그 확인
curl http://localhost       # 응답 확인
```

---

### Task 7: Commit deployment files

**Step 1: Commit all new files**

```bash
git add docker-compose.yml nginx/ trading-note-be/Dockerfile trading-note-be/.dockerignore trading-note-fe/Dockerfile trading-note-fe/.dockerignore
git commit -m "feat: add Docker Compose deployment configuration"
```
