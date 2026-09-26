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



## API Routes Status

All application routes are prefixed with `/api`. Protected routes require a JWT bearer token from `POST /api/auth/login`.


| Done | Method | Route                       | Description                            | Main success response                 | Main error responses                                                                                              |
| ---- | ------ | --------------------------- | -------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ✅    | POST   | `/api/auth/register`        | Register a new user                    | `201` user without `password`         | `400` invalid payload `409` email already used                                                                    |
| ✅    | POST   | `/api/auth/login`           | Login a user                           | `200` `{ "accessToken": "<JWT>" }`    | `400` invalid payload `401` invalid credentials                                                                   |
| ⏳    | GET    | `/api/users/me`             | Get current authenticated user profile | `200` user without `password`         | `401` missing/invalid token                                                                                       |
| ✅    | PATCH  | `/api/users/{id}`           | Update user profile and rights         | `200` updated user without `password` | `400` invalid payload `401` missing/invalid token `403` forbidden role/profile update `404` user not found        |
| ✅    | GET    | `/api/lists`                | List current user's lists              | `200` array of owned lists            | `401` missing/invalid token                                                                                       |
| ✅    | POST   | `/api/lists`                | Create a list for current user         | `201` created list                    | `400` invalid/missing title `401` missing/invalid token                                                           |
| ⏳    | PATCH  | `/api/lists/{id}`           | Update a list                          | `200` updated list                    | `400` invalid payload `401` missing/invalid token `403` not list owner `404` list not found                       |
| ✅    | DELETE | `/api/lists/{id}`           | Delete a list                          | `204` no content                      | `401` missing/invalid token `403` not list owner `404` list not found                                             |
| ✅    | GET    | `/api/lists/{listId}/cards` | List cards of a list                   | `200` array of cards                  | `401` missing/invalid token `403` not list owner `404` list not found                                             |
| ⏳    | POST   | `/api/lists/{listId}/cards` | Create a card in a list                | `201` created card                    | `400` invalid payload `401` missing/invalid token `403` not list owner `404` list not found                       |
| ⏳    | GET    | `/api/cards/{id}`           | Get one card                           | `200` card                            | `401` missing/invalid token `403` not owner of parent list `404` card not found                                   |
| ⏳    | PATCH  | `/api/cards/{id}`           | Update or move a card                  | `200` updated card                    | `400` invalid payload `401` missing/invalid token `403` not owner of source/target list `404` card/list not found |
| ⏳    | DELETE | `/api/cards/{id}`           | Delete a card                          | `204` no content                      | `401` missing/invalid token `403` not owner of parent list `404` card not found                                   |
| ✅    | GET    | `/api`                      | Swagger documentation                  | Swagger UI                            | -                                                                                                                 |


Legend:

- ✅ Implemented
- ⏳ Documented in the contract but not implemented yet



## List Deletion Behavior

At the moment, cards are not implemented yet, so deleting a list only deletes the list itself.

When cards are added to the project, the chosen behavior will be cascade deletion: deleting a list will also delete its cards. This keeps the API simple for the Kanban use case, because cards cannot exist without their parent list.

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

