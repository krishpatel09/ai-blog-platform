# Authentication System - Folder Structure & Flow

## 📁 Complete Folder Structure
https://github.com/anilahir/nestjs-authentication-and-authorization/blob/main/.env.example
```
back-end/
└── src/
    ├── auth/                            # Authentication module
    │   ├── auth.controller.ts          # Auth endpoints (signup, login, me)
    │   ├── auth.service.ts              # Auth business logic
    │   ├── auth.module.ts               # Auth module configuration
    │   ├── bcrypt.service.ts            # Password hashing service (if needed)
    │   └── dto/                         # Data Transfer Objects
    │       ├── signup.dto.ts            # Signup request validation
    │       └── login.dto.ts             # Login request validation
    │
    ├── common/                          # Shared utilities
    │   ├── config/                      # Configuration files
    │   │   ├── app.config.ts           # App configuration
    │   │   ├── jwt.config.ts           # JWT configuration
    │   │   └── supabase.config.ts      # Supabase configuration
    │   ├── decorators/
    │   │   └── current-user.decorator.ts # @CurrentUser() decorator
    │   ├── guards/
    │   │   └── jwt.guard.ts             # JWT token verification guard
    │   └── interface/
    │       └── user.interface.ts        # User interface definitions
    │
    ├── app.module.ts                    # Root application module
    └── main.ts                          # Application entry point
```

---

## 🔄 Authentication Flow

### 1. **Application Bootstrap** (`main.ts`)

```
main.ts
  ↓
- Creates NestJS application
- Configures global ValidationPipe
- Starts server on PORT (default: 3000)
```

### 2. **Module Registration** (`app.module.ts`)

```
app.module.ts
  ↓
- Imports ConfigModule (global environment variables)
- Imports AuthModule
```

### 3. **Signup Flow**

```
POST /auth/signup
  ↓
auth.controller.ts (signup endpoint)
  ↓
auth.service.ts (signup method)
  ↓
├── Validates input via SignupDto
├── Checks if user exists (supabase.auth.admin.listUsers)
├── Creates user in Supabase Auth (supabase.auth.admin.createUser)
├── Creates user profile in Supabase Database (supabase.from('users').insert)
└── Signs in user to generate JWT tokens (supabase.auth.signInWithPassword)
  ↓
Returns: { access_token, refresh_token, user: { id, email, username } }
```

**File Flow:**
```
signup.dto.ts → auth.controller.ts → auth.service.ts → Supabase Auth API
                                                      ↓
                                              Supabase Database
```

### 4. **Login Flow**

```
POST /auth/login
  ↓
auth.controller.ts (login endpoint)
  ↓
auth.service.ts (login method)
  ↓
├── Validates input via LoginDto
└── Authenticates with Supabase (supabase.auth.signInWithPassword)
  ↓
Returns: { access_token, refresh_token, user: { id, email } }
```

**File Flow:**
```
login.dto.ts → auth.controller.ts → auth.service.ts → Supabase Auth API
```

### 5. **Protected Route Flow** (GET /auth/me)

```
GET /auth/me
  ↓
auth.controller.ts (getMe endpoint)
  ↓
@UseGuards(JwtGuard)                    # Token verification
  ↓
jwt.guard.ts (canActivate method)
  ↓
├── Extracts Bearer token from Authorization header
├── Verifies token with Supabase (supabase.auth.getUser)
└── Attaches user to request object
  ↓
@CurrentUser() decorator                 # Extracts user from request
  ↓
auth.controller.ts extracts token from Authorization header
  ↓
auth.service.ts (getCurrentUser method)
  ↓
├── Gets user from Supabase Database (supabase.from('users').select)
└── Verifies token with Supabase (supabase.auth.getUser)
  ↓
Returns: { access_token, user: { id, email, username, createdAt } }
```

**File Flow:**
```
jwt.guard.ts → current-user.decorator.ts → auth.controller.ts → auth.service.ts → Supabase Database
                                                                                  ↓
                                                                          Supabase Auth API
```

---

## 🔐 Component Responsibilities

### **Auth Module** (`src/auth/`)

| File | Responsibility |
|------|---------------|
| `auth.controller.ts` | HTTP endpoints for authentication (signup, login, me) |
| `auth.service.ts` | Business logic for signup/login/getCurrentUser |
| `auth.module.ts` | Module configuration & dependencies |
| `bcrypt.service.ts` | Password hashing service (if needed) |
| `dto/signup.dto.ts` | Signup request validation rules |
| `dto/login.dto.ts` | Login request validation rules |

### **Common Utilities** (`src/common/`)

| File | Responsibility |
|------|---------------|
| `decorators/current-user.decorator.ts` | Extracts user from request object |
| `guards/jwt.guard.ts` | JWT token verification & user attachment |
| `config/supabase.config.ts` | Supabase configuration |
| `config/jwt.config.ts` | JWT configuration |
| `interface/user.interface.ts` | User interface definitions |

---

## 🔗 Dependency Graph

```
AppModule
  ├── ConfigModule (global)
  └── AuthModule
      ├── AuthController
      ├── AuthService
      │   └── ConfigService (Supabase config)
      └── SupabaseClient (created internally in AuthService)
```

---

## 📝 API Endpoints

### **POST /auth/signup**
- **Body:** `{ email, password, username }`
- **Validation:** SignupDto
- **Response:** `{ access_token: string, refresh_token: string, user: { id, email, username } }`

### **POST /auth/login**
- **Body:** `{ email, password }`
- **Validation:** LoginDto
- **Response:** `{ access_token: string, refresh_token: string, user: { id, email } }`

### **GET /auth/me**
- **Headers:** `Authorization: Bearer <access_token>`
- **Guard:** JwtGuard
- **Response:** `{ access_token: string, user: { id, email, username, createdAt } }`

---

## 🔧 Environment Variables

Required environment variables:

```env
SUPABASE_URL=https://xxx.supabase.co   # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=xxx          # Supabase service role key
PORT=3000                               # Server port (optional)
```

---

## 🚀 Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   - Create `.env` file with required variables
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

3. **Configure Supabase Database:**
   - Set up your database tables in Supabase Dashboard
   - Ensure user profile table exists (e.g., `users` table with columns: `id`, `email`, `username`, `created_at`)
   - The `id` column should match the Supabase Auth user ID

4. **Start development server:**
   ```bash
   npm run start:dev
   ```

---

## 🔒 Security Features

- ✅ Password validation (min 6 characters, complexity requirements)
- ✅ Email validation
- ✅ Username validation (max 20 characters)
- ✅ JWT token verification
- ✅ Bearer token authentication
- ✅ DTO validation with class-validator
- ✅ No password storage in database (handled by Supabase Auth)
- ✅ Supabase Auth integration
- ✅ Direct Supabase database access
- ✅ Service role key for admin operations

---

## 📚 Key Technologies

- **NestJS** - Framework
- **Supabase Client** - Database access and authentication
- **Supabase Auth** - Authentication service
- **Supabase PostgreSQL** - Database
- **class-validator** - DTO validation
- **JWT** - Token-based authentication

---

## 🔄 Token Flow

1. **Signup/Login**: User receives `access_token` and `refresh_token`
2. **Authenticated Requests**: Client sends `access_token` in `Authorization: Bearer <token>` header
3. **Token Verification**: JwtGuard verifies token with Supabase before allowing access
4. **Get Current User**: Returns the same `access_token` along with user profile data

---

## 📋 Request/Response Examples

### Signup Request
```json
POST /auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe"
}
```

### Signup Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### Login Request
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

### Get Current User Request
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Current User Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```
