┌──────────────────────┐
│      Frontend        │
│  (Next.js / Client)  │
└─────────▲────────────┘
          │ HTTPS (REST APIs)
          │ JWT (Access Token)
          ▼
┌──────────────────────────────────────────┐
│          NestJS Backend Server            │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │            Auth Module               │ │
│ │  - Signup / Login / Logout           │ │
│ │  - Refresh Token Rotation            │ │
│ │  - Email Verification                │ │
│ └───────────────▲──────────────────────┘ │
│                 │                         │
│ ┌───────────────┴──────────────────────┐ │
│ │          JWT Strategy & Guards        │ │
│ │  - JWT Validation                    │ │
│ │  - Role & Email Guards               │ │
│ │  - Token Blacklist Check             │ │
│ └───────────────▲──────────────────────┘ │
│                 │                         │
│ ┌───────────────┴──────────────────────┐ │
│ │          Cache Module (MongoDB)       │ │
│ │  - Token Blacklist                   │ │
│ │  - Rate Limiting                     │ │
│ │  - Session Cache                    │ │
│ └───────────────▲──────────────────────┘ │
│                 │                         │
│ ┌───────────────┴──────────────────────┐ │
│ │        Prisma ORM (Data Layer)        │ │
│ │  - Users                             │ │
│ │  - Refresh Tokens                   │ │
│ │  - Audit Logs                       │ │
│ └───────────────▲──────────────────────┘ │
│                 │                         │
└─────────────────┼─────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│   MySQL DB     │  │   MongoDB DB   │
│ (Permanent)    │  │ (Cache / TTL)  │
│ - Users        │  │ - Blacklisted  │
│ - RefreshToken │  │   Tokens       │
│ - AuditLogs    │  │ - Rate Limits  │
└────────────────┘  │ - Sessions     │
                     └────────────────┘
