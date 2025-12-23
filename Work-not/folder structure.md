ai-blog-platform/
│
├── back-end/                    # NestJS Backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── signup.dto.ts
│   │   │   └── interfaces/
│   │   │       └── auth.interface.ts
│   │   │
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.service.spec.ts
│   │   │
│   │   └── common/
│   │       ├── config/
│   │       │   ├── app.config.ts
│   │       │   ├── jwt.config.ts
│   │       │   └── supabase.config.ts
│   │       ├── decorators/
│   │       │   └── current-user.decorator.ts
│   │       ├── interface/
│   │       │   └── user.interface.ts
│   │       ├── constants/        (empty)
│   │       ├── interceptors/     (empty)
│   │       └── validations/       (empty)
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── prisma.config.ts
│   └── README.md
│
├── front-end/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── favicon.ico
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── sign-in/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── sign-up/
│   │   │   │       └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   └── auth/
│   │   │       ├── sign-in.tsx
│   │   │       └── sign-up.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   ├── supabase/
│   │   │   │   └── supabaseClient.ts
│   │   │   └── zod/
│   │   │       └── auth/
│   │   │           └── auth.Schema.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── public/
│   │   ├── WriteGen.png
│   │   ├── WriteGen.svg
│   │   └── ... (other assets)
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── README.md
│
├── Work-not/
│   ├── folder structure.md
│   ├── folder structure2.md
│   └── note.md
│
├── package.json
└── README.md
