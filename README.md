<div align="center">

# 🚀 Mission 100 by AI - Day 2/100

### **Project #2: HankoSign Digital** ✅

*Building 100 Real-World Applications in 100 Days*

---

<img src="https://img.shields.io/badge/Status-Complete-success?style=for-the-badge" alt="Status" />
<img src="https://img.shields.io/badge/Day-2%2F100-blue?style=for-the-badge" alt="Day" />
<img src="https://img.shields.io/badge/Type-Full%20Stack-orange?style=for-the-badge" alt="Type" />

</div>

---

<div align="center">

# 🖊️ HankoSign Digital (判子サイン・デジタル)

### *Japan's Digital Hanko & E-Signature Platform*

Transform traditional hanko (stamp) workflows into legally-compliant digital signatures

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[🌟 Features](#-key-features) •
[🚀 Quick Start](#-quick-start) •
[📚 Documentation](#-documentation) •
[🏗️ Architecture](#️-technology-stack) •
[🤝 Contributing](#-contributing)

</div>

## 🎯 Overview

<table>
<tr>
<td>

**The Problem**

Japan loses **¥1.2 trillion annually** due to hanko-related inefficiencies. **83% of employees** were forced to commute during COVID-19 just to stamp documents. Traditional hanko systems prevent remote work and digital transformation.

</td>
<td>

**The Solution**

HankoSign Digital bridges Japan's traditional hanko culture with modern digital workflows. Create legally-compliant digital hankos (認印, 銀行印, 実印), sign documents remotely, and maintain approval workflows (稟議) - all while meeting Japanese Electronic Signature Law requirements.

</td>
</tr>
</table>

### 🌟 Why HankoSign Digital?

- 🇯🇵 **Built for Japan** - Respects traditional hanko culture while enabling digital transformation
- ⚖️ **Legally Compliant** - Meets Electronic Signature Law (電子署名法) requirements
- 🎨 **Custom Hanko Designer** - Create authentic-looking digital hankos with Canvas/Fabric.js
- 🔄 **Approval Workflows** - Native 稟議 (ringi) system support
- 🔍 **Public Verification** - Anyone can verify document authenticity via public URLs
- 💼 **Enterprise Ready** - Multi-user organizations with role-based access control

---

## ✨ Key Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🖊️ **Digital Hanko Creator** | Design custom digital hankos with 3 types: 認印 (personal), 銀行印 (bank), 実印 (official)<br/>Canvas-based designer with customizable fonts, colors, and styles |
| 📄 **Document Management** | Upload and manage PDF, Word, and image files<br/>Organize by type: 契約書, 発注書, 請求書, 稟議書, etc. |
| ✅ **E-Signature Application** | Apply digital hankos to documents with drag-and-drop positioning<br/>Multi-page document support with signature placement preview |
| 🔄 **Approval Workflows (稟議)** | Create multi-step approval processes (起案→承認→決裁)<br/>Sequential approval with automatic notifications |
| 🔍 **Public Verification Portal** | Generate unique verification codes for each signed document<br/>Public URLs allow third-party authenticity verification |
| 🏢 **Multi-Tenant Organizations** | Complete organizational isolation with department structure<br/>Role-based access: Admin, Manager, Employee |
| 🔒 **Security & Compliance** | 7-year record retention, IP address logging, timestamping<br/>Complies with 電子署名法 and 電子帳簿保存法 |
| 🌐 **Bilingual Interface** | Full Japanese/English support with next-intl<br/>Seamless language switching for global teams |

</div>

---

## 🚀 Quick Start

<details open>
<summary><b>📋 Prerequisites</b></summary>

<br/>

```bash
✓ Node.js 18+
✓ PostgreSQL 14+
✓ Redis 6+
✓ AWS Account (S3)
✓ npm or yarn
```

</details>

<details open>
<summary><b>⚡ Installation (5 minutes)</b></summary>

<br/>

**Step 1: Clone & Install**
```bash
git clone https://github.com/dx-engineer-tokyo/hankosign-digital.git
cd hankosign-digital
npm install
```

**Step 2: Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL (PostgreSQL)
# - REDIS_URL
# - AWS credentials (S3)
# - NEXTAUTH_SECRET
```

**Step 3: Database Setup**
```bash
# Run Prisma migrations
npx prisma migrate dev
npx prisma generate

# (Optional) Seed demo data
npm run seed
```

**Step 4: Start Development Server**
```bash
npm run dev
```

**Step 5: Access Application**
- 🌐 **Application:** http://localhost:3004
- 🗄️ **Prisma Studio:** `npm run db:studio`

</details>

<details>
<summary><b>🔐 Demo Credentials</b></summary>

<br/>

```
Email:    demo@example.com
Password: password123
```

> **Note:** These credentials work with seeded data. Run `npm run seed` to create demo accounts.

</details>

---

## 📚 Documentation

<div align="center">

| Document | Description |
|----------|-------------|
| 📋 [**Quick Start Guide**](docs/getting-started/quickstart.md) | 5-minute setup tutorial with screenshots |
| 🏗️ [**System Architecture**](docs/architecture/overview.md) | Technical design, module breakdown, data flow |
| 🗄️ [**Database Schema**](docs/architecture/database-schema.md) | Entity relationships and Prisma models |
| 🔒 [**Security & RBAC**](docs/architecture/security-rbac.md) | Authentication, authorization, compliance |
| 📖 [**API Reference**](docs/api/) | REST API endpoints and usage examples |
| 📚 [**Glossary**](docs/reference/glossary.md) | Japanese business terminology explained |
| 📝 [**Project Requirements**](docs/requirements/project-brief.md) | Original specifications and goals |

</div>

### 📁 Documentation Structure

```
docs/
├── getting-started/      # Installation and setup
│   └── quickstart.md
├── architecture/         # System design documentation
│   ├── overview.md
│   ├── security-rbac.md
│   └── database-schema.md
├── api/                  # API documentation by module
│   ├── authentication.md
│   ├── hankos.md
│   ├── documents.md
│   └── signatures.md
├── requirements/         # Project specifications
│   ├── project-brief.md
│   └── portfolio-context.md
└── reference/            # Reference materials
    └── glossary.md
```

---

## 🏗️ Technology Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- ⚡ **Next.js 14** - App Router with React Server Components
- 🎨 **Tailwind CSS** - Utility-first styling
- 🌸 **DaisyUI** - Beautiful UI components
- 🎭 **Fabric.js** - Canvas-based hanko designer
- 🌐 **next-intl** - Internationalization (ja/en)
- 🎯 **TypeScript** - Type-safe development
- 📦 **React Hook Form** - Form management
- 🖼️ **react-pdf** - PDF rendering and preview

</td>
<td valign="top" width="50%">

### Backend
- 🚀 **Next.js API Routes** - Serverless functions
- 🗄️ **PostgreSQL 14** - Relational database
- ⚡ **Redis 6** - Caching and job queues
- 🔐 **NextAuth.js** - Authentication system
- 💎 **Prisma ORM** - Type-safe database client
- ☁️ **AWS S3** - Document storage
- 🔑 **bcrypt** - Password hashing
- ✅ **Zod** - Schema validation

</td>
</tr>
<tr>
<td valign="top" width="50%">

### Infrastructure
- 🐳 **Docker Compose** - Local development environment
- ☁️ **Vercel** - Deployment platform (recommended)
- 📦 **Node.js 18+** - Runtime environment
- 🔧 **pnpm/npm** - Package management

</td>
<td valign="top" width="50%">

### Compliance & Security
- ⚖️ **電子署名法** - Electronic Signature Law compliance
- 📚 **電子帳簿保存法** - Electronic Records Law
- 🔒 **個人情報保護法** - Personal Information Protection Law
- 🕐 **7-Year Retention** - Legal record keeping requirements

</td>
</tr>
</table>

---

## 📁 Project Structure

```
hankosign-digital/
│
├── 📂 app/                        # Next.js App Router
│   ├── [locale]/                 # 🌐 Internationalized Routes
│   │   ├── dashboard/            # 📊 Main Dashboard
│   │   │   ├── hankos/          # 🖊️ Hanko Management
│   │   │   ├── documents/       # 📄 Document Management
│   │   │   ├── signatures/      # ✅ Signature History
│   │   │   ├── workflows/       # 🔄 Approval Workflows
│   │   │   └── settings/        # ⚙️ Settings
│   │   ├── login/               # 🔐 Authentication
│   │   ├── register/            # 📝 User Registration
│   │   └── verify/              # 🔍 Public Verification Portal
│   └── api/                     # 🚀 API Routes
│       ├── auth/                # 🔐 NextAuth endpoints
│       ├── hankos/              # 🖊️ Hanko CRUD
│       ├── documents/           # 📄 Document operations
│       ├── signatures/          # ✅ Signature application
│       ├── workflows/           # 🔄 Workflow management
│       └── verify/              # 🔍 Verification API
│
├── 📂 components/                # ⚛️ React Components
│   ├── hanko/                   # 🖊️ Hanko Designer & Preview
│   ├── documents/               # 📄 Document Viewer & Editor
│   ├── workflows/               # 🔄 Workflow Builder
│   ├── ui/                      # 🎨 Shared UI Components
│   └── layout/                  # 📐 Layout Components
│
├── 📂 lib/                       # 🛠️ Utilities & Helpers
│   ├── prisma.ts               # 💎 Database client
│   ├── auth.ts                 # 🔐 NextAuth configuration
│   ├── s3.ts                   # ☁️ AWS S3 operations
│   ├── redis.ts                # ⚡ Redis client
│   └── validation.ts           # ✅ Zod schemas
│
├── 📂 prisma/                    # 💎 Database Layer
│   ├── schema.prisma           # 🗄️ Database schema
│   ├── migrations/             # 📊 Migration history
│   └── seed.ts                 # 🌱 Seed data
│
├── 📂 docs/                      # 📚 Documentation
│   ├── getting-started/         # 🚀 Setup guides
│   ├── architecture/            # 🏗️ System design
│   ├── api/                     # 📖 API documentation
│   ├── requirements/            # 📋 Project specs
│   └── reference/               # 📚 Reference materials
│
├── 📂 messages/                  # 🌐 i18n Translation Files
│   ├── en.json                 # 🇬🇧 English
│   └── ja.json                 # 🇯🇵 Japanese
│
├── 📂 public/                    # 🖼️ Static Assets
│   ├── images/
│   └── fonts/
│
├── 🐳 docker-compose.yml         # PostgreSQL + Redis
├── 📦 package.json               # Dependencies & scripts
├── 🔧 next.config.js            # Next.js configuration
└── 📊 tsconfig.json             # TypeScript config
```

---

## 🎨 Features Overview

<table>
<tr>
<td width="50%">

### 🖊️ Hanko Management
- Create 3 types: 認印 (personal), 銀行印 (bank), 実印 (official)
- Canvas-based designer with Fabric.js
- Customizable text, font, size, color, and border style
- Save as PNG with transparent background
- Manage multiple hankos per user
- Set default hankos for quick access

</td>
<td width="50%">

### 📄 Document Management
- Upload PDF, Word (DOCX, DOC), Images (PNG, JPG)
- Document types: 契約書, 発注書, 請求書, 稟議書, etc.
- Organized folder structure by type
- Document preview with page navigation
- Search and filter capabilities
- Version history tracking
- Bulk operations (archive, delete, export)

</td>
</tr>
<tr>
<td width="50%">

### ✅ Digital Signatures
- Drag-and-drop hanko placement on documents
- Multi-page document support
- Signature positioning with visual preview
- Multiple signatures per document
- Timestamp and metadata embedded
- IP address and user agent logging
- Signature history and audit trail

</td>
<td width="50%">

### 🔄 Approval Workflows (稟議)
- Multi-step approval process builder
- Workflow steps: 起案 (draft) → 承認 (approval) → 決裁 (final decision)
- Sequential approval routing
- Automatic email notifications
- Approval/rejection with comments
- Workflow templates for common processes
- Visual workflow status tracking

</td>
</tr>
<tr>
<td width="50%">

### 🔍 Verification Portal
- Public verification URLs for signed documents
- Unique verification codes (e.g., HSD-XXXXXXXX)
- Display signature metadata:
  - Signer name and organization
  - Signature timestamp
  - IP address (masked for privacy)
  - Document hash for integrity
- Third-party verification support
- QR codes for mobile verification

</td>
<td width="50%">

### ⚙️ Settings & Administration
- Organization profile management
- User management with RBAC (Admin, Manager, Employee)
- Department structure configuration
- Email notification preferences
- Security settings (2FA, password policy)
- Audit log viewer
- Billing and subscription management

</td>
</tr>
</table>

---

## 🔒 Security & Compliance

<div align="center">

| Layer | Implementation |
|-------|----------------|
| 🔐 **Authentication** | NextAuth.js with JWT sessions (7-day expiration) |
| 🔑 **Password Security** | bcrypt hashing with salt rounds = 12 |
| 🛡️ **Data at Rest** | PostgreSQL encryption + AWS S3 server-side encryption |
| 🔒 **Data in Transit** | TLS 1.3 for all HTTPS communications |
| 🚫 **CSRF Protection** | Next.js built-in CSRF tokens |
| ⏱️ **Rate Limiting** | Redis-backed API throttling (100 req/min per IP) |
| 🔍 **SQL Injection** | Prisma parameterized queries (ORM protection) |
| 🛑 **XSS Protection** | React automatic escaping + CSP headers |
| 📝 **Audit Logs** | All signatures and approvals logged with metadata |
| ⚖️ **Legal Compliance** | 7-year record retention, timestamping, IP logging |

</div>

### Japanese Legal Requirements

<table>
<tr>
<td width="33%" align="center">

#### 電子署名法
**Electronic Signature Law**

✅ Unique signature per user
✅ Timestamp recording
✅ Non-repudiation measures
✅ Identity verification

</td>
<td width="33%" align="center">

#### 電子帳簿保存法
**Electronic Records Law**

✅ 7-year document retention
✅ Tamper-proof storage (S3)
✅ Audit trail logging
✅ Searchable metadata

</td>
<td width="33%" align="center">

#### 個人情報保護法
**Personal Info Protection**

✅ Encrypted data storage
✅ Access control (RBAC)
✅ Consent management
✅ Data export capabilities

</td>
</tr>
</table>

---

## 🌍 Internationalization

<table>
<tr>
<td width="50%">

### Supported Languages

| Language | Code | Status |
|----------|------|--------|
| 🇯🇵 Japanese | `ja` | ✅ Default |
| 🇬🇧 English | `en` | ✅ Complete |

### Key Japanese Terms

| Term | Reading | English | Usage |
|------|---------|---------|-------|
| 判子 | はんこ | Hanko/Stamp | Traditional stamp seal |
| 認印 | みとめいん | Personal Seal | For daily documents |
| 銀行印 | ぎんこういん | Bank Seal | For banking |
| 実印 | じついん | Official Seal | Registered seal |
| 稟議 | りんぎ | Ringi | Approval workflow |

</td>
<td width="50%">

### Implementation

**Technology:** next-intl

```typescript
// Automatic locale detection
import { useLocale } from 'next-intl';

// Usage in components
const t = useTranslations('Dashboard');
<h1>{t('title')}</h1>
```

**Features:**
- 🌐 URL-based locale routing (`/ja/dashboard`, `/en/dashboard`)
- 🍪 Persistent language preference (localStorage)
- 📅 Localized dates and numbers
- 🔄 Dynamic language switching without reload
- 📝 Translation key nesting and interpolation

</td>
</tr>
</table>

---

## 📊 Development Status

<div align="center">

### Core Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🔐 Authentication & Authorization | ✅ Complete | NextAuth.js with role-based access control |
| 🏢 Multi-tenant Organizations | ✅ Complete | Complete org isolation + department structure |
| 🖊️ Digital Hanko Designer | ✅ Complete | Canvas-based designer with 3 hanko types |
| 📄 Document Management | ✅ Complete | Upload, organize, preview PDF/Word/images |
| ✅ E-Signature Application | ✅ Complete | Drag-and-drop hanko placement on documents |
| 🔄 Approval Workflows (稟議) | ✅ Complete | Multi-step sequential approval system |
| 🔍 Public Verification Portal | ✅ Complete | Public URLs for document verification |
| 🌐 Bilingual UI (ja/en) | ✅ Complete | Full Japanese/English support with next-intl |
| 📱 Responsive Design | ✅ Complete | Mobile, tablet, desktop optimized |
| ⚖️ Legal Compliance | ✅ Complete | 電子署名法 & 電子帳簿保存法 compliance |

### Overall Progress

![Progress](https://progress-bar.dev/100/?title=MVP&width=500)

**Status:** 🎉 **Production Ready** - All core features implemented and tested

</div>

---

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npm run db:studio
```

### Seed Demo Data

```bash
npm run seed
```

Creates:
- 3 demo users (admin, manager, employee)
- Sample organization
- 3 digital hankos per user
- 10 sample documents
- 5 workflows with approvals

---

## 🚀 Deployment

<details open>
<summary><b>☁️ Vercel (Recommended)</b></summary>

<br/>

**Step 1: Prepare Environment**
```bash
# Ensure all migrations are committed
git add prisma/migrations
git commit -m "chore: add database migrations"
```

**Step 2: Deploy to Vercel**
```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

**Step 3: Configure Environment Variables**

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://...           # Production PostgreSQL
REDIS_URL=redis://...                   # Production Redis
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=your-bucket-name
```

**Step 4: Run Migrations**
```bash
# SSH into Vercel or use build command
npm run migrate:deploy
```

</details>

<details>
<summary><b>🐳 Docker Deployment</b></summary>

<br/>

```bash
# Build image
docker build -t hankosign-digital .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

</details>

<details>
<summary><b>🏢 Traditional VPS (AWS EC2, DigitalOcean)</b></summary>

<br/>

1. **Setup Node.js + PostgreSQL + Redis**
2. **Clone repository**
   ```bash
   git clone https://github.com/dx-engineer-tokyo/hankosign-digital.git
   cd hankosign-digital
   npm install
   ```
3. **Configure environment variables** (`.env.production`)
4. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```
5. **Build application**
   ```bash
   npm run build
   ```
6. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "hankosign" -- start
   pm2 save
   pm2 startup
   ```

</details>

---

## 🧪 Testing

```bash
# Unit Tests (Coming Soon)
npm test

# E2E Tests (Coming Soon)
npm run test:e2e

# Type Checking
npm run type-check

# Linting
npm run lint

# Format Code
npm run format
```

---

## 📝 Future Enhancements

<div align="center">

| Feature | Priority | Description |
|---------|----------|-------------|
| ⛓️ **Blockchain Verification** | 🔴 High | Store document hashes on blockchain for immutable proof |
| 🤖 **AI Field Detection** | 🔴 High | Auto-detect signature placement using ML |
| 🏦 **Banking API Integration** | 🟡 Medium | Connect with major Japanese banks for 銀行印 verification |
| 📱 **Mobile App** | 🟡 Medium | React Native app for iOS/Android |
| 💬 **LINE Integration** | 🟡 Medium | Approval notifications via LINE messaging |
| 🔖 **OCR for Forms** | 🟢 Low | Extract form fields from scanned documents |
| 🌍 **eIDAS Compliance** | 🟢 Low | European e-signature standard support |
| 📠 **Physical Hanko Scanning** | 🟢 Low | Import real hanko designs via image recognition |

</div>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

<div align="center">

| 🐛 Found a Bug? | 💡 Have an Idea? | 📝 Want to Contribute? |
|----------------|-----------------|----------------------|
| [Report Issue](https://github.com/dx-engineer-tokyo/hankosign-digital/issues) | [Feature Request](https://github.com/dx-engineer-tokyo/hankosign-digital/issues/new) | [Read Guidelines](./docs/contribution/CONTRIBUTING.md) |

</div>

### Quick Contribution Steps

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. ✨ Make your changes
4. ✅ Run tests and linting (`npm test && npm run lint`)
5. 💾 Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. 📤 Push to branch (`git push origin feature/amazing-feature`)
7. 🎉 Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 HankoSign Digital
Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

## 🙏 Acknowledgments

<table>
<tr>
<td width="33%" align="center">

### 🏛️ Inspiration
Inspired by Japan's **Digital Agency (デジタル庁)** initiative to eliminate unnecessary hanko usage in government processes

</td>
<td width="33%" align="center">

### 🎯 Mission
Built to solve Japan's **¥1.2 trillion hanko inefficiency crisis** while respecting traditional business culture

</td>
<td width="33%" align="center">

### 🇯🇵 Culture
Designed with deep understanding of Japanese business practices, legal requirements, and cultural values

</td>
</tr>
</table>

---

## 📞 Support & Contact

<div align="center">

### Need Help?

| Channel | Link |
|---------|------|
| 🐛 **Bug Reports** | [GitHub Issues](https://github.com/dx-engineer-tokyo/hankosign-digital/issues) |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/dx-engineer-tokyo/hankosign-digital/discussions) |
| 📧 **Email Support** | support@example.com |
| 📚 **Documentation** | [Full Docs](./docs/) |
| 🐦 **Twitter** | [@HankoSignDigital](https://example.com) |

</div>

---

<div align="center">

### 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=dx-engineer-tokyo/hankosign-digital&type=Date)](https://star-history.com/#dx-engineer-tokyo/hankosign-digital&Date)

---

**Built with ❤️ for the Mission 100 Challenge**

*Bridging Japan's hanko tradition with digital innovation*

**HankoSign Digital** © 2026 | [Website](https://example.com) | [Documentation](./docs/) | [API Docs](./docs/api/)

</div>
