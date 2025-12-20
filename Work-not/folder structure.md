src/
│
├── main.ts
├── app.module.ts
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
│       ├── login.dto.ts
│       └── signup.dto.ts
│
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│
├── posts/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   ├── posts.module.ts
│   └── dto/
│       ├── create-post.dto.ts
│       └── update-post.dto.ts
│
├── entities/
│   ├── user.entity.ts
│   └── post.entity.ts
│
├── database/
│   └── database.module.ts
│
├── common/
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── jwt.config.ts
│   │   └── database.config.ts
│   │
│   ├── constants/ (optional)
│   │   ├── app.constants.ts
│   │   └── roles.constants.ts
│   │
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   │
│   ├── enums/(optional)
│   │   └── role.enum.ts
│   │
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   │
│   └── validations/
│   │   └── password.validation.ts
│   ├── database/
│   │   └── database.module.ts
│   │
│   ├── entities/
│   │   └── user.entity.ts
│   │   └── post.entity.ts
│   │
│   ├── guards/
│       └── auth.guard.ts





