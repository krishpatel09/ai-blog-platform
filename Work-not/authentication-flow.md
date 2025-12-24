# 🔐 Authentication Flow Documentation

## Overview

#############--------old----------#############33333


This document describes the complete authentication system for the AI Blog Platform, including signup, login, logout, and token management flows.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Signup Flow](#signup-flow)
3. [Login Flow](#login-flow)
4. [Logout Flow](#logout-flow)
5. [Token Refresh Flow](#token-refresh-flow)
6. [Token Management](#token-management)
7. [Protected Routes](#protected-routes)
8. [API Endpoints](#api-endpoints)
9. [Request/Response Examples](#requestresponse-examples)
10. [Security Features](#security-features)

---

## 🏗️ Architecture Overview

### Technology Stack
- **Backend Framework**: NestJS
- **Database**: MySQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Token Storage**: Database (RefreshToken table)

### Key Components

```
back-end/src/
├── auth/
│   ├── auth.controller.ts          # Auth endpoints
│   ├── auth.service.ts              # Business logic
│   ├── auth.module.ts               # Module configuration
│   ├── services/
│   │   └── token.service.ts         # Token generation & management
│   ├── strategies/
│   │   └── jwt.strategy.ts          # JWT validation strategy
│   └── dto/
│       ├── signup.dto.ts            # Signup validation
│       ├── login.dto.ts             # Login validation
│       └── refresh-token.dto.ts     # Refresh token validation
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts # @CurrentUser() decorator
│   └── guards/
│       └── jwt-auth.guard.ts        # JWT protection guard
└── prisma/
    └── schema.prisma                # Database schema
```

### Database Schema

```prisma
model user {
  id        Int      @id @default(autoincrement())
  username  String
  email     String   @unique
  password  String   // Hashed with bcrypt
  createdAt DateTime @default(now())
  tokens    RefreshToken[]
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      user     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 1️⃣ Signup Flow

### Flow Diagram

```
Client
  ↓
POST /auth/signup
  ↓
auth.controller.ts (signup endpoint)
  ↓
auth.service.ts (signup method)
  ↓
├── Validates input via SignupDto
│   ├── username: required, max 20 chars
│   ├── email: required, valid email format
│   └── password: required, min 6 chars
  ↓
├── Checks if user exists (Prisma query)
│   └── If exists → BadRequestException
  ↓
├── Hashes password with bcrypt (10 rounds)
  ↓
├── Creates user in database
  ↓
├── Generates Access Token (JWT, 15min expiry)
  ↓
├── Generates Refresh Token (random 64-byte hex, 7 days expiry)
│   └── Stores in RefreshToken table
  ↓
└── Returns tokens + user data
```

### Implementation Details

**File**: `auth.service.ts` → `signup()`

1. **Input Validation**: Uses `SignupDto` with class-validator decorators
2. **Duplicate Check**: Queries database for existing email
3. **Password Hashing**: Uses bcrypt with 10 salt rounds
4. **User Creation**: Creates user record in database
5. **Token Generation**: 
   - Access Token: JWT signed with user payload (userId, username, email)
   - Refresh Token: Cryptographically secure random token stored in DB
6. **Response**: Returns both tokens and user info (without password)

### Request/Response

**Request**:
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "User already exists"
}
```

---

## 2️⃣ Login Flow

### Flow Diagram

```
Client
  ↓
POST /auth/login
  ↓
auth.controller.ts (login endpoint)
  ↓
auth.service.ts (login method)
  ↓
├── Validates input via LoginDto
│   ├── email: required, valid email
│   └── password: required
  ↓
├── Finds user by email
│   └── If not found → BadRequestException
  ↓
├── Compares password with bcrypt
│   └── If invalid → BadRequestException
  ↓
├── Generates Access Token (JWT, 15min expiry)
  ↓
├── Generates Refresh Token (random 64-byte hex, 7 days expiry)
│   └── Stores in RefreshToken table
  ↓
└── Returns tokens + user data
```

### Implementation Details

**File**: `auth.service.ts` → `login()`

1. **Input Validation**: Uses `LoginDto` with email and password validation
2. **User Lookup**: Finds user by email in database
3. **Password Verification**: Uses bcrypt.compare() to verify password
4. **Token Generation**: Same as signup flow
5. **Response**: Returns both tokens and user info

### Request/Response

**Request**:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Invalid email or password"
}
```

---

## 3️⃣ Logout Flow

### Flow Diagram

```
Client
  ↓
POST /auth/logout
  ↓
auth.controller.ts (logout endpoint)
  ↓
auth.service.ts (logout method)
  ↓
├── Validates input via RefreshTokenDto
  ↓
├── Deletes refresh token from database
│   └── Uses TokenService.deleteRefreshToken()
  ↓
├── Cleans up expired tokens (async, non-blocking)
  ↓
└── Returns success message
```

### Implementation Details

**File**: `auth.service.ts` → `logout()`

1. **Input Validation**: Requires refresh token in request body
2. **Token Deletion**: Removes refresh token from database
3. **Cleanup**: Asynchronously removes expired tokens (doesn't block response)
4. **Response**: Returns success message

**Important Notes**:
- Access tokens are stateless (JWT), so they remain valid until expiry
- Only refresh tokens are invalidated on logout
- Client should discard both tokens after logout

### Request/Response

**Request**:
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6..."
}
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## 4️⃣ Token Refresh Flow

### Flow Diagram

```
Client
  ↓
POST /auth/refresh
  ↓
auth.controller.ts (refresh endpoint)
  ↓
auth.service.ts (refreshToken method)
  ↓
├── Validates input via RefreshTokenDto
  ↓
├── Finds refresh token in database
│   └── If not found → UnauthorizedException
  ↓
├── Checks if token is expired
│   ├── If expired → Deletes token & throws UnauthorizedException
│   └── If valid → Continues
  ↓
├── Generates new Access Token (JWT, 15min expiry)
  ↓
├── Generates new Refresh Token (random 64-byte hex, 7 days expiry)
│   └── Stores in RefreshToken table
  ↓
├── Deletes old refresh token (token rotation)
  ↓
└── Returns new tokens + user data
```

### Implementation Details

**File**: `auth.service.ts` → `refreshToken()`

1. **Token Lookup**: Finds refresh token in database with user relation
2. **Expiry Check**: Validates token hasn't expired
3. **Token Rotation**: 
   - Creates new refresh token first
   - Deletes old refresh token after
   - Prevents race conditions
4. **New Access Token**: Generates fresh JWT with user data
5. **Response**: Returns both new tokens and user info

**Security Feature**: Token rotation ensures that if a refresh token is compromised, it can only be used once.

### Request/Response

**Request**:
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token"
}
```

or

```json
{
  "statusCode": 401,
  "message": "Refresh token expired"
}
```

---

## 5️⃣ Token Management

### Access Token (JWT)

**Type**: JSON Web Token (JWT)

**Payload**:
```json
{
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Properties**:
- **Expiry**: 15 minutes
- **Storage**: Client-side (localStorage, sessionStorage, or memory)
- **Usage**: Sent in `Authorization: Bearer <token>` header
- **Validation**: Verified by JWT Strategy using JWT_SECRET
- **Stateless**: No database lookup required for validation

**Generation**:
```typescript
// token.service.ts
generateAccessToken(payload: {
  userId: number;
  username: string;
  email: string;
}): string {
  return this.jwtService.sign(payload, {
    expiresIn: '15m',
  });
}
```

### Refresh Token

**Type**: Cryptographically secure random string

**Properties**:
- **Length**: 128 characters (64 bytes in hex)
- **Expiry**: 7 days
- **Storage**: Database (RefreshToken table)
- **Usage**: Sent in request body for refresh endpoint
- **Validation**: Database lookup required
- **Rotation**: New token generated on each refresh

**Generation**:
```typescript
// token.service.ts
async generateRefreshToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await this.prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
  
  return token;
}
```

### Token Cleanup

**Automatic Cleanup**: Expired tokens are cleaned up:
- After signup/login (async, non-blocking)
- After logout (async, non-blocking)
- Can be scheduled via cron job for periodic cleanup

**Implementation**:
```typescript
// token.service.ts
async cleanupExpiredTokens(): Promise<void> {
  await this.prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
```

---

## 6️⃣ Protected Routes

### JWT Guard

**File**: `common/guards/jwt-auth.guard.ts`

**Usage**:
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: CurrentUserType) {
  return user;
}
```

### JWT Strategy

**File**: `auth/strategies/jwt.strategy.ts`

**Flow**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature using JWT_SECRET
3. Checks token expiration
4. Validates payload
5. Looks up user in database to ensure user still exists
6. Attaches user to request object

**Implementation**:
```typescript
async validate(payload: { userId: number; username: string; email: string }) {
  const user = await this.prismaService.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, email: true },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return user;
}
```

### CurrentUser Decorator

**File**: `common/decorators/current-user.decorator.ts`

**Usage**:
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getCurrentUser(@CurrentUser() user: CurrentUserType) {
  return user;
}
```

**Implementation**:
```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
    return request.user;
  },
);
```

---

## 7️⃣ API Endpoints

### Base URL
```
http://localhost:3000/auth
```

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Authenticate user | No |
| POST | `/auth/logout` | Logout user | No (but requires refresh token) |
| POST | `/auth/refresh` | Refresh access token | No (but requires refresh token) |
| GET | `/auth/me` | Get current user | Yes (Access Token) |

---

## 8️⃣ Request/Response Examples

### Signup

**Request**:
```http
POST /auth/signup HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTYzODAyNzIwMCwiZXhwIjoxNjM4MDI4MTAwfQ...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (400):
```json
{
  "statusCode": 400,
  "message": ["User already exists"],
  "error": "Bad Request"
}
```

### Login

**Request**:
```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (400):
```json
{
  "statusCode": 400,
  "message": "Invalid email or password",
  "error": "Bad Request"
}
```

### Logout

**Request**:
```http
POST /auth/logout HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6..."
}
```

**Success Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

### Refresh Token

**Request**:
```http
POST /auth/refresh HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6..."
}
```

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (401):
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

### Get Current User (Protected Route)

**Request**:
```http
GET /auth/me HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

**Error Response** (401):
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## 9️⃣ Security Features

### Password Security
- ✅ **Hashing**: Passwords hashed with bcrypt (10 salt rounds)
- ✅ **Never Stored Plain**: Passwords never stored in plain text
- ✅ **Never Returned**: Passwords never returned in API responses

### Token Security
- ✅ **Short-lived Access Tokens**: 15-minute expiry reduces exposure window
- ✅ **Secure Refresh Tokens**: Cryptographically secure random tokens
- ✅ **Token Rotation**: Refresh tokens rotated on each use
- ✅ **Database Storage**: Refresh tokens stored securely in database
- ✅ **Expiry Management**: Automatic cleanup of expired tokens
- ✅ **Stateless Access Tokens**: JWT tokens don't require database lookup

### Authentication Security
- ✅ **JWT Signature Verification**: All tokens verified with secret key
- ✅ **User Validation**: JWT strategy validates user still exists
- ✅ **Token Expiry Check**: Both access and refresh tokens checked for expiry
- ✅ **Input Validation**: All inputs validated with DTOs and class-validator

### Best Practices
- ✅ **Error Messages**: Generic error messages prevent user enumeration
- ✅ **Async Cleanup**: Token cleanup doesn't block requests
- ✅ **Cascade Deletion**: Refresh tokens deleted when user is deleted
- ✅ **Type Safety**: Full TypeScript type safety throughout

---

## 🔄 Complete Authentication Lifecycle

### User Journey

```
1. User Signs Up
   ↓
   Receives: accessToken (15min) + refreshToken (7 days)
   ↓
2. User Makes Authenticated Requests
   ↓
   Sends: Authorization: Bearer <accessToken>
   ↓
3. Access Token Expires (after 15min)
   ↓
4. User Refreshes Token
   ↓
   POST /auth/refresh with refreshToken
   ↓
   Receives: New accessToken + New refreshToken (old one invalidated)
   ↓
5. User Logs Out
   ↓
   POST /auth/logout with refreshToken
   ↓
   Refresh token deleted from database
   ↓
   User must login again to get new tokens
```

### Token Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Lifecycle                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Signup/Login                                                │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ Access Token │         │Refresh Token │                  │
│  │  (15 min)    │         │  (7 days)    │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                            │
│         │ Used for API calls     │ Used for token refresh    │
│         │                        │                            │
│         ▼                        ▼                            │
│  ┌─────────────────────────────────────────┐                 │
│  │  Access Token Expires (15 min)          │                 │
│  └─────────────────────────────────────────┘                 │
│         │                        │                            │
│         │                        │                            │
│         ▼                        ▼                            │
│  ┌─────────────────────────────────────────┐                 │
│  │  POST /auth/refresh                      │                 │
│  │  Body: { refreshToken }                  │                 │
│  └─────────────────────────────────────────┘                 │
│         │                        │                            │
│         │                        │                            │
│         ▼                        ▼                            │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ New Access   │         │ New Refresh  │                  │
│  │ Token        │         │ Token        │                  │
│  │ (15 min)     │         │ (7 days)     │                  │
│  └──────────────┘         └──────────────┘                  │
│                                    │                          │
│                                    │                          │
│                                    ▼                          │
│  ┌─────────────────────────────────────────┐                 │
│  │  Old Refresh Token Deleted (Rotation)    │                 │
│  └─────────────────────────────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# Database
DATABASE_URL=mysql://user:password@localhost:3306/dbname
```

---

## 🧪 Testing the Flow

### 1. Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Use Access Token
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📚 Additional Notes

### Client-Side Token Storage

**Recommended Approach**:
- **Access Token**: Store in memory (React state) or httpOnly cookie
- **Refresh Token**: Store in httpOnly cookie (most secure) or localStorage

**Not Recommended**:
- ❌ Storing tokens in localStorage (XSS vulnerability)
- ❌ Storing tokens in sessionStorage (tab-specific)

### Token Refresh Strategy

**Automatic Refresh**:
1. Intercept 401 responses
2. Attempt token refresh
3. Retry original request with new token
4. If refresh fails, redirect to login

**Example Implementation**:
```typescript
// Frontend interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const newTokens = await refreshToken();
      // Retry original request
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## ✅ Summary

This authentication system provides:

1. ✅ **Secure Signup** - Password hashing, duplicate checking
2. ✅ **Secure Login** - Password verification, token generation
3. ✅ **Secure Logout** - Token invalidation
4. ✅ **Token Refresh** - Automatic token rotation
5. ✅ **Protected Routes** - JWT guard with user validation
6. ✅ **Token Management** - Automatic cleanup, secure storage
7. ✅ **Security Best Practices** - Short-lived tokens, rotation, validation

The system is production-ready and follows industry best practices for JWT-based authentication.

