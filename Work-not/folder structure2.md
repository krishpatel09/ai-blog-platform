ai-blog-platform/
│
├── back-end/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │
│   │   ├── config/                     # Global configs
│   │   │   ├── app.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── supabase.config.ts
│   │   │   └── database.config.ts
│   │
│   │   ├── common/                     # Shared reusable logic
│   │   │   ├── decorators/
│   │   │   │   └── current-user.decorator.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   └── response.interceptor.ts
│   │   │   │
│   │   │   ├── validations/
│   │   │   │   └── env.validation.ts
│   │   │   │
│   │   │   ├── constants/
│   │   │   │   └── app.constants.ts
│   │   │   │
│   │   │   └── interfaces/
│   │   │       └── user.interface.ts
│   │
│   │   ├── prisma/                     # Prisma DI Layer
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.service.spec.ts
│   │
│   │   ├── auth/                       # Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── signup.dto.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │
│   │   ├── users/                      # User profile
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │
│   │   ├── posts/                      # Blog posts
│   │   │   ├── posts.controller.ts
│   │   │   ├── posts.service.ts
│   │   │   ├── posts.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   └── update-post.dto.ts
│   │   │   └── entities/
│   │   │       └── post.entity.ts
│   │
│   │   ├── ai/                         # AI Content Generator
│   │   │   ├── ai.service.ts
│   │   │   ├── ai.module.ts
│   │   │   └── providers/
│   │   │       └── openai.provider.ts
│   │
│   │   ├── interactions/               # Likes, bookmarks
│   │   │   ├── likes.service.ts
│   │   │   ├── bookmarks.service.ts
│   │   │   └── interactions.module.ts
│   │
│   │   └── health/                     # Optional
│   │       └── health.controller.ts
│
│   ├── prisma/                         # Prisma schema (ROOT)
│   │   ├── schema.prisma
│   │   └── migrations/
│
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── prisma.config.ts
│   └── README.md
