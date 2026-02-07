# HankoSign Digital - Knowledge Base

A comprehensive learning resource covering every technology, pattern, and decision in the HankoSign Digital project.

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript / JavaScript | 5.3.3 / ES2020 |
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS + DaisyUI | 3.4.1 / 4.6.1 |
| Database | PostgreSQL + Prisma ORM | 14+ / 5.9.0 |
| Cache | Redis | 6+ (client 4.6.12) |
| Auth | NextAuth.js (JWT) | 4.24.5 |
| Storage | AWS S3 (MinIO for dev) | SDK 3.984.0 |
| Email | Nodemailer (SMTP) | 7.0.7 |
| i18n | next-intl | 4.8.2 |
| Validation | Zod + React Hook Form | 3.22.4 / 7.49.3 |
| Canvas | Fabric.js | 7.1.0 |
| Icons | Lucide React | 0.530.0 |

## How to Use This Knowledge Base

Each document follows a consistent structure:
- **What It Is** - Brief concept explanation
- **Why We Use It** - Project rationale
- **How It Works Here** - Implementation details with file references
- **Code Examples** - Real snippets from this codebase
- **Key Files** - File paths with descriptions
- **Best Practices** - Guidelines followed
- **Common Pitfalls** - Mistakes to avoid
- **Resources** - Official docs and tutorials

Start with [Project Overview](./project-overview/architecture.md) for the big picture, then dive into specific topics.

## Table of Contents

### Project Overview
- [Architecture & Tech Stack](./project-overview/architecture.md) - System design, data flow, project structure

### Language Fundamentals

#### JavaScript
- [Core Concepts](./language-fundamentals/javascript/core-concepts.md) - Variables, types, functions, closures, prototypes, destructuring
- [Async Patterns](./language-fundamentals/javascript/async-patterns.md) - Promises, async/await, event loop, error handling
- [Modules & Scope](./language-fundamentals/javascript/modules-and-scope.md) - ES modules, CommonJS, scope chain, hoisting

#### TypeScript
- [Core Concepts](./language-fundamentals/typescript/core-concepts.md) - Type system, interfaces, generics, enums, utility types
- [Patterns in This Project](./language-fundamentals/typescript/patterns-in-project.md) - How TypeScript is used throughout HankoSign

### Frontend
- [Next.js App Router](./frontend/nextjs-app-router.md) - Routing, layouts, server/client components, middleware
- [React Components](./frontend/react-components.md) - Component patterns, hooks, state management
- [Styling: Tailwind CSS & DaisyUI](./frontend/styling-tailwind-daisyui.md) - Utility classes, custom theme, component library
- [Forms & Validation](./frontend/forms-and-validation.md) - React Hook Form, Zod schemas, error handling
- [Internationalization](./frontend/internationalization.md) - next-intl setup, Japanese/English translations
- [Canvas & Fabric.js](./frontend/canvas-fabricjs.md) - Hanko designer, canvas rendering, image export

### Backend
- [API Routes](./backend/api-routes.md) - REST API design, request handling, response patterns
- [Middleware & Routing](./backend/middleware-and-routing.md) - Auth middleware, locale routing, request pipeline
- [Email Service](./backend/email-service.md) - Nodemailer setup, HTML templates, notification system

### Database
- [Prisma ORM](./database/prisma-orm.md) - Client setup, queries, migrations, seeding
- [Schema & Models](./database/schema-and-models.md) - Data models, relations, enums, indexes
- [Redis Caching](./database/redis-caching.md) - Cache client, patterns, key management

### Authentication & Authorization
- [NextAuth.js & RBAC](./authentication/nextauth-rbac.md) - JWT sessions, credentials provider, role-based access

### Storage
- [AWS S3 Integration](./storage/aws-s3.md) - File upload/download, presigned URLs, MinIO dev setup

### Infrastructure
- [Docker & Deployment](./infrastructure/docker-and-deployment.md) - Docker Compose, environment config, deployment options

### Developer Tooling
- [Development Workflow](./tooling/dev-workflow.md) - Scripts, linting, debugging, local setup

### Security
- [Security Measures](./security/security-measures.md) - Headers, input validation, RBAC, data protection

## Project at a Glance

**What:** Digital hanko (seal/stamp) platform that digitizes Japan's traditional seal culture for document signing and approval workflows (稟議).

**Key Features:**
- Custom hanko creation with canvas designer
- Document upload and management
- Digital signature application with positioning
- Multi-step approval workflows (稟議)
- Public document verification
- Role-based access control (USER / ADMIN / SUPER_ADMIN)
- Full Japanese/English internationalization

**Architecture:** Full-stack Next.js monolith with API routes, PostgreSQL database, S3 file storage, Redis caching, and SMTP email notifications.
