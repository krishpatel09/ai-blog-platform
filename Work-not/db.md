# AI Blog Platform - Database Schema Documentation

// ==========================================
// 1. USER & SECURITY (Identity Management)
// ==========================================

model User {
  id          String    @id @default(uuid())
  username    String    @unique @db.VarChar(30)
  email       String    @unique @db.VarChar(255)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  security    UserSecurity?
  posts       Post[]
  comments    Comment[]
  likes       Like[]
  shares      Share[]
  reposts     Repost[]
  tokens      RefreshToken[]
  auditLogs   AuditLog[]
  aiMetadata  AiGeneration[]
}

model UserSecurity {
  id                       String    @id @default(uuid())
  userId                   String    @unique
  password                 String    @db.VarChar(255) // bcrypt hashed
  emailVerified            Boolean   @default(false)
  emailVerificationToken   String?   @unique @db.VarChar(128)
  emailVerificationExpires DateTime?
  
  user                     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==========================================
// 2. CONTENT (Blog & AI Metadata)
// ==========================================

model Post {
  id            String         @id @default(uuid())
  title         String         @db.VarChar(255)
  slug          String         @unique
  content       String         @db.Text
  coverImage    String?
  published     Boolean        @default(false)
  authorId      String
  
  // AI Specific
  isAiGenerated Boolean        @default(false)
  aiModelUsed   String?        // e.g., "GPT-4", "Gemini"
  
  // Stats (Denormalization for Speed)
  likeCount     Int            @default(0)
  commentCount  Int            @default(0)
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  // Relations
  author        User           @relation(fields: [authorId], references: [id])
  aiDetails     AiGeneration?
  likes         Like[]
  comments      Comment[]
  shares        Share[]
  reposts       Repost[]       @relation("OriginalPost")
  tags          Tag[]          @relation("PostTags")
}

model AiGeneration {
  id             String   @id @default(uuid())
  postId         String   @unique
  userId         String
  prompt         String   @db.Text
  tokensUsed     Int?
  createdAt      DateTime @default(now())

  post           Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id])
}

// ==========================================
// 3. SOCIAL ENGAGEMENT (Like, Comment, Share, Repost)
// ==========================================

model Like {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId]) // Prevent duplicate likes
}

model Comment {
  id        String    @id @default(uuid())
  content   String    @db.VarChar(1000)
  userId    String
  postId    String
  parentId  String?   // For Nested Replies
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
}

model Share {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  platform  String?  // e.g., "Twitter", "WhatsApp"
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model Repost {
  id             String   @id @default(uuid())
  userId         String
  originalPostId String
  quote          String?  @db.VarChar(255)
  createdAt      DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  originalPost   Post     @relation("OriginalPost", fields: [originalPostId], references: [id], onDelete: Cascade)
}

// ==========================================
// 4. AUTH & AUDIT (Tokens & Logs)
// ==========================================

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique @db.VarChar(128)
  userId    String
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token, isRevoked])
}

model AuditLog {
  id            String   @id @default(uuid())
  userId        String?
  action        String   @db.VarChar(50)
  ipAddress     String?  @db.VarChar(45)
  userAgent     String?  @db.VarChar(500)
  success       Boolean  @default(true)
  createdAt     DateTime @default(now())

  user          User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([action, createdAt])
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique @db.VarChar(50)
  posts Post[] @relation("PostTags")
}



