# 🔐 Authentication Flow Documentation

Complete authentication system flow for the AI Blog Platform.

---

## 📋 Table of Contents

1. [Signup Flow](#1-signup-flow)
2. [Email Verification Flow](#2-email-verification-flow)
3. [Login Flow](#3-login-flow)
4. [Access Protected Routes Flow](#4-access-protected-routes-flow)
5. [Token Refresh Flow (Rotation)](#5-token-refresh-flow-rotation)
6. [Logout Flow](#6-logout-flow)
7. [Rate Limiting Flow](#7-rate-limiting-flow)
8. [Account Lock Flow](#8-account-lock-flow)
9. [Token Blacklist Flow](#9-token-blacklist-flow)
10. [Password Reset Flow](#10-password-reset-flow)
11. [Change Password Flow](#11-change-password-flow)
12. [Complete Auth Lifecycle](#complete-auth-lifecycle)

---

## 1️⃣ SIGNUP FLOW

```
Client
  |
  |  POST /auth/signup
  |  Body: { username, email, password }
  |  Headers: { user-agent }
  v
AuthController.signup()
  |
  |  @Throttle({ limit: 3, ttl: 60000 }) // 3 signups per minute
  v
AuthService.signup()
  |
  ├── Check user exists (MySQL via Prisma)
  |   └── If exists → BadRequestException("User already exists")
  |
  ├── Hash password (bcrypt, rounds: 10)
  |
  ├── Generate email verification token (crypto.randomBytes)
  |
  ├── Create user in MySQL (Prisma)
  |   └── emailVerified = false
  |   └── emailVerificationToken = <generated_token>
  |
  ├── Send verification email (EmailService)
  |   └── Email template with verification link
  |
  ├── Generate access token (JWT - 15 min expiry)
  |   └── Payload: { userId, username, email }
  |
  ├── Generate refresh token (MySQL RefreshToken table)
  |   └── Stored with: userId, token, expiresAt, ipAddress, userAgent
  |
  ├── Audit log → SIGNUP
  |   └── Action: "SIGNUP", success: true
  |
  └── Cleanup expired tokens (async)
  |
  v
Response (201 Created)
{
  accessToken: string,
  refreshToken: string,
  user: {
    id: string,
    username: string,
    email: string,
    emailVerified: boolean
  },
  message: "Signup successful. Please check your email to verify your account."
}
```

**Error Cases:**
- ❌ User already exists → `400 Bad Request`
- ❌ Rate limit exceeded → `429 Too Many Requests`
- ❌ Invalid input → `400 Bad Request`
- ❌ Server error → `500 Internal Server Error`

---

## 2️⃣ EMAIL VERIFICATION FLOW

### 2.1 Verify Email

```
User clicks email link
  |
  |  POST /auth/verify-email
  |  Body: { token: string }
  v
AuthController.verifyEmail()
  |
  v
AuthService.verifyEmail()
  |
  ├── Find user by emailVerificationToken (MySQL)
  |   └── If not found → BadRequestException("Invalid or expired verification token")
  |
  ├── Update user
  |   ├── emailVerified = true
  |   └── emailVerificationToken = null
  |
  ├── Audit log → EMAIL_VERIFIED
  |   └── Action: "EMAIL_VERIFIED", success: true
  |
  v
Response (200 OK)
{
  message: "Email verified successfully"
}
```

### 2.2 Resend Verification Email

```
Client
  |
  |  POST /auth/resend-verification
  |  Body: { email: string }
  |  @Throttle({ limit: 3, ttl: 300000 }) // 3 per 5 minutes
  v
AuthService.resendVerificationEmail()
  |
  ├── Find user by email (MySQL)
  |   └── If not found → Return success (don't reveal user existence)
  |
  ├── Check if already verified
  |   └── If verified → BadRequestException("Email is already verified")
  |
  ├── Generate new email verification token
  |
  ├── Update user with new token
  |
  ├── Send verification email
  |
  v
Response (200 OK)
{
  message: "Verification email sent successfully"
}
```

**Error Cases:**
- ❌ Invalid token → `400 Bad Request`
- ❌ Email already verified → `400 Bad Request`
- ❌ Rate limit exceeded → `429 Too Many Requests`

---

## 3️⃣ LOGIN FLOW

```
Client
  |
  |  POST /auth/signin
  |  Body: { email, password }
  |  Headers: { user-agent }
  v
AuthController.signin()
  |
  |  @Throttle({ limit: 5, ttl: 60000 }) // 5 logins per minute
  v
AuthService.signin()
  |
  ├── Find user by email (MySQL)
  |   └── If not found → UnauthorizedException("Invalid email or password")
  |   └── Log: LOGIN_FAILED
  |
  ├── Check account lock status
  |   └── If lockedUntil > now → UnauthorizedException("Account is locked. Try again in X minutes.")
  |
  ├── Check account is active
  |   └── If !isActive → UnauthorizedException("Account has been deactivated")
  |
  ├── Compare password (bcrypt.compare)
  |   └── If invalid:
  |       ├── Increment loginAttempts
  |       ├── If loginAttempts >= 4:
  |       |   └── Set lockedUntil = now + 15 minutes
  |       ├── Update user record
  |       ├── Log: LOGIN_FAILED
  |       └── Throw UnauthorizedException
  |
  ├── Reset login attempts (on success)
  |   ├── loginAttempts = 0
  |   ├── lockedUntil = null
  |   ├── lastLoginAt = now
  |   └── lastLoginIp = <ipAddress>
  |
  ├── Generate access token (JWT - 15 min)
  |   └── Payload: { userId, username, email }
  |
  ├── Generate refresh token (MySQL)
  |   └── Stored with metadata
  |
  ├── Audit log → LOGIN
  |   └── Action: "LOGIN", success: true
  |
  └── Cleanup expired tokens (async)
  |
  v
Response (200 OK)
{
  accessToken: string,
  refreshToken: string,
  user: {
    id: string,
    username: string,
    email: string,
    emailVerified: boolean
  }
}
```

**Error Cases:**
- ❌ Invalid credentials → `401 Unauthorized`
- ❌ Account locked → `401 Unauthorized` (with remaining time)
- ❌ Account deactivated → `401 Unauthorized`
- ❌ Rate limit exceeded → `429 Too Many Requests`
- ❌ Too many failed attempts → Account locked for 15 minutes

---

## 4️⃣ ACCESS PROTECTED ROUTES FLOW

```
Client
  |
  |  GET /auth/me (or any protected route)
  |  Headers: { Authorization: "Bearer <accessToken>" }
  v
JwtAuthGuard.canActivate()
  |
  v
JwtStrategy.validate()
  |
  ├── Extract token from Authorization header
  |   └── Format: "Bearer <token>"
  |
  ├── Verify JWT signature
  |   └── Using JWT_SECRET
  |
  ├── Check token expiry
  |   └── If expired → UnauthorizedException
  |
  ├── Check token blacklist (MongoDB)
  |   └── If blacklisted → UnauthorizedException("Token has been revoked")
  |
  ├── Validate user exists (MySQL)
  |   └── Find user by userId from token payload
  |
  ├── Check user is active
  |   └── If !isActive → UnauthorizedException("Account has been deactivated")
  |
  └── Return user object
  |
  v
EmailVerifiedGuard (if applied)
  |
  ├── Check emailVerified === true
  |   └── If false → ForbiddenException("Email not verified")
  |
  v
Controller Method
  |
  ├── @CurrentUser() decorator extracts user from request
  |
  v
Response (200 OK)
{
  user: { ... }
}
```

**Error Cases:**
- ❌ No token provided → `401 Unauthorized`
- ❌ Invalid token → `401 Unauthorized`
- ❌ Token expired → `401 Unauthorized`
- ❌ Token blacklisted → `401 Unauthorized`
- ❌ User not found → `401 Unauthorized`
- ❌ Account deactivated → `401 Unauthorized`
- ❌ Email not verified → `403 Forbidden` (if EmailVerifiedGuard applied)

---

## 5️⃣ TOKEN REFRESH FLOW (Rotation)

```
Client
  |
  |  POST /auth/refresh
  |  Body: { refreshToken: string }
  |  Headers: { user-agent }
  |  @Throttle({ limit: 10, ttl: 60000 }) // 10 refreshes per minute
  v
AuthService.refreshToken()
  |
  ├── Validate refresh token (MySQL)
  |   ├── Find token in RefreshToken table
  |   ├── Check token exists
  |   ├── Check token not expired
  |   └── If invalid → UnauthorizedException
  |
  ├── Check token is revoked
  |   └── If isRevoked === true → UnauthorizedException("Refresh token has been revoked")
  |
  ├── Generate NEW access token (JWT - 15 min)
  |   └── Payload: { userId, username, email }
  |
  ├── Generate NEW refresh token (MySQL)
  |   └── parentTokenId = oldRefreshToken.id (for reuse detection)
  |
  ├── Revoke old refresh token
  |   ├── isRevoked = true
  |   ├── revokedAt = now
  |   └── Keep record for audit trail
  |
  ├── Audit log → TOKEN_REFRESH
  |   └── Action: "TOKEN_REFRESH", success: true
  |
  v
Response (200 OK)
{
  accessToken: string,
  refreshToken: string, // NEW refresh token
  user: {
    id: string,
    username: string,
    email: string,
    emailVerified: boolean
  }
}
```

**🛡️ Token Reuse Detection:**
- If old refresh token is used again after being revoked:
  - System detects reuse via parentTokenId tracking
  - All user sessions can be revoked for security
  - Audit log: TOKEN_REUSE_DETECTED

**Error Cases:**
- ❌ Invalid refresh token → `401 Unauthorized`
- ❌ Token expired → `401 Unauthorized`
- ❌ Token revoked → `401 Unauthorized`
- ❌ Rate limit exceeded → `429 Too Many Requests`

---

## 6️⃣ LOGOUT FLOW (Immediate)

```
Client
  |
  |  POST /auth/logout
  |  Body: { refreshToken: string }
  |  Headers: { Authorization: "Bearer <accessToken>" }
  v
AuthService.logout()
  |
  ├── Validate refresh token (MySQL)
  |   └── Find and validate refresh token
  |
  ├── Blacklist access token (MongoDB)
  |   ├── Store token in BlacklistedToken collection
  |   ├── Set TTL = 15 minutes (access token expiry)
  |   └── Auto-delete after expiry
  |
  ├── Delete refresh token (MySQL)
  |   └── Remove from RefreshToken table
  |
  ├── Audit log → LOGOUT
  |   └── Action: "LOGOUT", success: true
  |
  └── Cleanup expired tokens (async)
  |
  v
Response (200 OK)
{
  message: "Logged out successfully"
}
```

**🔥 Immediate Invalidation:**
- Access token becomes invalid immediately via MongoDB blacklist
- Refresh token is deleted from MySQL
- User must login again to get new tokens

**Error Cases:**
- ❌ Invalid refresh token → `401 Unauthorized`
- ❌ Token not found → `401 Unauthorized`

---

## 7️⃣ RATE LIMITING FLOW (MongoDB)

```
Request arrives
  |
  v
CacheService.checkRateLimit()
  |
  ├── Build key: "rate_limit:<endpoint>:<ip>:<timeWindow>"
  |
  ├── Find rate-limit record in MongoDB (RateLimit collection)
  |
  ├── If record exists:
  |   ├── Increment attempts counter
  |   └── Check if attempts >= limit
  |
  ├── If record doesn't exist:
  |   ├── Create new record
  |   ├── attempts = 1
  |   └── Set TTL index for auto-expiry
  |
  ├── If attempts >= limit:
  |   └── Return: { allowed: false, remaining: 0 }
  |
  └── If attempts < limit:
      └── Return: { allowed: true, remaining: limit - attempts }
  |
  v
Allowed / Blocked
```

**Rate Limits Applied:**
- **Signup:** 3 requests per minute
- **Login:** 5 requests per minute
- **Token Refresh:** 10 requests per minute
- **Resend Verification:** 3 requests per 5 minutes

**Storage:**
- MongoDB RateLimit collection
- TTL index for automatic cleanup
- Key format: `rate_limit:<endpoint>:<ip>:<window>`

---

## 8️⃣ ACCOUNT LOCK FLOW

```
Login Attempt with Wrong Password
  |
  v
AuthService.signin()
  |
  ├── Password comparison fails
  |
  ├── Increment loginAttempts
  |   └── loginAttempts = user.loginAttempts + 1
  |
  ├── Check if loginAttempts >= MAX_LOGIN_ATTEMPTS (4)
  |
  ├── If loginAttempts >= 4:
  |   ├── Set lockedUntil = now + LOCK_TIME (15 minutes)
  |   ├── Update user record
  |   ├── Log: LOGIN_FAILED
  |   └── Throw UnauthorizedException("Too many failed login attempts. Account locked for 15 minutes.")
  |
  └── If loginAttempts < 4:
      ├── Update user record (increment attempts)
      ├── Log: LOGIN_FAILED
      └── Throw UnauthorizedException("Invalid email or password")
  |
  v
Account Locked
```

**Lock Duration:** 15 minutes

**Unlock Conditions:**
- Automatic unlock after 15 minutes
- Successful login resets lock (loginAttempts = 0, lockedUntil = null)

**Security Features:**
- Prevents brute force attacks
- Audit logging for all failed attempts
- Clear error messages with remaining lock time

---

## 9️⃣ TOKEN BLACKLIST FLOW (MongoDB)

```
Logout / Token Revocation
  |
  v
TokenService.blacklistAccessToken()
  |
  ├── Create blacklist entry in MongoDB (BlacklistedToken collection)
  |
  ├── Store:
  |   ├── token: <accessToken>
  |   ├── userId: <userId>
  |   ├── blacklistedAt: <timestamp>
  |   └── expiresAt: <token_expiry_time>
  |
  ├── Set TTL index for auto-deletion
  |   └── TTL = access token expiry (15 minutes)
  |
  v
Token Blacklisted
```

**Usage:**
- **Logout:** Immediate token invalidation
- **Force Logout:** Admin-initiated session termination
- **Token Reuse Attack:** Security response

**Validation:**
- JwtStrategy checks blacklist on every request
- If token found in blacklist → UnauthorizedException

**Auto-Cleanup:**
- MongoDB TTL index automatically deletes expired entries
- No manual cleanup required

---

## 🔟 PASSWORD RESET FLOW

### 10.1 Forgot Password

```
Client
  |
  |  POST /auth/forgot-password
  |  Body: { email: string }
  |  @Throttle({ limit: 3, ttl: 300000 }) // 3 per 5 minutes
  v
AuthService.forgotPassword()
  |
  ├── Find user by email (MySQL)
  |   └── If not found → Return success (don't reveal user existence)
  |
  ├── Generate password reset token
  |   └── crypto.randomBytes(32).toString('hex')
  |
  ├── Store reset token in user record
  |   ├── passwordResetToken = <token>
  |   └── passwordResetExpires = now + 1 hour
  |
  ├── Send password reset email
  |   └── Email template with reset link
  |   └── Link: /reset-password?token=<token>
  |
  ├── Audit log → PASSWORD_RESET_REQUESTED
  |
  v
Response (200 OK)
{
  message: "If the email exists, a password reset link has been sent."
}
```

### 10.2 Reset Password

```
User clicks email link
  |
  |  POST /auth/reset-password
  |  Body: { token: string, newPassword: string }
  v
AuthService.resetPassword()
  |
  ├── Find user by passwordResetToken (MySQL)
  |   └── If not found → BadRequestException("Invalid or expired reset token")
  |
  ├── Check token expiry
  |   └── If passwordResetExpires < now → BadRequestException("Reset token has expired")
  |
  ├── Hash new password (bcrypt, rounds: 10)
  |
  ├── Update user
  |   ├── password = <hashed_password>
  |   ├── passwordResetToken = null
  |   ├── passwordResetExpires = null
  |   └── loginAttempts = 0 (reset on password change)
  |
  ├── Invalidate all refresh tokens (optional security measure)
  |   └── Force re-login from all devices
  |
  ├── Audit log → PASSWORD_RESET
  |
  v
Response (200 OK)
{
  message: "Password reset successfully"
}
```

**Security Features:**
- Token expires after 1 hour
- Single-use token (cleared after use)
- Rate limiting on forgot password endpoint
- Optional: Invalidate all sessions on password reset

---

## 1️⃣1️⃣ CHANGE PASSWORD FLOW

```
Authenticated User
  |
  |  PUT /users/change-password
  |  Headers: { Authorization: "Bearer <accessToken>" }
  |  Body: { currentPassword: string, newPassword: string }
  v
UsersController.changePassword()
  |
  |  @UseGuards(JwtAuthGuard)
  v
UsersService.changePassword()
  |
  ├── Find user by userId (from token)
  |   └── If not found → NotFoundException
  |
  ├── Verify current password (bcrypt.compare)
  |   └── If invalid → BadRequestException("Current password is incorrect")
  |
  ├── Hash new password (bcrypt, rounds: 10)
  |
  ├── Update user password
  |
  ├── Audit log → PASSWORD_CHANGED
  |
  v
Response (200 OK)
{
  message: "Password changed successfully"
}
```

**Security Features:**
- Requires current password verification
- Requires authentication (JWT)
- Password hashed with bcrypt
- Audit logging

---

## 🔄 COMPLETE AUTH LIFECYCLE

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LIFECYCLE                  │
└─────────────────────────────────────────────────────────────┘

1. SIGNUP
   ↓
   User created (emailVerified = false)
   ↓
   Verification email sent
   ↓
   Access & Refresh tokens issued
   ↓
2. EMAIL VERIFICATION
   ↓
   User clicks verification link
   ↓
   emailVerified = true
   ↓
3. LOGIN
   ↓
   Credentials validated
   ↓
   Access & Refresh tokens issued
   ↓
4. ACCESS PROTECTED ROUTES
   ↓
   JWT validated on each request
   ↓
   Token blacklist checked
   ↓
   User status verified
   ↓
5. TOKEN EXPIRY
   ↓
   Access token expires (15 min)
   ↓
6. TOKEN REFRESH
   ↓
   New access & refresh tokens issued
   ↓
   Old refresh token revoked
   ↓
   Continue accessing routes
   ↓
7. LOGOUT
   ↓
   Access token blacklisted
   ↓
   Refresh token deleted
   ↓
   All tokens invalid
   ↓
   User must login again
```

---

## 📊 Data Storage Overview

### MySQL (Permanent Data)
- **Users Table:** User accounts, passwords, email verification status
- **RefreshToken Table:** Refresh tokens with metadata
- **AuditLog Table:** All authentication events

### MongoDB (Cache/TTL Data)
- **BlacklistedToken Collection:** Revoked access tokens (TTL: 15 min)
- **RateLimit Collection:** Rate limiting records (TTL: varies)
- **Session Cache:** Optional session data

---

## 🔒 Security Features Summary

✅ **Password Security**
- Bcrypt hashing (10 rounds)
- Minimum password length validation
- Current password verification for changes

✅ **Token Security**
- JWT with 15-minute expiry
- Refresh token rotation
- Token blacklisting
- Token reuse detection

✅ **Account Security**
- Email verification required
- Account lock after failed attempts
- Rate limiting on all auth endpoints
- IP and user-agent tracking

✅ **Audit & Monitoring**
- Comprehensive audit logging
- Failed attempt tracking
- Login history (lastLoginAt, lastLoginIp)

---

## 📝 API Endpoints Summary

| Method | Endpoint | Auth Required | Rate Limit |
|--------|----------|---------------|------------|
| POST | `/auth/signup` | ❌ | 3/min |
| POST | `/auth/signin` | ❌ | 5/min |
| POST | `/auth/logout` | ✅ | - |
| POST | `/auth/refresh` | ❌ | 10/min |
| POST | `/auth/verify-email` | ❌ | - |
| POST | `/auth/resend-verification` | ❌ | 3/5min |
| GET | `/auth/me` | ✅ | - |
| POST | `/auth/forgot-password` | ❌ | 3/5min |
| POST | `/auth/reset-password` | ❌ | - |
| PUT | `/users/change-password` | ✅ | - |

---

## 🎯 Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (httpOnly cookies recommended for web)
3. **Implement token rotation** (already implemented)
4. **Monitor audit logs** for suspicious activity
5. **Set appropriate rate limits** based on your use case
6. **Use email verification** to prevent fake accounts
7. **Implement account lock** to prevent brute force attacks
8. **Log all authentication events** for security auditing

---

*Last Updated: Based on current codebase implementation*
