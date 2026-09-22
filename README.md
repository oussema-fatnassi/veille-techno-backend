# Veille Techno Backend - Kanban API

Backend API for a Kanban board project built with NestJS, PostgreSQL, Docker Compose, and Prisma.

## Requirements

- Node.js 24+
- npm
- Docker and Docker Compose

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env.example` is configured for the Docker PostgreSQL database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/veille_kanban?schema=public"
```

## Start the Database

```bash
docker compose up -d
```

Check that PostgreSQL is running:

```bash
docker compose ps
```

Optional database test:

```bash
docker compose exec postgres psql -U postgres -d veille_kanban -c "SELECT current_database();"
```

## Install Dependencies

```bash
npm install
```

## Run the App in Development

```bash
npm run start:dev
```

The API runs on:

```text
http://localhost:3000
```

Swagger documentation is available on:

```text
http://localhost:3000/api
```

If port `3000` is already used:

```bash
PORT=3001 npm run start:dev
```

In that case, use:

```text
http://localhost:3001
http://localhost:3001/api
```

## Prisma

Test the database connection:

```bash
npx prisma db pull
```

If the database is empty, Prisma may return `P4001`. This is normal before creating tables.

## Production Build

```bash
npm run build
npm run start:prod
```
