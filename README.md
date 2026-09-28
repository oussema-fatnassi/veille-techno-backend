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
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=veille_kanban

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/veille_kanban?schema=public"

JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=1h
```

The real `.env` file is local only and must not be committed.

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

## Apply Database Migrations

Run Prisma migrations before starting the API for the first time:

```bash
npx prisma migrate dev
```

If Prisma Client is not up to date after schema changes, regenerate it:

```bash
npx prisma generate
```

## Seed Demo Data

For a demonstration, you can empty the local database and recreate demo users, lists, and cards:

```bash
npm run seed
```

The seed script deletes existing cards, lists, and users from the current non-production database, then creates:

| Email             | Password  | Role    | Demo data              |
| ----------------- | --------- | ------- | ---------------------- |
| `admin@test.com`  | Test1234. | `ADMIN` | admin lists and cards  |
| `tesst1@test.com` | Test1234. | `USER`  | user 1 lists and cards |
| `test2@test.com`  | Test1234. | `USER`  | user 2 lists and cards |

The script refuses to run when `NODE_ENV=production`, and it only accepts database names starting with `veille_kanban`.

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

## Using Swagger

1. Open the Swagger UI:

   ```text
   http://localhost:3000/api
   ```

2. Create an account with:

   ```http
   POST /api/auth/register
   ```

3. Login with:

   ```http
   POST /api/auth/login
   ```

4. Copy the `accessToken` returned by the login route.

5. Click the `Authorize` button at the top of Swagger and paste the token.

   If Swagger already shows the `Bearer` prefix, paste only the token. Otherwise, paste:

   ```text
   Bearer <accessToken>
   ```

6. You can now test protected routes such as:

   ```http
   GET /api/users/me
   GET /api/lists
   POST /api/lists
   POST /api/lists/{listId}/cards
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

## API Routes Status

All application routes are prefixed with `/api`. Protected routes require a JWT bearer token from `POST /api/auth/login`.

| Done | Method | Route                       | Protected | Description                            | Main success response                 | Main error responses                                                                                                       |
| ---- | ------ | --------------------------- | --------- | -------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ✅   | POST   | `/api/auth/register`        | No        | Register a new user                    | `201` user without `password`         | `400` invalid payload<br>`409` email already used                                                                          |
| ✅   | POST   | `/api/auth/login`           | No        | Login a user                           | `200` `{ "accessToken": "<JWT>" }`    | `400` invalid payload<br>`401` invalid credentials                                                                         |
| ✅   | GET    | `/api/users/me`             | Yes       | Get current authenticated user profile | `200` user without `password`         | `401` missing/invalid token                                                                                                |
| ✅   | PATCH  | `/api/users/{id}`           | Yes       | Update user profile and rights         | `200` updated user without `password` | `400` invalid payload<br>`401` missing/invalid token<br>`403` forbidden role/profile update<br>`404` user not found        |
| ✅   | GET    | `/api/lists`                | Yes       | List current user's lists              | `200` array of owned lists            | `401` missing/invalid token                                                                                                |
| ✅   | POST   | `/api/lists`                | Yes       | Create a list for current user         | `201` created list                    | `400` invalid/missing title<br>`401` missing/invalid token                                                                 |
| ✅   | PATCH  | `/api/lists/{id}`           | Yes       | Update a list                          | `200` updated list                    | `400` invalid payload<br>`401` missing/invalid token<br>`403` not list owner<br>`404` list not found                       |
| ✅   | DELETE | `/api/lists/{id}`           | Yes       | Delete a list                          | `204` no content                      | `401` missing/invalid token<br>`403` not list owner<br>`404` list not found                                                |
| ✅   | GET    | `/api/lists/{listId}/cards` | Yes       | List cards of a list                   | `200` array of cards                  | `401` missing/invalid token<br>`403` not list owner<br>`404` list not found                                                |
| ✅   | POST   | `/api/lists/{listId}/cards` | Yes       | Create a card in a list                | `201` created card                    | `400` invalid payload<br>`401` missing/invalid token<br>`403` not list owner<br>`404` list not found                       |
| ✅   | GET    | `/api/cards/{id}`           | Yes       | Get one card                           | `200` card                            | `401` missing/invalid token<br>`403` not owner of parent list<br>`404` card not found                                      |
| ✅   | PATCH  | `/api/cards/{id}`           | Yes       | Update or move a card                  | `200` updated card                    | `400` invalid payload<br>`401` missing/invalid token<br>`403` not owner of source/target list<br>`404` card/list not found |
| ✅   | DELETE | `/api/cards/{id}`           | Yes       | Delete a card                          | `204` no content                      | `401` missing/invalid token<br>`403` not owner of parent list<br>`404` card not found                                      |
| ✅   | GET    | `/api`                      | No        | Swagger documentation                  | Swagger UI                            | -                                                                                                                          |

Legend:

- ✅ Implemented
- ⏳ Documented in the contract but not implemented yet

## Authorization and Error Policy

- `401 Unauthorized`: missing, invalid, or expired JWT.
- `403 Forbidden`: the resource exists, but the authenticated user is not allowed to access it.
- `404 Not Found`: the target resource does not exist.
- User responses never expose the `password` field.

## List Deletion Behavior

Deleting a list also deletes all cards in that list. This is implemented at database level with Prisma:

```prisma
list List @relation(fields: [listId], references: [id], onDelete: Cascade)
```

This behavior was chosen because cards cannot exist without their parent list in the Kanban model.

## Prisma

Useful commands:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

## Tests and Fixtures

The project has unit tests and end-to-end tests.

Unit tests are located next to the source files:

```text
src/**/*.spec.ts
```

End-to-end tests and reusable fixtures are located in:

```text
test/
```

The e2e fixtures create reproducible data for ownership scenarios:

- one owner user
- one second user
- lists owned by each user
- cards owned through their parent lists

This makes it possible to test normal cases and errors such as `401`, `403`, `404`, and `400`.

### Prepare the test database

The e2e tests use a separate database named `veille_kanban_test` so your development data is not deleted.

Create the test database once:

```bash
docker compose exec postgres createdb -U postgres veille_kanban_test
```

If the database already exists, this command can fail safely with an "already exists" message.

Apply migrations to the test database:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/veille_kanban_test?schema=public" npx prisma migrate deploy
```

### Run tests

Run unit tests:

```bash
npm run test:unit
```

Run e2e tests with fixtures:

```bash
npm run test:e2e
```

Run coverage:

```bash
npm run test:cov -- --runInBand
```

## Production Build

```bash
npm run build
npm run start:prod
```
