# Project Audit & Recommendations

## Overview
This document outlines areas where the current project deviates from industry best practices and provides actionable recommendations to improve code quality, maintainability, security, and scalability.

## 1. Architecture & Project Structure

### Current State
- **Hybrid Structure:** The project mixes root-level frontend code with a `server` subdirectory.
- **Deep Nesting:** The core frontend logic appears to be nested deep within `src/components/CBCGrading/`, suggesting a feature that outgrew its container.

### Recommendations
- **Workspace Configuration:** Convert the repository into a proper monorepo using **pnpm workspaces** or **npm workspaces**. This allows for shared types between frontend and backend and better dependency management.
  - Structure:
    ```
    /apps
      /client
      /server
    /packages
      /shared-types
      /ui-kit
    ```
- **Frontend Refactor:** Flatten the frontend structure. Move pages from `src/components/CBCGrading/pages` to a top-level `src/pages` or `src/features` directory.
- **Service Layer Pattern:** The backend uses "Fat Controllers" (e.g., `AuthController` contains validation, business logic, and database calls). Move business logic to a dedicated **Service Layer** (e.g., `AuthService`). Controllers should only handle HTTP request/response parsing.

## 2. Backend Code Quality

### Current State
- **Manual Validation:** Input validation is performed manually inside controllers (e.g., `if (!email || !password)`).
- **Console Logging:** Uses `console.log` and `console.error` for logging.
- **Type Safety:** TypeScript configuration is somewhat lenient (`noUnusedLocals: false`), and manual type casting (`as Role`) is used.

### Recommendations
- **Schema Validation:** Use **Zod** or **Joi** with middleware for request validation. This removes validation logic from controllers and ensures strict type safety.
  ```typescript
  // Example Zod Schema
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  ```
- **Structured Logging:** Replace `console.log` with a structured logger like **Winston** or **Pino**. This enables log levels (info, warn, error), JSON formatting for log aggregators, and performance benefits.
- **Strict TypeScript:** Enable stricter compiler options in `tsconfig.json` to catch potential runtime errors during build time. Avoid `any` types.

## 3. Frontend Code Quality

### Current State
- **Direct Fetch:** The API layer (`api.js`) uses native `fetch` with manual token handling and error parsing.
- **Local State Management:** Global app settings (branding) are managed via `useState` and `useEffect` in `App.jsx`.

### Recommendations
- **Data Fetching Library:** Use **TanStack Query (React Query)** or **SWR**. These libraries handle caching, deduplication, loading states, and error retries automatically, significantly reducing boilerplate code.
- **Global State:** Move application-wide state (like User Auth and Branding) to **Zustand** or **Redux Toolkit**. Context API is fine for small apps but can lead to unnecessary re-renders.
- **API Client:** Switch to **Axios** for its built-in interceptors (easier to handle 401 token refreshes globally) and automatic JSON parsing.

## 4. Security

### Current State
- **Basic Helmet:** `helmet` is used, which is good.
- **CORS:** Configured but defaults to localhost if env var is missing.

### Recommendations
- **Rate Limiting:** Implement `express-rate-limit` on all routes, with stricter limits on Authentication endpoints (`/api/auth/*`) to prevent brute-force attacks.
- **Secrets Management:** Ensure `.env.example` does not contain "real-looking" secrets. Use placeholder strings like `change_me_in_prod`.
- **Input Sanitization:** While Prisma prevents SQL injection, ensure all user inputs rendered in the frontend are sanitized to prevent XSS (React does this mostly, but be careful with `dangerouslySetInnerHTML`).

## 5. Testing & CI/CD

### Current State
- **Minimal Testing:** `jest` is installed, but test coverage appears low or non-existent for critical paths.

### Recommendations
- **Unit Testing:** Write unit tests for all backend Services and Utilities using **Jest** or **Vitest**.
- **Integration Testing:** specific tests for API endpoints using **Supertest**.
- **E2E Testing:** Implement **Playwright** or **Cypress** for critical frontend user flows (Login -> Dashboard -> Create Assessment).
- **Pre-commit Hooks:** Use **Husky** and **lint-staged** to run linters and type checks before every commit to prevent bad code from entering the repo.

## Summary Checklist
- [ ] Refactor "Fat Controllers" into Services.
- [ ] Implement Zod middleware for validation.
- [ ] Flatten Frontend directory structure.
- [ ] Add Rate Limiting to Express.
- [ ] Set up a proper logging library (Winston/Pino).
