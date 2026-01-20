generator client {
provider = "prisma-client-js"
previewFeatures = ["driverAdapters"]
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

// ==================== USER MODELS ====================

model User {
id String @id @default(uuid())
clerkId String? @unique
name String @db.VarChar(50)
username String @unique @db.VarChar(30)
email String @unique @db.VarChar(255)
avatar String?  
 bio String? @db.VarChar(160)
role UserRole @default(USER)
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
security UserSecurity?
tokens RefreshToken[]
auditLogs AuditLog[]
posts Post[]
comments Comment[]
likes Like[]
bookmarks Bookmark[]
followers Follow[] @relation("UserFollowers")
following Follow[] @relation("UserFollowing")
notifications Notification[]
readingHistory ReadingHistory[]
shares Share[]
reports Report[]

@@index([username])
@@index([email])
@@index([role])
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
isRevoked Boolean @default(false)
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId])
@@index([token, isRevoked])
}

model AuditLog {
id String @id @default(uuid())
userId String?
action String @db.VarChar(50)
ipAddress String? @db.VarChar(45)
userAgent String? @db.VarChar(500)
success Boolean @default(true)
details Json?  
 createdAt DateTime @default(now())

user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId])
@@index([action, createdAt])
}

// ==================== BLOG MODELS ====================

model Category {
id String @id @default(uuid())
name String @unique @db.VarChar(50)
slug String @unique @db.VarChar(60)
description String? @db.VarChar(255)
color String? @db.VarChar(7)
icon String? @db.VarChar(50)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

posts Post[]

@@index([slug])
}

model Tag {
id String @id @default(uuid())
name String @unique @db.VarChar(30)
slug String @unique @db.VarChar(40)
createdAt DateTime @default(now())

posts PostTag[]

@@index([slug])
}

model Post {
id String @id @default(uuid())
title String @db.VarChar(200)
slug String @unique @db.VarChar(250)
content Json
excerpt String? @db.VarChar(300)
coverImage String?  
 status PostStatus @default(DRAFT)
publishedAt DateTime?
readTime Int? // in minutes
viewCount Int @default(0)
likeCount Int @default(0)
commentCount Int @default(0)
shareCount Int @default(0)
bookmarkCount Int @default(0)
isFeatured Boolean @default(false)
allowComments Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
authorId String
author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
categoryId String?
category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

tags PostTag[]
comments Comment[]
likes Like[]
bookmarks Bookmark[]
readingHistory ReadingHistory[]
shares Share[]
reports Report[]

@@index([authorId])
@@index([categoryId])
@@index([slug])
@@index([status, publishedAt])
@@index([isFeatured, publishedAt])
@@index([viewCount])
@@index([likeCount])
}

model PostTag {
id String @id @default(uuid())
postId String
tagId String

post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
tag Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)

@@unique([postId, tagId])
@@index([postId])
@@index([tagId])
}

// ==================== INTERACTION MODELS ====================

model Comment {
id String @id @default(uuid())
content String @db.Text
isEdited Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
postId String
post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
authorId String
author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
parentId String?
parent Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
replies Comment[] @relation("CommentReplies")

likes CommentLike[]
reports Report[]

@@index([postId, createdAt])
@@index([authorId])
@@index([parentId])
}

model Like {
id String @id @default(uuid())
createdAt DateTime @default(now())

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
postId String
post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

@@unique([userId, postId])
@@index([postId])
@@index([userId])
@@index([createdAt])
}

model CommentLike {
id String @id @default(uuid())
createdAt DateTime @default(now())

userId String
commentId String
comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)

@@unique([userId, commentId])
@@index([commentId])
@@index([createdAt])
}

model Bookmark {
id String @id @default(uuid())
createdAt DateTime @default(now())

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
postId String
post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

@@unique([userId, postId])
@@index([userId])
@@index([postId])
}

model Share {
id String @id @default(uuid())
platform SharePlatform
createdAt DateTime @default(now())

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
postId String
post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

@@index([postId])
@@index([userId])
@@index([createdAt])
@@index([platform])
}

model Follow {
id String @id @default(uuid())
createdAt DateTime @default(now())

followerId String
follower User @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
followingId String
following User @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)

@@unique([followerId, followingId])
@@index([followerId])
@@index([followingId])
}

// ==================== ENGAGEMENT MODELS ====================

model ReadingHistory {
id String @id @default(uuid())
progress Int @default(0) // percentage 0-100
lastReadAt DateTime @default(now())
completedAt DateTime?

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
postId String
post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

@@unique([userId, postId])
@@index([userId, lastReadAt])
}

model Notification {
id String @id @default(uuid())
type NotificationType
message String @db.VarChar(255)
link String? @db.VarChar(500)
isRead Boolean @default(false)
createdAt DateTime @default(now())

userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId, isRead, createdAt])
}

model Report {
id String @id @default(uuid())
reason ReportReason
details String? @db.Text
status ReportStatus @default(PENDING)
createdAt DateTime @default(now())
resolvedAt DateTime?
resolvedBy String? // Admin user ID who resolved

reporterId String
reporter User @relation(fields: [reporterId], references: [id], onDelete: Cascade)
postId String?
post Post? @relation(fields: [postId], references: [id], onDelete: Cascade)
commentId String?
comment Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

@@index([status, createdAt])
@@index([reporterId])
}

// ==================== ANALYTICS MODELS (Admin Only) ====================

model DailyAnalytics {
id String @id @default(uuid())
date DateTime @unique @db.Date

// User metrics
newUsers Int @default(0)
activeUsers Int @default(0)
totalUsers Int @default(0)

// Post metrics
newPosts Int @default(0)
publishedPosts Int @default(0)
totalViews Int @default(0)

// Engagement metrics
totalLikes Int @default(0)
totalComments Int @default(0)
totalShares Int @default(0)
totalBookmarks Int @default(0)

createdAt DateTime @default(now())

@@index([date])
}

model PostAnalytics {
id String @id @default(uuid())
postId String @unique
date DateTime @db.Date

views Int @default(0)
uniqueViews Int @default(0)
likes Int @default(0)
comments Int @default(0)
shares Int @default(0)
bookmarks Int @default(0)
avgReadTime Int @default(0) // seconds
bounceRate Float @default(0) // percentage

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([postId, date])
@@index([date])
}

// ==================== ENUMS ====================

enum UserRole {
USER
ADMIN
}

enum PostStatus {
DRAFT
PUBLISHED
ARCHIVED
}

enum SharePlatform {
TWITTER
FACEBOOK
LINKEDIN
REDDIT
WHATSAPP
TELEGRAM
COPY_LINK
}

enum NotificationType {
NEW_FOLLOWER
NEW_COMMENT
COMMENT_REPLY
POST_LIKED
COMMENT_LIKED
POST_SHARED
MENTION
SYSTEM
}

enum ReportReason {
SPAM
HARASSMENT
HATE_SPEECH
MISINFORMATION
COPYRIGHT
ADULT_CONTENT
OTHER
}

enum ReportStatus {
PENDING
REVIEWED
RESOLVED
DISMISSED
}
