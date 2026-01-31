# User Management & Authentication Schema

Aa schema focus kare che Secure Login, Token Management, ane Audit Logging par.

model User {
id String @id @default(uuid())
name String @db.VarChar(50)
username String @unique @db.VarChar(30)
email String @unique @db.VarChar(255)
avatar String?  
 bio String? @db.VarChar(160)
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

security UserSecurity?
tokens RefreshToken[]
auditLogs AuditLog[]
}

model UserSecurity {
id String @id @default(uuid())
userId String @unique
password String @db.VarChar(255)
emailVerified Boolean @default(false)
emailVerificationToken String? @unique
emailVerificationExpires DateTime?
resetToken String? @unique
resetExpires DateTime?

user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
id String @id @default(uuid())
token String @unique @db.VarChar(128)
userId String
expiresAt DateTime
isRevoked Boolean @default(false) // Security Guard: Token radd karva mate
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId])
@@index([token, isRevoked]) // Query Fast karva mate
}

// 4. Audit Log:
model AuditLog {
id String @id @default(uuid())
userId String?
action String @db.VarChar(50) // SIGNUP, LOGIN, LOGOUT, FAILED_ATTEMPT
ipAddress String? @db.VarChar(45)
userAgent String? @db.VarChar(500)
success Boolean @default(true)
details Json? // Extra info jem ke "Incorrect Password"
createdAt DateTime @default(now())

user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId])
@@index([action, createdAt])
}

i want to create this ai-blog-platform
front-end: nextjs
back-end:nestjs + prisma + neon
