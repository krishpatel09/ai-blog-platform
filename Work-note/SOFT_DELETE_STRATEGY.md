# User Deletion Strategy - Soft Delete Implementation

## Overview

The `user.deleted` webhook event handler implements a **soft delete** strategy instead of permanently removing users from the database. This document explains the rationale, implementation, and alternatives.

---

## What is Soft Delete?

**Soft Delete** means marking a record as "deleted" without actually removing it from the database.

### Implementation
```typescript
await this.prisma.user.update({
  where: { id: user.id },
  data: {
    isActive: false,  // Mark as inactive
    clerkId: null,    // Unlink from Clerk
  },
});
```

### Hard Delete (Not Used)
```typescript
await this.prisma.user.delete({
  where: { clerkId: userData.id }
});
```

---

## Why Soft Delete?

### 1. Data Integrity 🔗

**Problem with Hard Delete:**
```
User (DELETED) ← Post.authorId (orphaned!)
                ← Comment.userId (orphaned!)
                ← AuditLog.userId (orphaned!)
```

**With Soft Delete:**
```
User (isActive: false) ← Post.authorId (preserved!)
                       ← Comment.userId (preserved!)
                       ← AuditLog.userId (preserved!)
```

**Benefits:**
- Posts, comments, and other content remain intact
- Foreign key relationships don't break
- No orphaned records
- Application doesn't crash when displaying historical data

### 2. Audit Trail & Compliance 📋

**Legal Requirements:**
- GDPR requires maintaining records of data processing activities
- Financial regulations require transaction history
- Compliance audits need to trace "who did what, when"

**Example Scenario:**
```
User deletes account → Soft delete
Regulator asks: "Who created this post in 2025?"
Answer: Still available in database (user marked inactive)
```

**With Hard Delete:**
```
User deletes account → Permanently deleted
Regulator asks: "Who created this post in 2025?"
Answer: Unknown (user data lost) ❌
```

### 3. Account Recovery 🔄

**Scenario 1: Accidental Deletion**
```
User: "I accidentally deleted my account!"
Support: "No problem, we can restore it."
→ Set isActive = true, link clerkId again
```

**Scenario 2: User Returns**
```
User deletes account → Soft delete (data preserved)
6 months later: User signs up again with same email
→ Restore previous data, link new clerkId
→ User gets their posts/followers back!
```

**With Hard Delete:**
```
User deletes account → Permanently deleted
User returns → Starts from scratch (all data lost) 😞
```

### 4. Business Analytics 📊

**Soft Delete Allows:**
- Track user churn rate
- Analyze why users leave
- Measure re-activation rates
- Historical reporting

**Example Query:**
```sql
-- How many users deleted their accounts this month?
SELECT COUNT(*) 
FROM "User" 
WHERE isActive = false 
  AND "updatedAt" >= '2026-01-01';
```

---

## Implementation Details

### Step 1: Mark User as Inactive

```typescript
await this.prisma.user.update({
  where: { id: user.id },
  data: {
    isActive: false,  // Prevents login
    clerkId: null,    // Unlinks from Clerk
  },
});
```

**Effects:**
- ✅ User cannot login (authentication checks `isActive`)
- ✅ API requests fail (middleware checks `isActive`)
- ✅ User profile hidden from public view
- ✅ Data preserved in database

### Step 2: Revoke All Sessions

```typescript
await this.prisma.refreshToken.updateMany({
  where: { userId: user.id },
  data: { isRevoked: true },
});
```

**Effects:**
- ✅ All active sessions invalidated
- ✅ User logged out from all devices
- ✅ Refresh tokens no longer work
- ✅ Immediate security enforcement

### Step 3: Unlink from Clerk

```typescript
clerkId: null  // Set to null
```

**Why?**
- Allows new user to sign up with same email
- Prevents conflicts if email is reused
- Breaks connection to deleted Clerk account

---

## Comparison: Soft Delete vs Hard Delete

| Aspect | Soft Delete ✅ | Hard Delete ❌ |
|--------|---------------|----------------|
| **Data Integrity** | Preserved | Broken (orphaned records) |
| **Audit Trail** | Maintained | Lost |
| **Account Recovery** | Possible | Impossible |
| **Compliance** | GDPR compliant | May violate regulations |
| **Analytics** | Full history | Incomplete data |
| **Performance** | Slightly slower queries | Faster |
| **Storage** | Uses more space | Uses less space |
| **Complexity** | Requires `isActive` checks | Simpler |

---

## Security Considerations

### Immediate Session Termination

When a user is deleted:
1. `isActive = false` → Login blocked
2. All `RefreshToken.isRevoked = true` → Sessions invalidated
3. User cannot access any protected resources

### Authentication Flow

```typescript
// In JWT Guard or Auth Middleware
const user = await prisma.user.findUnique({ where: { id: userId } });

if (!user || !user.isActive) {
  throw new UnauthorizedException('User account is inactive');
}
```

### API Protection

All protected endpoints automatically check `isActive`:
- ❌ Inactive users cannot make API calls
- ❌ Inactive users cannot access dashboard
- ❌ Inactive users cannot perform any actions

---

## GDPR Compliance

### Right to Erasure (Article 17)

**GDPR Requirement:**
> Users have the right to request deletion of their personal data.

**Our Implementation:**
- ✅ Soft delete satisfies this requirement
- ✅ Personal data can be anonymized/pseudonymized
- ✅ User cannot access or use the account
- ✅ Data retained only for legitimate purposes (audit, compliance)

### Data Retention

**Legitimate Reasons to Retain:**
1. Legal obligations (tax records, transaction history)
2. Fraud prevention
3. Compliance audits
4. Dispute resolution

**Optional: Anonymization**
```typescript
// After soft delete, optionally anonymize PII
await this.prisma.user.update({
  where: { id: user.id },
  data: {
    email: `deleted_${user.id}@anonymized.local`,
    name: 'Deleted User',
    avatar: null,
    bio: null,
  },
});
```

---

## When to Use Hard Delete

Hard delete may be appropriate for:

1. **Test/Development Data**
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     await prisma.user.delete({ where: { id } });
   }
   ```

2. **Spam/Bot Accounts**
   ```typescript
   if (user.isSpam) {
     await prisma.user.delete({ where: { id } });
   }
   ```

3. **Explicit GDPR Erasure Request**
   ```typescript
   // After legal review and approval
   await prisma.user.delete({ where: { id } });
   ```

---

## Code Reference

### Implementation Location
[clerk.service.ts:L486-L631](file:///d:/github/ai-blog-platform/back-end/src/webhooks/clerk/clerk.service.ts#L486-L631)

### Key Methods
- `handleUserDeleted()` - Main deletion handler
- Soft delete logic with `isActive = false`
- Session revocation with `isRevoked = true`

### Database Schema
```prisma
model User {
  id       String  @id @default(uuid())
  clerkId  String? @unique
  isActive Boolean @default(true)  // ← Key field for soft delete
  // ... other fields
}
```

---

## Testing the Implementation

### Test Scenario

1. **Create a Clerk user**
   ```bash
   # User created with clerkId and isActive = true
   ```

2. **Delete user in Clerk Dashboard**
   ```bash
   # Webhook triggered
   ```

3. **Verify soft delete**
   ```sql
   SELECT id, email, isActive, clerkId 
   FROM "User" 
   WHERE email = 'test@example.com';
   
   -- Expected:
   -- isActive: false
   -- clerkId: null
   ```

4. **Verify session revocation**
   ```sql
   SELECT * FROM "RefreshToken" 
   WHERE userId = 'user-uuid';
   
   -- Expected: All tokens have isRevoked = true
   ```

5. **Test login attempt**
   ```bash
   # Should fail with "User account is inactive"
   ```

---

## Summary

**Soft Delete Strategy:**
- ✅ Preserves data integrity and relationships
- ✅ Maintains audit trail for compliance
- ✅ Enables account recovery
- ✅ Supports business analytics
- ✅ GDPR compliant
- ✅ Secure (immediate session termination)

**Trade-offs:**
- ⚠️ Requires `isActive` checks in queries
- ⚠️ Uses more database storage
- ⚠️ Slightly more complex logic

**Recommendation:**
Use soft delete as the default strategy for user accounts in production applications.
