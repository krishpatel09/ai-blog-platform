# Authentication System - Complete Flow Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication Flows](#authentication-flows)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Token Management](#token-management)
- [Database Schema](#database-schema)

---

## Overview

This authentication system uses **JWT (JSON Web Tokens)** with a **refresh token pattern** for secure authentication. It includes email verification, audit logging, and comprehensive security features.

### Key Technologies
- **NestJS** - Backend framework
- **Prisma** - Database ORM
- **JWT** - Access token authentication (15-minute expiry)
- **bcrypt** - Password hashing (10 rounds)
- **Refresh Tokens** - Long-lived tokens (7-day expiry) stored in database
- **Email Service** - SMTP-based email verification and notifications
- **Audit Service** - Comprehensive logging of authentication events

---

## Architecture

### Folder Structure

```
back-end/src/auth/
├── auth.controller.ts          # HTTP endpoints
├── auth.service.ts             # Business logic
├── auth.module.ts              # Module configuration
├── dto/                        # Data Transfer Objects
│   ├── signup.dto.ts
│   ├── signin.dto.ts
│   ├── refresh-token.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   ├── resend-verification.dto.ts
│   └── verify-email.dto.ts
├── guards/                     # Authentication guards
│   ├── jwt-auth.guard.ts      # JWT token validation
│   └── email-verified.guard.ts # Email verification check
├── strategies/                 # Passport strategies
│   ├── jwt.strategy.ts        # JWT access token strategy
│   └── refresh-jwt.strategy.ts # Refresh token strategy
└── services/                   # Supporting services
    ├── token.service.ts        # Token generation & validation
    ├── email.service.ts        # Email sending
    └── audit.service.ts        # Audit logging
```

---

## Authentication Flows

### 1. User Registration (Signup)

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant TokenService
    participant Prisma
    participant EmailService
    participant AuditService

    Client->>Controller: POST /auth/signup
    Controller->>Service: signup(dto, ip, userAgent)
    Service->>Prisma: Check if user exists
    alt User exists
        Prisma-->>Service: User found
        Service-->>Controller: BadRequestException
        Controller-->>Client: 400 - User already exists
    else User doesn't exist
        Prisma-->>Service: User not found
        Service->>Service: Hash password (bcrypt, 10 rounds)
        Service->>TokenService: Generate email verification token
        TokenService-->>Service: Verification token (32-byte hex)
        Service->>Prisma: Create user (emailVerified: false)
        Prisma-->>Service: Created user
        Service->>EmailService: Send verification email
        EmailService-->>Service: Email sent
        Service->>AuditService: Log SIGNUP event
        AuditService-->>Service: Logged
        Service-->>Controller: { user, message }
        Controller-->>Client: 201 - Registration successful
    end
```

**Flow Details:**
1. Client sends POST request to `/auth/signup` with `{ username, email, password }`
2. Service validates input and checks if user exists
3. Password is hashed using bcrypt (10 rounds)
4. Email verification token is generated (32-byte hex string)
5. User is created in database with `emailVerified: false`
6. Verification email is sent with token link
7. SIGNUP event is logged in audit trail
8. Response confirms registration (no tokens until email verified)

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "emailVerified": false
  },
  "message": "Registration successful. Please verify your email."
}
```

---

### 2. Email Verification

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant TokenService
    participant Prisma
    participant AuditService

    Client->>Controller: GET /auth/verify-email?token=xxx
    Controller->>Service: verifyEmail(token, ip, userAgent)
    Service->>Prisma: Find user by verification token
    alt Token invalid
        Prisma-->>Service: User not found
        Service-->>Controller: BadRequestException
        Controller-->>Client: 400 - Invalid token
    else Token valid
        Prisma-->>Service: User found
        Service->>Prisma: Update user (emailVerified: true, token: null)
        Prisma-->>Service: Updated
        Service->>TokenService: Generate access token
        TokenService-->>Service: Access token (15min)
        Service->>TokenService: Generate refresh token
        TokenService->>Prisma: Create refresh token (7 days)
        Prisma-->>Service: Refresh token created
        Service->>AuditService: Log EMAIL_VERIFIED event
        AuditService-->>Service: Logged
        Service-->>Controller: { accessToken, refreshToken, message }
        Controller-->>Client: 200 - Email verified
    end
```

**Flow Details:**
1. User clicks verification link in email
2. GET request to `/auth/verify-email?token=xxx`
3. Service finds user by verification token
4. User's email is marked as verified, token is cleared
5. Access token (15 minutes) and refresh token (7 days) are generated
6. EMAIL_VERIFIED event is logged
7. User is automatically logged in

**Response:**
```json
{
  "message": "Email verified successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123def456..."
}
```

---

### 3. User Login (Signin)

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant TokenService
    participant Prisma
    participant AuditService

    Client->>Controller: POST /auth/signin
    Controller->>Service: signin(dto, ip, userAgent)
    Service->>Prisma: Find user by email
    alt User not found or password invalid
        Prisma-->>Service: User not found / Password mismatch
        Service-->>Controller: UnauthorizedException
        Controller-->>Client: 401 - Invalid credentials
    else Credentials valid
        Prisma-->>Service: User found
        Service->>Service: Compare password (bcrypt)
        Service->>TokenService: Generate access token
        TokenService-->>Service: Access token (15min)
        Service->>TokenService: Generate refresh token
        TokenService->>Prisma: Create refresh token (7 days)
        Prisma-->>Service: Refresh token created
        Service->>AuditService: Log LOGIN event
        AuditService-->>Service: Logged
        Service-->>Controller: { accessToken, refreshToken, user }
        Controller->>Controller: Set refresh token cookie (httpOnly, secure, sameSite: strict)
        Controller-->>Client: { accessToken, user }
    end
```

**Flow Details:**
1. Client sends POST request to `/auth/signin` with `{ email, password }`
2. Service finds user by email
3. Password is verified using bcrypt.compare
4. Access token (JWT, 15 minutes) is generated
5. Refresh token (random 64-byte hex, 7 days) is created in database
6. Refresh token is set as httpOnly cookie
7. LOGIN event is logged in audit trail
8. Access token and user data are returned

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```
*Note: Refresh token is sent as httpOnly cookie, not in response body*

---

### 4. Token Refresh

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant TokenService
    participant Prisma
    participant AuditService

    Client->>Controller: POST /auth/refresh (refreshToken in body)
    Controller->>Service: refreshToken(dto, ip, userAgent)
    Service->>TokenService: Validate refresh token
    TokenService->>Prisma: Find refresh token (not revoked, not expired)
    alt Token invalid/expired/revoked
        Prisma-->>TokenService: Token not found
        TokenService-->>Service: UnauthorizedException
        Service-->>Controller: 401 - Invalid refresh token
        Controller-->>Client: 401 - Unauthorized
    else Token valid
        Prisma-->>TokenService: Refresh token with user
        TokenService-->>Service: Valid refresh token
        Service->>TokenService: Generate new access token
        TokenService-->>Service: New access token (15min)
        Service->>TokenService: Generate new refresh token
        TokenService->>Prisma: Create new refresh token (7 days)
        Prisma-->>Service: New refresh token created
        Service->>Prisma: Mark old token as revoked (isRevoked: true)
        Prisma-->>Service: Updated
        Service->>AuditService: Log TOKEN_REFRESH event
        AuditService-->>Service: Logged
        Service-->>Controller: { accessToken, refreshToken, user }
        Controller->>Controller: Set new refresh token cookie
        Controller-->>Client: { accessToken, user }
    end
```

**Flow Details:**
1. Client sends POST request to `/auth/refresh` with refresh token
2. Service validates refresh token (exists, not revoked, not expired)
3. New access token is generated (15 minutes)
4. New refresh token is generated and stored (7 days)
5. Old refresh token is marked as revoked (not deleted for audit trail)
6. TOKEN_REFRESH event is logged
7. New tokens are returned to client

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

---

### 5. User Logout

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant TokenService
    participant Prisma
    participant AuditService

    Client->>Controller: POST /auth/logout
    Controller->>Controller: Extract refresh token from cookie
    Controller->>Service: logout(refreshToken, ip, userAgent)
    Service->>TokenService: Validate refresh token
    TokenService->>Prisma: Find refresh token
    alt Token exists
        Prisma-->>TokenService: Refresh token found
        TokenService->>Prisma: Delete refresh token
        Prisma-->>TokenService: Deleted
        TokenService-->>Service: Success
        Service->>AuditService: Log LOGOUT event
        AuditService-->>Service: Logged
    else Token invalid/missing
        TokenService-->>Service: Validation failed (warn only)
    end
    Service->>TokenService: Cleanup expired tokens (async)
    Service-->>Controller: { message: "Logged out successfully" }
    Controller->>Controller: Clear refresh token cookie
    Controller-->>Client: 200 - Logged out
```

**Flow Details:**
1. Client sends POST request to `/auth/logout`
2. Refresh token is extracted from httpOnly cookie
3. Refresh token is validated and deleted from database
4. LOGOUT event is logged in audit trail
5. Expired tokens are cleaned up asynchronously
6. Refresh token cookie is cleared
7. Success message is returned

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 6. Resend Verification Email

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant TokenService
    participant Prisma
    participant EmailService

    Client->>Controller: POST /auth/resend-verification
    Controller->>Service: resendVerificationEmail(email)
    Service->>Prisma: Find user by email
    alt User not found
        Prisma-->>Service: User not found
        Service-->>Controller: Generic message (security)
        Controller-->>Client: 200 - Message sent (if exists)
    else User found
        Prisma-->>Service: User found
        alt Email already verified
            Service-->>Controller: BadRequestException
            Controller-->>Client: 400 - Email already verified
        else Email not verified
            Service->>TokenService: Generate new verification token
            TokenService-->>Service: New token
            Service->>Prisma: Update user with new token
            Prisma-->>Service: Updated
            Service->>EmailService: Send verification email
            EmailService-->>Service: Email sent
            Service-->>Controller: { message }
            Controller-->>Client: 200 - Verification email sent
        end
    end
```

**Flow Details:**
1. Client sends POST request to `/auth/resend-verification` with `{ email }`
2. Service finds user by email
3. If email is already verified, error is returned
4. New verification token is generated
5. User record is updated with new token
6. Verification email is sent
7. Rate limiting: 3 requests per 5 minutes (300000ms TTL)

**Response:**
```json
{
  "message": "Verification email sent successfully"
}
```

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/signup` | Register new user | `{ username, email, password }` | `{ user, message }` |
| POST | `/auth/signin` | Login user | `{ email, password }` | `{ accessToken, user }` |
| GET | `/auth/verify-email` | Verify email address | Query: `?token=xxx` | `{ accessToken, refreshToken, message }` |
| POST | `/auth/resend-verification` | Resend verification email | `{ email }` | `{ message }` |
| POST | `/auth/refresh` | Refresh access token | `{ refreshToken }` | `{ accessToken, user }` |
| POST | `/auth/logout` | Logout user | - | `{ message }` |

---

## Security Features

### Password Security
- ✅ **bcrypt hashing** - 10 salt rounds
- ✅ **Password validation** - Minimum length requirements (via DTO)
- ✅ **No password in responses** - Passwords never returned in API responses

### Token Security
- ✅ **JWT Access Tokens** - Short-lived (15 minutes)
- ✅ **Refresh Tokens** - Long-lived (7 days), stored in database
- ✅ **Token Rotation** - New refresh token on each refresh, old token revoked
- ✅ **HttpOnly Cookies** - Refresh tokens sent as httpOnly cookies (prevents XSS)
- ✅ **Secure Cookies** - `secure: true` flag (HTTPS only)
- ✅ **SameSite Protection** - `sameSite: 'strict'` (CSRF protection)
- ✅ **Token Revocation** - Refresh tokens can be revoked/logged out
- ✅ **Expired Token Cleanup** - Automatic cleanup of expired tokens

### Email Verification
- ✅ **Email Verification Required** - Users must verify email before full access
- ✅ **EmailVerifiedGuard** - Protects routes requiring verified email
- ✅ **Secure Tokens** - 32-byte hex verification tokens
- ✅ **Token Rotation** - New token generated on resend

### Audit & Monitoring
- ✅ **Audit Logging** - All auth events logged (SIGNUP, LOGIN, LOGOUT, EMAIL_VERIFIED, TOKEN_REFRESH)
- ✅ **IP Address Tracking** - Client IP logged with events
- ✅ **User Agent Tracking** - Browser/client info logged
- ✅ **Success/Failure Tracking** - Audit logs include success status

### Rate Limiting
- ✅ **Resend Verification** - 3 requests per 5 minutes
- ✅ **Throttler Integration** - NestJS throttler for rate limiting

### Authentication Guards
- ✅ **JwtAuthGuard** - Validates JWT access tokens
- ✅ **EmailVerifiedGuard** - Ensures email is verified
- ✅ **Public Decorator** - Routes can be marked as public (bypass guards)

---

## Token Management

### Access Token (JWT)

**Generation:**
- Algorithm: HS256 (HMAC SHA-256)
- Expiry: 15 minutes
- Payload: `{ userId, username, email }`
- Secret: `JWT_SECRET` environment variable

**Usage:**
- Sent in `Authorization: Bearer <token>` header
- Validated by `JwtStrategy` on protected routes
- User must refresh when expired

**Validation:**
1. Extract token from Authorization header
2. Verify signature with JWT_SECRET
3. Check expiration
4. Validate user exists and is active in database
5. Attach user to request object

### Refresh Token

**Generation:**
- Type: Random 64-byte hex string
- Expiry: 7 days from creation
- Storage: Database (`RefreshToken` table)
- Cookie: HttpOnly, Secure, SameSite: Strict

**Usage:**
- Sent as httpOnly cookie (not accessible via JavaScript)
- Used to obtain new access token when expired
- Can be revoked via logout

**Validation:**
1. Token exists in database
2. Token is not revoked (`isRevoked: false`)
3. Token is not expired (`expiresAt >= now`)
4. Associated user exists and is active

**Rotation:**
- New refresh token generated on each refresh
- Old token marked as revoked (not deleted for audit)
- Previous refresh tokens cannot be reused

### Email Verification Token

**Generation:**
- Type: Random 32-byte hex string
- Storage: User table (`emailVerificationToken` field)
- Expiry: No automatic expiry (manual verification required)
- Usage: Single-use (cleared after verification)

---

## Database Schema

### User Table

```prisma
model User {
  id                      String   @id @default(uuid())
  username                String   @unique
  email                   String   @unique
  password                String   // bcrypt hashed
  emailVerified           Boolean  @default(false)
  emailVerificationToken  String?  @unique
  isActive                Boolean  @default(true)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  refreshTokens           RefreshToken[]
  auditLogs              AuditLog[]
}
```

### RefreshToken Table

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

### AuditLog Table

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String   // SIGNUP, LOGIN, LOGOUT, EMAIL_VERIFIED, TOKEN_REFRESH
  ipAddress String?
  userAgent String?
  success   Boolean  @default(true)
  createdAt DateTime @default(now())
  
  user      User?    @relation(fields: [userId], references: [id])
}
```

---

## Request/Response Examples

### Signup Request
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Signup Response
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "emailVerified": false
  },
  "message": "Registration successful. Please verify your email."
}
```

---

### Signin Request
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Signin Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDkwMH0...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```
*Refresh token sent as httpOnly cookie*

---

### Refresh Token Request
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "abc123def456..."
}
```

### Refresh Token Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

---

### Protected Route Request
```http
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Logout Request
```http
POST /auth/logout
```
*Refresh token automatically sent via cookie*

### Logout Response
```json
{
  "message": "Logged out successfully"
}
```

---

## Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Database (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourapp.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Server
PORT=3000
NODE_ENV=development
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "User already exists",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Email not verified. Please verify your email to access this resource.",
  "error": "Forbidden"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Best Practices

### Client-Side Token Management

1. **Store access token in memory** (not localStorage) to prevent XSS attacks
2. **Use refresh token from cookie** - Automatically sent with requests
3. **Handle token expiration** - Intercept 401 responses and refresh token
4. **Clear tokens on logout** - Remove from memory and clear cookies

### Token Refresh Strategy

1. **Refresh before expiration** - Refresh access token 1-2 minutes before expiry
2. **Handle refresh failures** - Redirect to login if refresh fails
3. **Prevent concurrent refreshes** - Use a refresh lock to prevent multiple simultaneous refresh requests

### Security Considerations

1. **HTTPS Only** - Always use HTTPS in production (required for secure cookies)
2. **CORS Configuration** - Properly configure CORS for your frontend domain
3. **Rate Limiting** - Implement rate limiting on authentication endpoints
4. **Audit Logging** - Monitor audit logs for suspicious activity
5. **Email Verification** - Enforce email verification for sensitive operations

---



## Future Enhancements

Potential improvements:
- [ ] Password reset flow (forgot/reset password)
- [ ] Two-factor authentication (2FA)
- [ ] Social authentication (Google, GitHub, etc.)
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Session management (multiple devices)
- [ ] Email verification token expiry
