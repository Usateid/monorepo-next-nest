# 🚀 Monorepo

Una monorepo fullstack con **pnpm workspace**, **Next.js 15**, **NestJS**, **Drizzle ORM** e autenticazione completa.

## 📁 Struttura

```
monorepo/
├── apps/
│   ├── web/                    # Next.js 15 (frontend) - porta 3000
│   │   ├── src/
│   │   │   ├── app/            # App Router
│   │   │   │   ├── (auth)/     # Route gruppo auth (login, register, etc.)
│   │   │   │   └── page.tsx    # Home page
│   │   │   ├── components/     # Componenti React
│   │   │   │   └── ui/         # Componenti shadcn/ui
│   │   │   ├── lib/            # Utilities (auth, utils)
│   │   │   └── middleware.ts   # Protezione route
│   │   └── components.json     # Config shadcn/ui
│   │
│   └── api/                    # NestJS (backend) - porta 3001
│       └── src/
│           ├── auth/           # Modulo autenticazione
│           │   ├── decorators/ # @CurrentUser, @Public, @Roles
│           │   ├── guards/     # JwtAuthGuard, RolesGuard
│           │   ├── strategies/ # JWT, Local (Passport)
│           │   └── dto/        # Data Transfer Objects
│           └── users/          # Modulo utenti
│
├── packages/
│   ├── shared/                 # Codice condiviso (utilities)
│   └── db/                     # Database (Drizzle ORM)
│       ├── src/
│       │   ├── schema.ts       # Schema tabelle
│       │   ├── client.ts       # Client Drizzle
│       │   └── index.ts        # Exports
│       └── drizzle.config.ts   # Config migrazioni
│
├── pnpm-workspace.yaml
└── package.json
```

## 🛠️ Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| **Backend** | NestJS 10, Passport.js |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | JWT, bcrypt, cookie httpOnly |
| **Monorepo** | pnpm workspaces, tsup |

---

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+
- pnpm 8+
- PostgreSQL (o Docker)

### 1. Clona e installa

```bash
git clone <repo-url>
cd monorepo
pnpm install
```

### 2. Configura il database

**Con Docker:**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres
docker exec -it postgres psql -U postgres -c "CREATE DATABASE monorepo;"
```

### 3. Configura le variabili d'ambiente

Crea il file `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/monorepo
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

### 4. Esegui le migrazioni

```bash
cd packages/db
pnpm db:push
```

### 5. Avvia il progetto

```bash
pnpm dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## 💻 Comandi

### Root

| Comando | Descrizione |
|---------|-------------|
| `pnpm dev` | Avvia tutti i servizi in dev mode |
| `pnpm build` | Build di tutti i package |
| `pnpm lint` | Linting di tutti i package |
| `pnpm clean` | Pulisce build e node_modules |

### Database (`packages/db`)

| Comando | Descrizione |
|---------|-------------|
| `pnpm db:push` | Applica lo schema al database |
| `pnpm db:generate` | Genera file migrazione |
| `pnpm db:migrate` | Esegue le migrazioni |
| `pnpm db:studio` | Apre Drizzle Studio (GUI) |

### Aggiungere dipendenze

```bash
# A un package specifico
pnpm --filter @monorepo/web add <package>
pnpm --filter @monorepo/api add <package>

# Alla root (devDependencies)
pnpm add -D <package> -w
```

### Aggiungere componenti shadcn/ui

```bash
pnpm dlx shadcn@latest add button --cwd apps/web
```

---

## 🔐 Autenticazione

### Flusso

```
┌─────────────────┐     POST /auth/login      ┌─────────────────┐
│   Next.js       │ ──────────────────────▶   │   NestJS API    │
│   (frontend)    │                           │   (backend)     │
│                 │   ◀──────────────────     │                 │
│   Cookie        │   Set-Cookie: token       │   JWT + bcrypt  │
│   httpOnly      │   (httpOnly, secure)      │   + Passport    │
└─────────────────┘                           └─────────────────┘
```

### Endpoints Auth

| Metodo | Endpoint | Descrizione | Autenticato |
|--------|----------|-------------|:-----------:|
| POST | `/api/auth/register` | Registrazione | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Utente corrente | ✅ |
| POST | `/api/auth/verify-email` | Verifica email | ❌ |
| POST | `/api/auth/forgot-password` | Richiedi reset password | ❌ |
| POST | `/api/auth/reset-password` | Reset password | ❌ |
| POST | `/api/auth/refresh` | Refresh token | ❌ |
| POST | `/api/auth/resend-verification` | Reinvia email verifica | ❌ |

### Features

- ✅ **Registrazione** con auto-login automatico
- ✅ **Login** con email/password
- ✅ **Remember Me** (refresh token 7 giorni)
- ✅ **Password hashing** con bcrypt (10 rounds)
- ✅ **JWT** in cookie httpOnly (sicuro)
- ✅ **Ruoli** (user/admin)
- ✅ **Reset password** con token
- ✅ **Protezione route** con middleware Next.js
- ⏸️ **Verifica email** (predisposta, attualmente disabilitata)

### Schema Database

```typescript
// packages/db/src/schema.ts

// Tabella users - Solo dati di autenticazione
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

// Tabella user_profiles - Dati anagrafici (separati per privacy)
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

### Proteggere Route NestJS

```typescript
// Route protetta (default - tutte le route sono protette)
@Get('protected')
getProtected() {
  return { message: 'Solo utenti autenticati' };
}

// Route pubblica
@Public()
@Get('public')
getPublic() {
  return { message: 'Accessibile a tutti' };
}

// Solo admin
@Roles('admin')
@Get('admin-only')
getAdminOnly() {
  return { message: 'Solo admin' };
}

// Ottenere l'utente corrente
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Proteggere Route Next.js

Le route sono protette dal middleware (`apps/web/src/middleware.ts`):

```typescript
// Route che richiedono autenticazione
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Route che reindirizzano alla home se già autenticati
const authRoutes = ["/login", "/register", "/forgot-password"];
```

### Server Actions e Autenticazione

Le Server Actions di Next.js vengono eseguite sul server, quindi i cookie del browser non vengono inviati automaticamente all'API.

Per autenticare le chiamate API dalle Server Actions, i cookie vengono passati manualmente:

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

// Uso nelle chiamate API
const authHeaders = await getAuthHeaders();
const res = await fetch(`${API_URL}/api/users`, {
  headers: authHeaders,
});
```

Questo approccio è **sicuro** perché:
- Il token viaggia solo server-to-server (Next.js → NestJS)
- Non viene mai esposto al codice JavaScript del browser
- Il cookie originale è `httpOnly`

### Abilitare la verifica email

La verifica email è predisposta ma disabilitata. Per attivarla:

1. Configura un provider email in `apps/api/src/auth/email.service.ts`
2. Rimuovi i commenti in `apps/api/src/auth/auth.service.ts`:

```typescript
// async login(...)
if (!user.emailVerified) {
  throw new UnauthorizedException("Email non verificata...");
}
```

---

## 📦 Packages

### `@monorepo/web`

App Next.js 15 con:
- App Router
- React 19
- Tailwind CSS 4
- shadcn/ui (New York style)
- Server Components e Server Actions

### `@monorepo/api`

API NestJS 10 con:
- Autenticazione JWT + Passport
- CORS configurato
- Cookie parser
- Validazione con decorators

### `@monorepo/db`

Database layer con:
- Drizzle ORM
- PostgreSQL
- Schema TypeScript
- Tipi inferiti ed esportati

### `@monorepo/shared`

Utilities condivise:
- Funzioni helper
- Tipi TypeScript comuni

---

## 🔧 Configurazione

### Variabili d'ambiente

**`apps/api/.env`**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Frontend URL (per email)
FRONTEND_URL=http://localhost:3000
```

### CORS

Il backend è configurato per accettare richieste da `http://localhost:3000` con credenziali (cookies).

Per modificare, vedi `apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: "http://localhost:3000",
  credentials: true,
});
```

---

## 📧 Email

Le email (verifica account, reset password) vengono attualmente **solo loggate nella console**.

Per la produzione, integra un provider email in `apps/api/src/auth/email.service.ts`:

```typescript
// Esempio con Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Verifica la tua email',
  html: `<a href="${verificationUrl}">Clicca qui</a>`,
});
```

---

## 🧪 Testing

### Test API con curl

```bash
# Health check
curl http://localhost:3001/api/health

# Registrazione
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario","email":"mario@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"mario@example.com","password":"password123"}'

# Utente corrente (con cookie)
curl http://localhost:3001/api/auth/me -b cookies.txt

# Lista utenti (richiede auth)
curl http://localhost:3001/api/users -b cookies.txt
```

---

## 🚀 Deployment

### Build

```bash
pnpm build
```

### Variabili d'ambiente produzione

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<chiave-sicura-32+-caratteri>
FRONTEND_URL=https://yourdomain.com
```

### Checklist pre-deploy

- [ ] Cambia `JWT_SECRET` con una chiave sicura
- [ ] Configura un email provider reale
- [ ] Aggiorna CORS con il dominio di produzione
- [ ] Attiva `secure: true` nei cookie (già configurato per production)
- [ ] Configura HTTPS

---

## 📝 Note

### Token e sessioni
- L'access token dura **15 minuti**
- Il refresh token dura **7 giorni** (attivabile con "Ricordami")
- I token sono salvati in cookie `httpOnly` (non accessibili da JavaScript)
- I cookie usano `sameSite: 'lax'` per protezione CSRF

### Sicurezza
- Le password sono hashate con **bcrypt** (10 rounds)
- La verifica email scade dopo 24 ore
- Il reset password scade dopo 1 ora
- In produzione i cookie sono `secure` (solo HTTPS)

### Flusso registrazione
1. L'utente compila il form di registrazione
2. Viene creato l'account nel database
3. Viene generato un JWT e salvato come cookie
4. L'utente viene reindirizzato alla home (già loggato)

### Stato attuale
- ✅ Autenticazione completa funzionante
- ⏸️ Verifica email disabilitata (le email vengono solo loggate)
- ⏸️ Per produzione: integrare un provider email (Resend, SendGrid, etc.)
