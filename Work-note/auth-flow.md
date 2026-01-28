# Authentication Flow

This document outlines the authentication flows for the application, covering both Manual Authentication (Email/Password) and Clerk Authentication (Social Login).

## 1. Manual Authentication

The Manual Authentication flow uses a custom implementation with Email/Password, JWT Tokens (Access & Refresh), and secure HttpOnly cookies.

### Frontend

- **Sign Up Page** (`/sign-up`):
  - Collects Name, Email, Password.
  - Calls `POST /auth/signup`.
  - Redirects to Email Verification page on success.
- **Sign In Page** (`/sign-in`):
  - Collects Email, Password, Remember Me.
  - Calls `POST /auth/signin`.
  - On success:
    - Stores `accessToken` in memory/context.
    - `refreshToken` is handled automatically via HttpOnly cookie.
    - Updates AuthContext `user` state.
    - Redirects to Dashboard/Home.
- **Session Management**:
  - `AuthContext` initializes by checking for existing user data.
  - Axios interceptors attach `Authorization: Bearer <token>` to requests.
  - Axios interceptors handle 401 errors by calling `/auth/refresh-token` to rotate tokens silently.

### Backend

- **Endpoints**:
  - `POST /auth/signup`: Creates user, hashes password (Argon2/Bcrypt), sends verification email.
  - `POST /auth/signin`: Validates credentials, generates JWT Access Token & Refresh Token. Returns Access Token, sets Refresh Token as HttpOnly cookie.
  - `POST /auth/logout`: Invalidates Refresh Token, clears cookies.
  - `POST /auth/refresh-token`: Rotates Refresh Token, issues new Access Token.

---

## 2. Clerk Authentication (Social Login)

The Clerk Authentication flow integrates Clerk for OAuth (Google, Facebook) but synchronizes the session with our custom backend to maintain a unified user system.

### Frontend

- **Component** (`ClerkSocialLogin`):
  - Uses `signIn.authenticateWithRedirect` to start OAuth flow.
  - Redirects to `/auth/callback` after provider authentication.
- **Callback Handling** (`/auth/callback`):
  - Uses Clerk's `<AuthenticateWithRedirectCallback />` to complete the handshake.
  - Redirects to `/auth/sync` (or handles sync in place) to synchronize with backend.
- **Synchronization** (`/auth/sync` or specific logic):
  - Retrieves the active Clerk `sessionId`.
  - Calls Backend: `POST /auth/clerk-verify` with `{ sessionId }`.
  - **On Success**:
    - Backend returns custom Access/Refresh tokens (same as Manual Auth).
    - Frontend logs user into `AuthContext`.
    - Redirects to Dashboard.
  - **On Failure**:
    - Redirects to Sign-In with error.

### Backend

- **Endpoint**:
  - `POST /auth/clerk-verify`:
    - Verifies the `sessionId` with Clerk API.
    - Checks if user exists in local DB (by Clerk ID or Email).
    - **If User Exists**: Log them in (generate tokens).
    - **If User New**: Create new user in DB (sync details from Clerk), then log them in.
    - Returns standard Auth response (Access Token + User Data).

---

## Neat and Clean Implementation Plan

1.  **Verify Manual Auth**: Ensure Login/Signup/Verify-Email pages are polished and working.
2.  **Fix Clerk Integration**:
    - Update `ClerkSocialLogin` to redirect correctly.
    - Create/Update `auth/callback` to process the session.
    - Implement the "Sync" step to ensure Backend issues its own tokens for Clerk users.
    - Ensure `middleware.ts` respects the custom tokens generated even for Clerk users.
