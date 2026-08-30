# FITCORE - Gym Management SaaS

A professional, production-ready, multi-tenant Gym Management SaaS platform built with Next.js 14, Prisma, PostgreSQL, and Tailwind CSS.

## 🚀 Features

### Multi-Tenancy
- Complete data isolation between gyms
- Each gym has its own branding, settings, and data
- Super Admin manages all gyms from a central dashboard

### Super Admin Dashboard
- Platform analytics (MRR, gyms, members, revenue)
- Gym management (create, suspend, activate, delete)
- Subscription management
- System health monitoring

### Gym Admin Dashboard
- **Members**: Full CRUD, profiles, QR codes, attendance history
- **Memberships**: Plans, renewals, freezes, expirations
- **Attendance**: Check-in/out, QR scanning, real-time stats
- **Payments**: Recording, receipts, invoices, refunds
- **Classes**: Scheduling, bookings, waitlists
- **Trainers**: Profiles, assignments, schedules
- **Staff**: Role-based access control (RBAC)
- **Leads**: CRM with pipeline tracking
- **Expenses**: Categories, recurring, reports
- **Equipment**: Inventory, maintenance tracking
- **Workout Plans**: Exercise library, custom plans
- **Analytics**: Revenue, attendance, retention charts
- **Reports**: Exportable CSV/PDF reports
- **Branding**: Custom colors, logo, public page

### Member Portal
- View membership status, attendance, payments
- Book classes, view workout plans
- Branded with gym's colors

### Public Gym Pages
- SEO-optimized landing pages per gym
- Class schedules, trainer profiles
- Membership plans, contact info
- Custom branding per gym

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials + JWT)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast)
- **Deployment**: Wasmer Pro / Docker

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Local Development

1. **Clone and install dependencies**
```bash
cd gymsaas
pnpm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

3. **Set up database**
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate

# Seed with demo data
pnpm db:seed
```

4. **Start development server**
```bash
pnpm dev
```

Visit `http://localhost:3000`

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@fitcore.com | superadmin123 |
| Gym Owner (Iron House) | owner@ironhousefitness.com | owner123 |
| Gym Owner (Zen Yoga) | owner@zenyogastudio.com | owner123 |
| Staff | manager@ironhousefitness.com | staff123 |

## 🏗 Project Structure

```
gymsaas/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeding
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Super Admin pages
│   │   ├── app/           # Gym Admin pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   └── gym/           # Public gym pages
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── permissions.ts # RBAC permissions
│   │   ├── tenant.ts      # Multi-tenancy utilities
│   │   ├── theme.ts       # Theming system
│   │   ├── audit.ts       # Audit logging
│   │   └── notifications.ts
│   └── middleware.ts      # Route protection
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🔐 Security

- **Multi-tenancy**: All queries scoped by `gymId`
- **RBAC**: Role-based permissions (Super Admin, Owner, Admin, Manager, Receptionist, Trainer, Accountant, Member)
- **Authentication**: Secure password hashing (bcrypt), JWT sessions, rate limiting
- **Audit Logs**: All critical actions logged
- **Headers**: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Validation**: Zod schemas on all inputs

## 🎨 Theming System

Each gym can customize:
- Primary, secondary, accent colors
- Background, surface, text colors
- Sidebar, button colors
- Font family
- Logo, favicon
- Login page background

Themes are applied via CSS variables at runtime.

## 📊 Subscription Plans

| Plan | Monthly | Features |
|------|---------|----------|
| Starter | $29 | 500 members, 5 staff, basic branding |
| Professional | $79 | Unlimited members, 20 staff, classes, analytics |
| Business | $149 | Unlimited everything, API access, multi-branch |
| Enterprise | $299 | Custom, dedicated support, integrations |

## 🚢 Deployment

### Wasmer Pro

1. **Build the application**
```bash
pnpm build
```

2. **Create Wasmer configuration** (`wasmer.toml`)
```toml
[package]
name = "gymsaas"
version = "1.0.0"
description = "Gym Management SaaS"

[commands]
start = "pnpm start"

[environment]
DATABASE_URL = "${{ secrets.DATABASE_URL }}"
AUTH_SECRET = "${{ secrets.AUTH_SECRET }}"
NEXTAUTH_SECRET = "${{ secrets.NEXTAUTH_SECRET }}"
NEXTAUTH_URL = "${{ secrets.NEXTAUTH_URL }}"
```

3. **Deploy**
```bash
wasmer deploy
```

### Docker

```bash
# Build
docker build -t gymsaas .

# Run with docker-compose
docker-compose up -d
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://user:pass@host:5432/gymsaas"
AUTH_SECRET="your-32-char-secret"
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="https://your-domain.com"
PLATFORM_NAME="FITCORE"
PLATFORM_PRIMARY_COLOR="#111827"
PLATFORM_ACCENT_COLOR="#22C55E"
PLATFORM_SUPPORT_EMAIL="support@yourdomain.com"
```

## 🔧 Database Migrations

```bash
# Create new migration
pnpm db:migrate

# Apply migrations in production
pnpm prisma migrate deploy
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Gym Admin (requires gym context)
- `GET/POST /api/app/members` - Members list/create
- `GET/PATCH/DELETE /api/app/members/[id]` - Member details
- `POST /api/app/attendance/checkin` - Check-in member
- `POST /api/app/attendance/checkout` - Check-out member
- `GET/POST /api/app/payments` - Payments
- `GET/POST /api/app/classes` - Classes
- `GET/POST /api/app/memberships` - Memberships

### Super Admin
- `GET/POST /api/admin/gyms` - Gym management
- `POST /api/admin/gyms/[id]/suspend` - Suspend gym
- `POST /api/admin/gyms/[id]/activate` - Activate gym
- `DELETE /api/admin/gyms/[id]` - Delete gym

### Public
- `GET /api/public/gyms/[slug]` - Public gym page data
- `GET /api/health` - Health check

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Type checking
pnpm tsc --noEmit
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

- Email: support@fitcore.com
- Documentation: https://docs.fitcore.com
- Issues: GitHub Issues

---

**Built with ❤️ for gym owners everywhere**