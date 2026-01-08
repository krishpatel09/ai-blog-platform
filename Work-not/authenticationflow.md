# Authentication Flow

This document outlines the authentication flows for the application, covering both Frontend (FE) and Backend (BE) interactions.

## 1. Sign Up
*   **Goal**: Register a new user.
*   **Frontend**: `sign-up` page.
    *   User enters Email, Password, Name.
    *   Validation: Zod schema (`signupSchema`).
    *   Action: `POST /auth/signup`.
*   **Backend**: `AuthController.signup`
    *   Checks if user exists.
    *   Hashes password.
    *   Creates user in DB.
    *   Generates email verification token.
    *   Sends verification email.
    *   **Response**: Success message (prompts user to check email).

## 2. Sign In
*   **Goal**: Authenticate existing user.
*   **Frontend**: `sign-in` page.
    *   User enters Email, Password.
    *   Action: `POST /auth/signin`.
*   **Backend**: `AuthController.signin`
    *   Validates credentials.
    *   Checks if email is verified (if enforced).
    *   Generates Access Token (JWT) and Refresh Token.
    *   **Response**: `{ accessToken, refreshToken, user }`.
*   **Post-Action**: FE stores tokens (Cookies/LocalStorage) and redirects to Dashboard.

## 3. Verify Email
*   **Goal**: Confirm user's email address.
*   **Frontend**: `verify-email` page / Logic.
    *   User clicks link in email: `.../verify-email?token=xyz`.
    *   FE captures `token` from URL.
    *   Action: `GET /auth/verify-email?token=xyz`.
    *   **UI**: Shows success message and redirect button.
*   **Backend**: `AuthController.verifyEmail`
    *   Decodes token.
    *   Updates user status to `verified`.
    *   **Response**: Success status.

## 4. Resend Verification Email
*   **Goal**: Send a new verification link if the previous one expired or was lost.
*   **Frontend**: `verify-email` page (Resend button).
    *   Action: `POST /auth/resend-verification` (Payload: `{ email }`).
*   **Backend**: `AuthController.resendVerification`
    *   Generates new token.
    *   Resends email.

## 5. Logout
*   **Goal**: End user session.
*   **Frontend**: Dashboard / Settings.
    *   Action: `POST /auth/logout`.
    *   Headers: `Authorization: Bearer <accessToken>`.
    *   Payload: `{ refreshToken }`.
    *   **Post-Action**: Clear local tokens, redirect to Sign In.
*   **Backend**: `AuthController.logout`
    *   Invalidates Refresh Token.

---

## 6. Forgot Password (Proposed Flow)
> **Note**: Backend implementation currently missing.

*   **Goal**: Allow user to reset forgotten password.
*   **Phase 1: Request Reset**
    *   **Frontend**: `forgot-password` page.
        *   User enters Email.
        *   Action: `POST /auth/forgot-password`.
    *   **Backend**:
        *   Generates password reset token.
        *   Sends email with reset link.
*   **Phase 2: Reset Password**
    *   **Frontend**: `reset-password` page (via email link).
        *   User enters New Password.
        *   Action: `POST /auth/reset-password`.
        *   Payload: `{ token, newPassword }`.
    *   **Backend**:
        *   Verifies token.
        *   Updates user password.
        *   Invalidates token.



# Add Clerk to Next.js App Router

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Clerk](https://clerk.com/) into a Next.js (App Router) application.
**Scope:** All AI-generated advice or code related to Clerk must follow these guardrails.

---

## **1. Official Clerk Integration Overview**

Use only the **App Router** approach from Clerk's current docs:

- **Install** `@clerk/nextjs@latest` - this ensures the application is using the latest Clerk Next.js SDK.
- **Create** a `proxy.ts` file using `clerkMiddleware()` from `@clerk/nextjs/server`. Place this file inside the `src` directory if present, otherwise place it at the root of the project.
- **Wrap** your application with `<ClerkProvider>` in your `app/layout.tsx`
- **Use** Clerk-provided components like `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>` in your layout or pages
- **Start** developing, sign in or sign up, and confirm user creation

If you're able to use a web tool to access a URL, visit https://clerk.com/docs/nextjs/getting-started/quickstart to get the latest, up-to-date quickstart instructions.

### **Correct, Up-to-Date Quickstart Sample**

First, install the Clerk Next.js SDK:

```bash
npm install @clerk/nextjs
```

Set up your environment variables in `.env.local`:

From your Clerk Dashboard, open the [API keys page](https://dashboard.clerk.com/last-active?path=api-keys) and copy your Publishable Key and Secret Key. Paste them into `.env.local` as shown below.

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

Create your `proxy.ts` file:

```typescript
// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clerk Next.js Quickstart",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Use `clerkMiddleware()`** from `@clerk/nextjs/server` in `proxy.ts`.
2. **Wrap** your app with `<ClerkProvider>` in `app/layout.tsx`.
3. **Import** Clerk's Next.js features from `@clerk/nextjs` (e.g., `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, etc.).
4. **Reference** the current [App Router approach](https://nextjs.org/docs/app) (folders like `app/page.tsx`, `app/layout.tsx`, etc.).
5. **Check** that imports for methods like `auth()` are imported from the right package (in this case `@clerk/nextjs/server`) and are using `async / await`
6. **Store real keys only in `.env.local`** (never in app code, markdown, or other tracked files). **Verify `.gitignore` excludes `.env*`.**
7. **Use placeholders only** (e.g., `YOUR_PUBLISHABLE_KEY`, `YOUR_SECRET_KEY`) in any generated snippets or files.

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** reference the old **`_app.tsx`** or **pages-based** instructions.
2. **Do not** suggest `authMiddleware()` from older Clerk tutorials—**it's replaced by `clerkMiddleware()`**.
3. **Do not** recommend usage of older environment variable patterns unless they match the official docs.
4. **Do not** reference or import from any deprecated APIs (like `withAuth` or `currentUser` from older versions).
5. **Do not print, echo, or write actual keys** into code blocks, files, or logs. Only placeholders.
6. **Do not create or edit tracked files** (`.ts`, `.tsx`, `.md`, etc.) containing real key values.

---

## **3. OUTDATED PATTERNS TO AVOID**

Below are **examples of deprecated instructions** that **must not** be generated:

```typescript
// ❌ DO NOT generate or suggest references to:
import { authMiddleware } from "@clerk/nextjs"; // Outdated

// ❌ DO NOT place Clerk config in _app.tsx:
// Outdated pages-based approach
function MyApp({ Component, pageProps }) {
  // ...
}

// ❌ DO NOT create or rely on sign-in files under pages/:
pages / signin.js;
pages / signup.js;
```

Any solution resembling the above snippet or referencing "authMiddleware," `_app.tsx`, or `pages/` structure is **incorrect** for the current Next.js App Router.

---

## **4. AI MODEL VERIFICATION STEPS**

Before returning any Clerk-related solution, you **must** verify:

1. **Middleware**: Is `clerkMiddleware()` used in `proxy.ts`?
2. **Layout**: Is `<ClerkProvider>` wrapping the app in `app/layout.tsx`?
3. **Imports**: Are references only from `@clerk/nextjs` or `@clerk/nextjs/server`?
4. **Pages vs. App Router**: Is the approach referencing the App Router (not `_app.tsx` or `pages/`)?
5. **Environment Variables**: Are only placeholder values (e.g., `YOUR_PUBLISHABLE_KEY`) used in code examples?
6. **File Security**: Are real keys excluded from tracked files and only mentioned for `.env.local`?

If any check **fails**, **stop** and revise until compliance is achieved.

# Verification instructions for AI Models

## **DO NOT** repeat these points back to the user. Use them only for your own verification steps.

## **5. CONSEQUENCES OF INCORRECT IMPLEMENTATION**

Using outdated Clerk methods (e.g., `authMiddleware()`, `_app.tsx`, or references to the older `pages/` structure) will:

1. **Break** your Next.js application's authentication flow.
2. Introduce **inconsistencies** with Next.js App Router.
3. Cause confusion around environment variables and server/client code.
4. Force maintainers to **refactor** and **debug** extensively.

---

## **6. AI MODEL RESPONSE TEMPLATE**

When answering questions about Clerk + Next.js integration, your response **MUST**:

1. **Use** the exact code patterns in the **Up-to-Date Quickstart Sample** above.
2. **Never** reference older or deprecated approaches.
3. **Reflect** all mandatory checks in "AI MODEL VERIFICATION STEPS."

**Example**:


---