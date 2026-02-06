# Changelog

All notable changes to HankoSign Digital will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation reorganization with structured docs/ folder
- Comprehensive API documentation
- Japanese business terms glossary
- Architecture overview documentation

### Changed
- Moved documentation files to organized structure
- Updated README with documentation links

## [0.1.0] - 2025-02-06

### Added
- Initial project setup with Next.js 16, TypeScript, and Tailwind CSS
- User authentication system with NextAuth.js
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Digital hanko (seal) creation and management
- Document upload and management system
- Electronic signature application
- Document verification portal
- Multi-language support (Japanese/English) with next-intl
- Dashboard interface for users
- Admin panel for role management
- Profile and company settings management
- Security features:
  - bcrypt password hashing
  - Session management
  - Audit logging
  - Ownership verification
- Database schema with Prisma ORM
  - Users, Hankos, Documents, Signatures
  - Workflow and Approval entities
  - AuditLog tracking
- Redis caching integration
- AWS S3 file storage integration
- Email notification system with Nodemailer
- QR code generation for verification
- PDF document rendering
- Fabric.js-based hanko designer

### Technical Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, DaisyUI
- **Backend:** Node.js, NextAuth.js, Prisma ORM
- **Database:** PostgreSQL
- **Cache:** Redis
- **Storage:** AWS S3
- **Email:** Nodemailer
- **UI Libraries:** Lucide React, Chart.js, React-PDF, Fabric.js

### Security & Compliance
- Role-based access control (RBAC)
- Multi-layer protection (proxy, API, UI)
- Electronic Signature Act compliance preparation
- Personal Information Protection Act considerations

---

[Unreleased]: https://github.com/yourusername/hankosign-digital/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/hankosign-digital/releases/tag/v0.1.0
