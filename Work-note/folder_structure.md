# AI Blog Platform - Folder Structure

## Back-End (NestJS)

```
back-end/
├── prisma/
│   └── schema.prisma              # Database schema definition
├── scripts/
│   ├── diagnose-db.js             # Database diagnostic scripts
│   ├── test-db-connection.js      # Database connection testing
│   └── verify-env.js              # Environment variable verification
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── dto/                   # Data Transfer Objects
│   │   │   ├── signin.dto.ts
│   │   │   ├── signup.dto.ts
│   │   │   └── verify-email.dto.ts
│   │   ├── guards/                # Auth guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── refresh-jwt.guard.ts
│   │   ├── strategies/            # Passport strategies
│   │   │   ├── jwt.strategy.ts
│   │   │   └── refresh-jwt.strategy.ts
│   │   ├── auth.controller.ts     # Auth endpoints
│   │   ├── auth.module.ts         # Auth module definition
│   │   └── auth.service.ts        # Auth business logic
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   │   └── get-user.decorator.ts
│   │   ├── filters/               # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                # Global guards
│   │   ├── interceptors/          # HTTP interceptors
│   │   ├── mail/                  # Email templates & service
│   │   │   ├── mail.service.ts
│   │   │   └── verification-email.tsx
│   │   ├── middleware/            # Custom middleware
│   │   └── pipes/                 # Validation pipes
│   ├── config/                    # Configuration files
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── mail.config.ts
│   │   └── sentry.config.ts
│   ├── prisma/                    # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── users/                     # Users module
│   │   ├── dto/
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── utils/                     # Utility functions
│   │   └── token.service.ts
│   ├── app.controller.ts          # Root controller
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── test/                          # Test files
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Front-End (Next.js)

```
front-end/
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/           # Dashboard route group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                   # API routes (if needed)
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   ├── components/                # React components
│   │   ├── auth/                  # Authentication components
│   │   │   ├── sign-in.tsx
│   │   │   ├── sign-up.tsx
│   │   │   └── verify-email.tsx
│   │   ├── dashboard/             # Dashboard components
│   │   ├── layout/                # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   └── ui/                    # Reusable UI components (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── context/                   # React Context providers
│   │   └── AuthProvider.tsx
│   ├── hooks/                     # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/                       # Libraries & utilities
│   │   ├── api/                   # API client configuration
│   │   │   ├── axiosInstance.ts
│   │   │   └── getToken.ts
│   │   ├── zod/                   # Zod validation schemas
│   │   │   └── auth/
│   │   │       └── auth.Schema.ts
│   │   └── utils.ts               # Utility functions
│   ├── services/                  # API services
│   │   ├── api/
│   │   │   └── axiosInstance.ts
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── types/                     # TypeScript type definitions
│   │   └── index.ts
│   ├── instrumentation.ts         # Sentry instrumentation
│   ├── instrumentation-client.ts  # Client-side instrumentation
│   └── proxy.ts                   # Proxy configuration
├── middleware.ts                  # Next.js middleware (auth checks)
├── .env                           # Environment variables
├── .env.sentry-build-plugin       # Sentry configuration
├── .gitignore
├── components.json                # shadcn/ui config
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── sentry.client.config.ts
├── sentry.edge.config.ts
└── sentry.server.config.ts
```

## Key Directory Purposes

### Back-End

- **`auth/`**: Handles all authentication logic (sign-up, sign-in, token management, email verification)
- **`common/`**: Shared utilities, decorators, filters, guards, interceptors, and email services
- **`config/`**: Configuration files for different aspects of the application
- **`prisma/`**: Database service and ORM integration
- **`users/`**: User management and profile operations
- **`utils/`**: Utility services like token generation and validation

### Front-End

- **`app/`**: Next.js 13+ App Router with route groups for organization
- **`components/`**: Reusable React components organized by feature
- **`context/`**: Global state management using React Context
- **`hooks/`**: Custom React hooks for shared logic
- **`lib/`**: Third-party library configurations and utilities
- **`services/`**: API integration and data fetching logic
- **`types/`**: TypeScript type definitions and interfaces

## Notes

- Both projects use TypeScript for type safety
- Back-end uses NestJS framework with Prisma ORM
- Front-end uses Next.js 13+ with App Router
- Authentication uses JWT tokens with refresh token rotation
- Email verification is handled via token-based links
- Sentry is integrated for error tracking on both sides
