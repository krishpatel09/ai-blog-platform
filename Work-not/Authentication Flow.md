1️⃣ SIGNUP FLOW
Client
  |
  |  POST /auth/signup
  |  (username, email, password)
  v
AuthController
  |
  v
AuthService.signup()
  |
  |-- Rate limit check (MongoDB: RateLimit collection)
  |
  |-- Check user exists (MySQL via Prisma)
  |
  |-- Hash password (bcrypt)
  |
  |-- Create user (emailVerified = false)
  |
  |-- Generate email verification token
  |
  |-- Send verification email
  |
  |-- Generate access token (JWT – 15 min)
  |
  |-- Generate refresh token (MySQL table)
  |
  |-- Audit log → SIGNUP
  |
  v
Response
{
  accessToken,
  refreshToken,
  user,
  message
}

2️⃣ EMAIL VERIFICATION FLOW
User clicks email link
  |
  |  GET /auth/verify-email?token=xxxx
  v
AuthService.verifyEmail()
  |
  |-- Find user by emailVerificationToken
  |
  |-- Mark emailVerified = true
  |
  |-- Remove verification token
  |
  |-- Audit log → EMAIL_VERIFIED
  |
  v
Response
{
  message: "Email verified successfully"
}


3️⃣ LOGIN FLOW
Client
  |
  |  POST /auth/login
  |  (email, password)
  v
AuthController
  |
  v
AuthService.login()
  |
  |-- Rate limit check (MongoDB)
  |
  |-- Find user (MySQL)
  |
  |-- Check account lock
  |
  |-- Compare password (bcrypt)
  |
  |-- Reset loginAttempts
  |
  |-- Update lastLoginAt & IP
  |
  |-- Generate access token (JWT)
  |
  |-- Generate refresh token (MySQL)
  |
  |-- Audit log → LOGIN
  |
  v
Response
{
  accessToken,
  refreshToken,
  user
}

4️⃣ ACCESS PROTECTED ROUTES FLOW
Client
  |
  |  Authorization: Bearer <accessToken>
  v
JwtAuthGuard
  |
  v
JwtStrategy
  |
  |-- Check token signature
  |
  |-- Check token expiry
  |
  |-- Check MongoDB blacklist
  |
  |-- Check user exists & isActive
  |
  v
Controller Access Granted

##❌ If token blacklisted → Unauthorized


5️⃣ TOKEN REFRESH FLOW (Rotation)
Client
  |
  |  POST /auth/refresh
  |  (refreshToken)
  v
AuthService.refreshToken()
  |
  |-- Validate refresh token (MySQL)
  |
  |-- Check revoked / expired
  |
  |-- Generate NEW access token
  |
  |-- Generate NEW refresh token
  |
  |-- Revoke old refresh token
  |
  |-- Audit log → TOKEN_REFRESH
  |
  v
Response
{
  accessToken,
  refreshToken,
  user
}
## 🛡️ Token reuse detected → revoke all sessions


6️⃣ LOGOUT FLOW (Immediate)
Client
  |
  |  POST /auth/logout
  |  (refreshToken + accessToken)
  v
AuthService.logout()
  |
  |-- Validate refresh token
  |
  |-- Blacklist access token (MongoDB)
  |
  |-- Delete refresh token (MySQL)
  |
  |-- Audit log → LOGOUT
  |
  v
Response
{
  message: "Logged out successfully"
}
🔥 Access token becomes invalid immediately (MongoDB blacklist)


7️⃣ RATE LIMIT FLOW (MongoDB)
Request
  |
  v
CacheService.checkRateLimit()
  |
  |-- Find rate-limit record
  |-- Increment attempts
  |-- Auto-expire via TTL index
  |
  v
Allowed / Blocked
##Used for:
    Signup
    Login
    Forgot password


8️⃣ ACCOUNT LOCK FLOW
Wrong Password
  |
  v
loginAttempts++
  |
  |-- If >= 5
  |-- lockedUntil = now + 15 min
  |
  v
Account Locked


9️⃣ TOKEN BLACKLIST FLOW (MongoDB)
Logout / Reuse Detected
  |
  v
CacheService.blacklistToken()
  |
  |-- Store token with TTL
  |
  |-- Auto delete after expiry

Used for:
    Logout
    Force logout
    Token reuse attack


🔄 COMPLETE AUTH LIFECYCLE (One View)
Signup → Verify Email → Login
   ↓
Access APIs (JWT)
   ↓
Token Expired
   ↓
Refresh Token
   ↓
Continue
   ↓
Logout
   ↓
All tokens invalid

