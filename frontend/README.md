# Book Tracker

A full-stack application to track books you've read.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, TanStack Query, Axios  

**Backend:** Node.js, Fastify, TypeScript, Zod  

**Database:** SQLite, Prisma ORM  

**Tests:** Vitest (6 unit tests, all passing)

## Features

- Add books with title, author, ISBN, page count, and rating (1–5)

- Client-side and server-side validation with inline error messages

- Duplicate ISBN detection (409 response)

- Paginated book list (20 per page)

- Search by title or author with 300ms debounce

- Delete books with confirmation

## Getting Started

### Prerequisites

- Node.js 18+

### Backend

cd backend

npm install

npx.cmd prisma migrate dev --name init

npm.cmd run dev

Server runs at [http://localhost:3001](http://localhost:3001)

### Frontend

cd frontend

npm install

npm.cmd run dev

App runs at [http://localhost:5173](http://localhost:5173)

### Tests

cd backend

npm.cmd test

## Architecture Decisions

**SQLite over PostgreSQL** — chosen for local development speed and

zero setup. For production with 10M+ records I would switch to

PostgreSQL with:

- GIN indexes on title and author for full-text search

- Cursor-based pagination (offset pagination degrades at scale)

- Connection pooling via PgBouncer

**Fastify over Express** — significantly faster throughput, built-in

request/response schema validation, better TypeScript support.

**Zod for validation** — single source of truth for validation rules

used on both the backend (request parsing) and frontend (form errors).

**TanStack Query** — handles caching, background refetching, and

loading states without manual boilerplate.

## Known Limitations & Possible Improvements

- Switch to PostgreSQL + GIN indexes for production scale

- Replace offset pagination with cursor-based for 10M+ records

- Add Redis cache for frequently searched queries

- JWT authentication and user accounts

- Rate limiting on POST /api/books

- End-to-end tests with Playwright

- Docker setup for easier onboarding

## AI Tools Usage

Cursor AI (with Claude) was used to generate boilerplate code:

project scaffolding, Prisma schema, Fastify route handlers, React

components, and test stubs.

All generated output was reviewed manually and tested — several issues

required hands-on debugging: CORS configuration missing DELETE method,

SQLite incompatibility with Prisma's case-insensitive search mode,

empty 204 response handling in Axios, and port conflicts during

development. Fixes were applied by understanding the root cause, not

by blindly re-prompting.