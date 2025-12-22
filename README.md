# Monorepo

A fullstack monorepo with **pnpm workspace**, **Next.js 15**, **NestJS**, **Drizzle ORM** and complete authentication.

## Structure

```
monorepo/
├── apps/
│   ├── web/                    # Next.js 15 (frontend) - port 3000
│   │   ├── src/
│   │   │   ├── app/            # App Router
│   │   │   │   ├── (auth)/     # Auth route group (login, register, etc.)
│   │   │   │   └── page.tsx    # Home page
│   │   │   ├── components/     # React components
│   │   │   │   └── ui/         # shadcn/ui components
│   │   │   ├── lib/            # Utilities (auth, utils)
│   │   │   └── middleware.ts   # Route protection
│   │   └── components.json     # shadcn/ui config
│   │
│   └── api/                    # NestJS (backend) - port 3001
│       └── src/
│           ├── auth/           # Authentication module
│           │   ├── decorators/ # @CurrentUser, @Public, @Roles
│           │   ├── guards/     # JwtAuthGuard, RolesGuard
│           │   ├── strategies/ # JWT, Local (Passport)
│           │   └── dto/        # Data Transfer Objects
│           └── users/          # Users module
│
├── packages/
│   ├── shared/                 # Shared code (utilities)
│   └── db/                     # Database (Drizzle ORM)
│       ├── src/
│       │   ├── schema.ts       # Table schema
│       │   ├── client.ts       # Drizzle client
│       │   └── index.ts        # Exports
│       └── drizzle.config.ts   # Migrations config
│
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| **Backend** | NestJS 10, Passport.js |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | JWT, bcrypt, httpOnly cookie |
| **Monorepo** | pnpm workspaces, tsup |

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (or Docker)

### 1. Clone and install

```bash
git clone <repo-url>
cd monorepo
pnpm install
```

### 2. Configure the database

**With Docker:**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres
docker exec -it postgres psql -U postgres -c "CREATE DATABASE monorepo;"
```

### 3. Configure environment variables

Create the file `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/monorepo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

### 4. Run migrations

```bash
cd packages/db
pnpm db:push
```

### 5. Start the project

```bash
pnpm dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## Commands

### Root

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in dev mode |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm clean` | Clean build and node_modules |

### Database (`packages/db`)

| Command | Description |
|---------|-------------|
| `pnpm db:push` | Apply schema to database |
| `pnpm db:generate` | Generate migration file |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio (GUI) |

### Adding dependencies

```bash
# To a specific package
pnpm --filter @monorepo/web add <package>
pnpm --filter @monorepo/api add <package>

# To root (devDependencies)
pnpm add -D <package> -w
```

### Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add button --cwd apps/web
```

---

## Authentication

### Flow

```
┌─────────────────┐     POST /auth/login      ┌─────────────────┐
│   Next.js       │ ──────────────────────▶   │   NestJS API    │
│   (frontend)    │                           │   (backend)     │
│                 │   ◀──────────────────     │                 │
│   Cookie        │   Set-Cookie: token       │   JWT + bcrypt  │
│   httpOnly      │   (httpOnly, secure)      │   + Passport    │
└─────────────────┘                           └─────────────────┘
```

### Auth Endpoints

| Method | Endpoint | Description | Authenticated |
|--------|----------|-------------|:-------------:|
| POST | `/api/auth/register` | Registration | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Current user | Yes |
| POST | `/api/auth/verify-email` | Verify email | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |

### Features

- **Registration** with automatic auto-login
- **Login** with email/password
- **Remember Me** (7-day refresh token)
- **Password hashing** with bcrypt (10 rounds)
- **JWT** in httpOnly cookie (secure)
- **Roles** (user/admin)
- **Password reset** with token
- **Route protection** with Next.js middleware
- **Email verification** (ready, currently disabled)

### Database Schema

```typescript
// packages/db/src/schema.ts

// Users table - Authentication data only
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("user").notNull(), // 'user' | 'admin'
  
  // Email verification
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  
  // Password reset
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  
  // Remember me
  refreshToken: text("refresh_token"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User profiles table - Personal data (separated for privacy)
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  
  name: text("name").notNull(),
  birthDate: date("birth_date"),
  address: text("address"),
  fiscalCode: text("fiscal_code"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Protecting NestJS Routes

```typescript
// Protected route (default - all routes are protected)
@Get('protected')
getProtected() {
  return { message: 'Authenticated users only' };
}

// Public route
@Public()
@Get('public')
getPublic() {
  return { message: 'Accessible to everyone' };
}

// Admin only
@Roles('admin')
@Get('admin-only')
getAdminOnly() {
  return { message: 'Admin only' };
}

// Get current user
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Protecting Next.js Routes

Routes are protected by middleware (`apps/web/src/middleware.ts`):

```typescript
// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Routes that redirect to home if already authenticated
const authRoutes = ["/login", "/register", "/forgot-password"];
```

### Server Actions and Authentication

Next.js Server Actions run on the server, so browser cookies are not automatically sent to the API.

To authenticate API calls from Server Actions, cookies are passed manually:

```typescript
// apps/web/src/app/actions.ts
import { cookies } from "next/headers";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (accessToken) {
    return { Cookie: `access_token=${accessToken}` };
  }
  return {};
}

// Usage in API calls
const authHeaders = await getAuthHeaders();
const res = await fetch(`${API_URL}/api/users`, {
  headers: authHeaders,
});
```

This approach is **secure** because:
- The token travels only server-to-server (Next.js -> NestJS)
- It's never exposed to browser JavaScript code
- The original cookie is `httpOnly`

### Enabling Email Verification

Email verification is ready but disabled. To enable it:

1. Configure an email provider in `apps/api/src/auth/email.service.ts`
2. The check in `apps/api/src/auth/auth.service.ts` is already active:

```typescript
// async login(...)
if (!user.emailVerified) {
  throw new UnauthorizedException("Email not verified...");
}
```

---

## Packages

### `@monorepo/web`

Next.js 15 app with:
- App Router
- React 19
- Tailwind CSS 4
- shadcn/ui (New York style)
- Server Components and Server Actions

### `@monorepo/api`

NestJS 10 API with:
- JWT + Passport authentication
- Configured CORS
- Cookie parser
- Validation with decorators

### `@monorepo/db`

Database layer with:
- Drizzle ORM
- PostgreSQL
- TypeScript schema
- Inferred and exported types

### `@monorepo/shared`

Shared utilities:
- Helper functions
- Common TypeScript types

---

## Configuration

### Environment Variables

**`apps/api/.env`**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Frontend URL (for emails)
FRONTEND_URL=http://localhost:3000
```

### CORS

The backend is configured to accept requests from `http://localhost:3000` with credentials (cookies).

To modify, see `apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: "http://localhost:3000",
  credentials: true,
});
```

---

## Email

Emails (account verification, password reset) are currently **only logged to the console**.

For production, integrate an email provider in `apps/api/src/auth/email.service.ts`:

```typescript
// Example with Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Verify your email',
  html: `<a href="${verificationUrl}">Click here</a>`,
});
```

---

## Testing

### API Testing with curl

```bash
# Health check
curl http://localhost:3001/api/health

# Registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","password":"password123"}'

# Current user (with cookie)
curl http://localhost:3001/api/auth/me -b cookies.txt

# List users (requires auth)
curl http://localhost:3001/api/users -b cookies.txt
```

---

## Deployment

### Build

```bash
pnpm build
```

### Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<secure-key-32+-characters>
FRONTEND_URL=https://yourdomain.com
```

### Pre-deploy Checklist

- [ ] Change `JWT_SECRET` to a secure key
- [ ] Configure a real email provider
- [ ] Update CORS with production domain
- [ ] Enable `secure: true` in cookies (already configured for production)
- [ ] Configure HTTPS

---

## Notes

### Tokens and Sessions
- Access token lasts **15 minutes**
- Refresh token lasts **7 days** (enabled with "Remember Me")
- Tokens are stored in `httpOnly` cookies (not accessible by JavaScript)
- Cookies use `sameSite: 'lax'` for CSRF protection

### Security
- Passwords are hashed with **bcrypt** (10 rounds)
- Email verification expires after 24 hours
- Password reset expires after 1 hour
- In production, cookies are `secure` (HTTPS only)

### Registration Flow
1. User fills the registration form
2. Account is created in the database
3. A JWT is generated and saved as a cookie
4. User is redirected to home (already logged in)

### Current Status
- Authentication fully functional
- Email verification disabled (emails are only logged)
- For production: integrate an email provider (Resend, SendGrid, etc.)
