// ==================== BLOG MODELS ====================

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
userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
categoryId String?
category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

tags PostTag[]
comments Comment[]
likes Like[]
bookmarks Bookmark[]
readingHistory ReadingHistory[]
shares Share[]
reports Report[]

@@index([userId])
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
