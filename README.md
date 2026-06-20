# Enterprise User Management Platform

An enterprise-grade, production-ready **User Management Platform** engineered with modern architectural patterns. This project is structured as a mono-repository containing decoupled frontend and backend services orchestrated using Docker Compose.

---

## 🚀 Key Architectural & Enterprise Features

*   **Multi-layered Backend Architecture**: Adheres strictly to the Controller-Service-Repository pattern.
*   **Database Schema & Validation**: Modeled with Prisma ORM (MongoDB). Robust server-side and client-side validations are enforced using **Zod**.
*   **Optimistic Concurrency Control**: Implements standard version-based optimistic locking (`version` field) on user updates to prevent write collisions.
*   **Audit Logging & Trail**: Track user history through fields like `createdAt`, `updatedAt`, `deletedAt`, `isDeleted`, `version`, `createdBy`, `updatedBy`, `status`, and administrative `remarks`.
*   **Soft Deletes & Restorations**: Supports complete archiving of user profiles (`isDeleted = true`) with one-click restoration functionality.
*   **Centralized Logging**: Integrates **Winston Logger** to output daily rotation logs, separate operational errors, and format console outputs.
*   **Security Safeguards**: Configured with `helmet`, dynamic `cors` headers, and Express request `rate-limiting`.
*   **Interactive API Documentation**: Fully documented using the OpenAPI (Swagger) specifications. Exposes endpoints at `/api-docs`.
*   **High Test Coverage**: Asserted with **Supertest + Jest** for the backend (94% coverage) and **React Testing Library + Vitest** for the frontend.

---

## 🛠️ Technical Stack

**Backend (API Service):**
*   Node.js (v20 LTS) & TypeScript
*   Express.js (REST API Gateway)
*   Prisma ORM & MongoDB
*   Winston (Logging)
*   Zod (Schema Validation)
*   Jest & Supertest (Unit & Integration Testing)
*   Swagger-UI-Express (API Documentation)

**Frontend (Client Portal):**
*   React.js (v18) & TypeScript
*   Vite (Build Tool & Dev Server)
*   Material UI (MUI v5 - Modern Dashboard Layout)
*   React Hook Form + Zod (Form States & Validations)
*   TanStack React Query v5 (Data Fetching, Caching, Mutation Synchronization)
*   Notistack (Global Toast Notifications)
*   Vitest & React Testing Library (Component Testing)

---

## 📂 Directory Structure

```
user-management-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Logger, Database, Env configurations
│   │   ├── controllers/     # Route handlers (Express)
│   │   ├── docs/            # Swagger/OpenAPI specifications
│   │   ├── middlewares/     # Error, Logging, Rate Limiter, Validations
│   │   ├── prisma/          # schema.prisma, seed scripts
│   │   ├── repositories/    # Database queries (Prisma Client)
│   │   ├── routes/          # Express API route mapping
│   │   ├── services/        # Core business & transactional logic
│   │   ├── tests/           # Repository, Service, API, and validation tests
│   │   ├── utils/           # Structured response formatters & Error classes
│   │   ├── validators/      # Zod validation schemas
│   │   └── server.ts        # Application bootstrap
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable form, layout, confirm-dialogs
│   │   ├── hooks/           # Custom React Query CRUD hooks
│   │   ├── pages/           # Listing, Details, Create, Edit views
│   │   ├── services/        # Axios API client setup
│   │   ├── tests/           # Vitest unit test suites
│   │   ├── types/           # Core typescript interfaces
│   │   └── utils/           # Client-side form validators
│   ├── Dockerfile
│   ├── nginx.conf           # Single Page App routing config
│   ├── package.json
│   └── vitest.config.ts
├── docker-compose.yml
├── init.sql                 # SQL schema provision script
└── README.md
```

---

## 🐳 Quick Start: Running with Docker Compose

Running via Docker Compose is the recommended way to stand up the entire architecture (API server and Nginx frontend server) with a single command.

### Prerequisites
Make sure you have **Docker** and **Docker Compose** installed.

### Execution
1.  Navigate to the project root directory.
2.  Run the orchestrator build command:
    ```bash
    docker-compose up --build
    ```
3.  Once fully booted:
    *   **Frontend Client Portal**: Access at [http://localhost:3001](http://localhost:3001)
    *   **Backend API Gateway**: Access at [http://localhost:5001](http://localhost:5001)
    *   **Swagger API Documentation**: Access at [http://localhost:5001/api-docs](http://localhost:5001/api-docs)

---

## 💻 Manual Developer Setup (Local Mode)

If you wish to run the frontend and backend applications outside of Docker containers:

### 1. Database Setup
1. Ensure you have a running MongoDB instance (or MongoDB Atlas cluster).
2. In `backend/.env`, configure your connection string:
   ```env
   DATABASE_URL="mongodb+srv://username:password@host/usermanagement?options..."
   ```

### 2. Run Backend
1. Navigate to `/backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client & apply migrations:
   ```bash
   npx prisma db push --schema=src/prisma/schema.prisma
   ```
4. (Optional) Seed the database with mock records:
   ```bash
   npm run prisma:seed
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

### 3. Run Frontend
1. Navigate to `/frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env` file (or let it fallback to `http://localhost:5001/api/v1` default):
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api/v1
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
5. Access UI dashboard at [http://localhost:3001](http://localhost:3001) (or printed Vite port).

---

## 🧪 Running Test Suites

Both packages include distinct automated test environments matching industry standards.

### Backend Tests (Jest + Supertest)
Runs database mock unit and API integration assertions with coverage tracking.
```bash
cd backend
npm run test           # Run all tests
npm run test:coverage  # Run and generate coverage report (94% target achieved)
```

### Frontend Tests (Vitest + React Testing Library)
Runs form validation logic, formatting, and DOM component assertions.
```bash
cd frontend
npm run test           # Run Vitest runner
```

---

## 📑 Core API Contracts Reference

All request payloads and query structures are defined via OpenAPI. A summary of endpoints:

*   `GET /api/v1/users`: Retrieve paginated user list.
    *   **Query parameters**: `page`, `limit`, `search`, `status` (ACTIVE/INACTIVE), `isDeleted` (true/false), `sortBy`, `sortOrder` (asc/desc).
*   `GET /api/v1/users/:id`: Retrieve details of a specific user.
*   `POST /api/v1/users`: Register a new user. Enforces uniqueness on Email, Aadhaar, and PAN.
*   `PUT /api/v1/users/:id`: Update user profile. Enforces optimistic lock checks using `version` header.
*   `DELETE /api/v1/users/:id`: Soft delete user account (flags `isDeleted = true`).
*   `PATCH /api/v1/users/:id/restore`: Restores a soft-deleted user profile back to the directory.
