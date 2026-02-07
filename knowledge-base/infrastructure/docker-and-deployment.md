# Docker & Deployment

## What It Is

The project uses **Docker Compose** for local development services and is designed for deployment to **Vercel** (recommended), Docker containers, or traditional VPS hosting.

## How It Works Here

### Docker Compose (Development)

The project's `docker-compose.yml` provides MinIO (S3 mock). PostgreSQL and Redis are shared across projects via an organization-root Docker Compose file.

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    container_name: hankosign-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    ports:
      - '9000:9000'     # S3 API
      - '9001:9001'     # Web console
    volumes:
      - hankosign_minio:/data
    networks:
      - dxengineertokyo-network

  minio-init:
    image: minio/mc:latest
    container_name: hankosign-minio-init
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 $${MINIO_ROOT_USER:-minioadmin} $${MINIO_ROOT_PASSWORD:-minioadmin} &&
      mc mb -p local/hankosign-dev || true
      "
    networks:
      - dxengineertokyo-network

volumes:
  hankosign_minio:

networks:
  dxengineertokyo-network:
    external: true
```

### Shared Infrastructure

PostgreSQL and Redis run in a parent Docker Compose:
```bash
# Start shared infrastructure first
docker compose -f ../../docker-compose.yml up -d

# Then start project-specific services
docker compose up -d
```

### Local Development Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd hankosign-digital
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials, etc.

# 3. Start Docker services
docker compose -f ../../docker-compose.yml up -d    # shared PostgreSQL + Redis
docker compose up -d                                  # MinIO

# 4. Setup database
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Populate demo data

# 5. Start development server
npm run dev           # http://localhost:3004
```

### Environment Variables

**Required for all environments:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/hankosign
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=your-secret-key
```

**S3/MinIO (development):**
```env
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET_NAME=hankosign-dev
```

**S3 (production - no endpoint, uses real AWS):**
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET_NAME=hankosign-documents
```

**Redis:**
```env
REDIS_URL=redis://localhost:6379
```

**Email:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASSWORD=app-password
SMTP_FROM=HankoSign Digital <noreply@hankosign.jp>
```

### Deployment Options

#### Vercel (Recommended)

Next.js is built by Vercel, making it the most straightforward deployment target:

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Push to main branch triggers automatic deployment
4. Serverless functions for API routes, edge network for static assets

**Considerations:**
- Serverless function timeout limits (default 10s, max 300s on Pro)
- Cold starts may affect first request latency
- File uploads go through serverless functions (check body size limits)

#### Docker Container

```dockerfile
# Example Dockerfile (not included in project)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3004
CMD ["npm", "start"]
```

#### Traditional VPS

```bash
# On server:
git pull origin main
npm install
npx prisma migrate deploy     # production migration command
npm run build
pm2 restart hankosign          # or systemd restart
```

### NPM Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev -p 3004 --webpack` | Start dev server with hot reload |
| `build` | `next build --webpack` | Production build |
| `start` | `next start -p 3004` | Start production server |
| `lint` | `eslint .` | Run linter |
| `db:migrate` | `prisma migrate dev` | Create/apply migrations (dev) |
| `db:generate` | `prisma generate` | Regenerate Prisma client |
| `db:studio` | `prisma studio` | Open database GUI |
| `db:seed` | `tsx prisma/seed.ts` | Seed demo data |

### CI/CD

**Current status:** Not configured. No `.github/workflows/` directory exists.

**Recommended pipeline:**
```yaml
# .github/workflows/ci.yml (suggested)
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run build
```

## Key Files

- `docker-compose.yml` - MinIO S3 mock service
- `package.json` - NPM scripts for dev/build/deploy
- `.env.example` - Environment variable template
- `next.config.js` - Next.js build configuration

## Best Practices

1. **Never commit `.env`**: Contains secrets. Use `.env.example` as a template.
2. **Use `prisma migrate deploy`** in production (not `prisma migrate dev`)
3. **Run `prisma generate`** in the build step to ensure the client matches the schema
4. **Set `NEXTAUTH_SECRET`** to a strong random string (32+ characters) in production

## Common Pitfalls

1. **Missing shared network**: The Docker `dxengineertokyo-network` must exist before starting services
2. **Port conflicts**: Default ports (3004, 9000, 9001) may conflict with other services
3. **Database migrations in production**: Use `prisma migrate deploy`, not `prisma migrate dev` (which can drop data)
4. **MinIO bucket not created**: If the `minio-init` container fails, manually create the bucket via the MinIO console at `http://localhost:9001`

## Resources

- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/orm/prisma-migrate/workflows/deploy-migration)
