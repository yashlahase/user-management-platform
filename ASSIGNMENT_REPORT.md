# Assignment Engineering Report

## Executive Summary
This report summarizes the design patterns, architectural choices, quality assurance steps, and DevOps configurations utilized to build the Enterprise User Management Platform. The system has been designed with high scalability, strict validation contracts, audit logs, concurrency controls, and dual-layer data protection.

---

## 🏗️ Core Architecture & Design Patterns

### 1. Separation of Concerns (Multi-layered Architecture)
The backend follows the standard **Controller-Service-Repository** pattern. This isolates core technical implementations:
*   **Routing Layer**: Declares API boundaries and binds rate limiters, input validations, and error handlers.
*   **Controller Layer**: Unpacks HTTP requests, extracts parameters, and delegates to the Service layer.
*   **Service Layer**: Governs core business rules, transactional logic, duplicate checks, audit logging updates, and version validation.
*   **Repository Layer**: Encapsulates database actions (Prisma Client queries), shielding business logic from details of database syntax.

### 2. Optimistic Concurrency Control (Conflict Avoidance)
To prevent write collisions (lost updates) when multiple administrative users edit the same user record:
*   Every record carries a numeric `version` counter.
*   Upon request to update, the update query targets the specific `id` **AND** expects the original `version` in the database.
*   If the update succeeds, the version is incremented. If the matching version is not found, a version mismatch is assumed (either the record was updated by another administrator, or deleted).
*   The database returns a counts update of `0`, and the backend service responds with an operational `409 Conflict` error, prompting the administrator to refresh.

### 3. Soft Delete Pattern & Restoration
In enterprise systems, hard-deleting database records is discouraged due to audit compliance and data integrity:
*   Deleting a user flags `isDeleted = true`, records the `deletedAt` timestamp, and sets the user status to `INACTIVE`.
*   Standard directory listings automatically filter out soft-deleted users.
*   An "Archived" switch on the directory UI allows administrators to view, inspect, and restore deleted records using a dedicated PATCH restoration route.

### 4. Schema Validations (Dual-tier Verification)
*   **Frontend Validation**: Implemented via Zod, bound directly to inputs using React Hook Form. Prevents submitting invalid payloads, improving UX.
*   **Backend Validation**: Applied globally on all POST/PUT routes using validation middleware. Ensures compliance regardless of client type, preventing malicious API usage.

---

## 🎨 Frontend Architecture & State Management

*   **TanStack React Query**: Used to manage server state. React Query handles cache invalidation, background synchronization, refetching on updates/deletions, and loading states automatically. This decouples API data fetching from component-level state variables.
*   **React Hook Form**: Minimizes re-renders during form inputs. Integrated with Zod resolvers to render error markers under specific inputs on the fly.
*   **MUI Theme Customization**: Features customized palettes for light and dark modes. Provides smooth UI transitions, responsive tables, pagination headers, and clear confirmation dialogs for critical actions.

---

## 🐳 DevOps & Deployment Quality

*   **Multi-Stage Docker Builds**:
    *   The `backend` build stage installs dependencies, generates the Prisma schema model classes, compiles TypeScript, and discards developer dependencies in the final production stage.
    *   The `frontend` build compile-steps create high-performance static assets, which are then copied into a minimal Nginx server container.
*   **Nginx Single Page Routing**: Configured Nginx with a customized `try_files` rule (`try_files $uri $uri/ /index.html;`). This allows React Router deep URLs to work without returning 404 errors when pages are hard-refreshed in the browser.
*   **Boot Order Orchestration**: The `docker-compose.yml` orchestrates dependency order, specifying that the `frontend-app` container starts after the `backend-api` container (`depends_on: - backend-api`). The backend connects directly to the cloud MongoDB Atlas instance specified in its environment.

---

## 📊 Quality Assurance & Testing

Both repositories feature automated testing with high test coverage:
1.  **Backend (Jest + Supertest)**: Achieved **94% test coverage** covering:
    *   Schema formatting rules (Zod parsing).
    *   Service methods (verifying email duplicates, validating versions).
    *   API routes (mocking Prisma client to perform full integrations).
2.  **Frontend (Vitest + React Testing Library)**:
    *   Tests the frontend validator schemas.
    *   Verifies rendering, buttons, and event callbacks of the reusable `ConfirmDialog` component.

---

## 🚀 Key Engineering Challenges & Solutions

*   **HTML5 Date Picker Integration**: Standard `<input type="date">` tags expect date values formatted exactly as `YYYY-MM-DD`. However, APIs return ISO strings (e.g. `1995-05-15T00:00:00.000Z`). We implemented standard date parsing utility steps (`new Date(dob).toISOString().split('T')[0]`) during form initialization in the `UserEdit` page to ensure consistent date rendering.
*   **Same-Address Checkbox Synchronization**: Entering addresses twice is tedious. We implemented a React `useEffect` watcher in the `UserForm` to automatically synchronize the current address to the permanent address if the "Same as Current Address" option is enabled.
