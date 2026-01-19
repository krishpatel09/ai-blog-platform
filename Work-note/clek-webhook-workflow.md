# Clerk Webhook Workflow - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Webhook Flow](#webhook-flow)
4. [Event Types](#event-types)
5. [Security Flow](#security-flow)
6. [Data Synchronization](#data-synchronization)
7. [Error Handling](#error-handling)

---

## Overview

Clerk webhooks enable real-time synchronization between Clerk's authentication service and your local database. When user events occur on Clerk (create, update, delete), Clerk sends HTTP POST requests to your webhook endpoint.

**Key Benefits:**
- ✅ Automatic user synchronization
- ✅ Real-time updates
- ✅ Secure signature verification
- ✅ Hybrid authentication support

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "Clerk Cloud"
        A[User Action] --> B[Clerk Event System]
        B --> C{Event Type}
        C -->|user.created| D[Generate Webhook]
        C -->|user.updated| D
        C -->|user.deleted| D
        D --> E[Sign with Svix Secret]
    end
    
    subgraph "Your Server"
        F[Webhook Endpoint<br/>/webhooks/clerk] --> G[ClerkWebhookController]
        G --> H[Extract Headers & Body]
        H --> I[ClerkWebhookService]
        I --> J{Verify Signature}
        J -->|Invalid| K[Return 400 Error]
        J -->|Valid| L{Event Type?}
        L -->|user.created| M[handleUserCreated]
        L -->|user.updated| N[handleUserUpdated]
        L -->|user.deleted| O[handleUserDeleted]
        M --> P[Database Operations]
        N --> P
        O --> P
        P --> Q[Return 200 OK]
    end
    
    subgraph "Database"
        P --> R[(User Table)]
        P --> S[(UserSecurity Table)]
        P --> T[(RefreshToken Table)]
    end
    
    E -.HTTP POST.-> F
    Q -.Success Response.-> B
    
    style A fill:#e1f5ff
    style B fill:#fff4e6
    style F fill:#e8f5e9
    style J fill:#fff3e0
    style P fill:#f3e5f5
    style R fill:#e0f2f1
    style S fill:#e0f2f1
    style T fill:#e0f2f1
```

---

## Webhook Flow

### Complete Request-Response Flow

```mermaid
sequenceDiagram
    participant User
    participant Clerk
    participant Localtunnel
    participant Controller
    participant Service
    participant Svix
    participant Database
    
    User->>Clerk: Sign Up / Update / Delete
    activate Clerk
    Clerk->>Clerk: Generate Event
    Clerk->>Clerk: Create Payload
    Clerk->>Clerk: Sign with HMAC (Svix)
    
    Clerk->>Localtunnel: POST /webhooks/clerk<br/>(Headers + Body)
    activate Localtunnel
    Localtunnel->>Controller: Forward Request
    deactivate Localtunnel
    
    activate Controller
    Controller->>Controller: Extract Raw Body
    Controller->>Controller: Extract Svix Headers
    Controller->>Service: handleWebhook(body, headers)
    deactivate Controller
    
    activate Service
    Service->>Svix: verify(body, headers, secret)
    activate Svix
    Svix->>Svix: Check Timestamp
    Svix->>Svix: Verify HMAC Signature
    
    alt Signature Invalid
        Svix-->>Service: Throw Error
        Service-->>Controller: BadRequestException
        Controller-->>Clerk: 400 Bad Request
    else Signature Valid
        Svix-->>Service: Return Parsed Event
        deactivate Svix
        
        Service->>Service: Route to Handler
        
        alt user.created
            Service->>Database: Upsert User
            Service->>Database: Create UserSecurity
        else user.updated
            Service->>Database: Update User
        else user.deleted
            Service->>Database: Soft Delete User
            Service->>Database: Revoke Tokens
        end
        
        activate Database
        Database-->>Service: Success
        deactivate Database
        
        Service->>Service: Log Success
        Service-->>Controller: void
        Controller-->>Clerk: 200 OK
    end
    deactivate Service
    deactivate Clerk
```

---

## Event Types

### 1. user.created Event

**Triggered When:**
- New user signs up via Clerk
- Admin creates user in Clerk Dashboard
- User signs in with OAuth for first time

**Flow Diagram:**

```mermaid
flowchart TD
    A[user.created Event] --> B{Email Exists<br/>in Database?}
    
    B -->|Yes| C[Account Linking]
    B -->|No| D[New User Creation]
    
    C --> E[Update Existing User]
    E --> F[Set clerkId]
    E --> G[Update Profile Info]
    E --> H[Set emailVerified = true]
    
    D --> I[Create New User]
    I --> J[Set clerkId]
    I --> K[Set Profile Info]
    I --> L[Create UserSecurity]
    L --> M[password = empty string]
    L --> N[emailVerified = true]
    
    H --> O[Success Response]
    N --> O
    
    style A fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#e8f5e9
    style O fill:#c8e6c9
```

**Data Mapping:**

| Clerk Field | Database Field | Transformation |
|------------|----------------|----------------|
| `id` | `clerkId` | Direct mapping |
| `email_addresses[0].email_address` | `email` | Extract primary email |
| `first_name + last_name` | `name` | Concatenate, fallback to username |
| `username` | `username` | Fallback to email prefix |
| `image_url` | `avatar` | Direct mapping |
| N/A | `emailVerified` | Set to `true` |
| N/A | `password` | Empty string for Clerk users |

### 2. user.updated Event

**Triggered When:**
- User updates profile in Clerk
- User changes email/name/avatar
- Admin updates user in Clerk Dashboard

**Flow Diagram:**

```mermaid
flowchart TD
    A[user.updated Event] --> B{Find User<br/>by clerkId}
    
    B -->|Not Found| C[Log Warning]
    C --> D[Call handleUserCreated]
    D --> E[Create as New User]
    
    B -->|Found| F[Update User Record]
    F --> G[Update email]
    F --> H[Update name]
    F --> I[Update avatar]
    
    E --> J[Success Response]
    I --> J
    
    style A fill:#e3f2fd
    style C fill:#fff3e0
    style F fill:#e1bee7
    style J fill:#c8e6c9
```

### 3. user.deleted Event

**Triggered When:**
- User deletes account in Clerk
- Admin deletes user in Clerk Dashboard
- User account is banned/suspended

**Flow Diagram:**

```mermaid
flowchart TD
    A[user.deleted Event] --> B{Find User<br/>by clerkId}
    
    B -->|Not Found| C[Log Warning]
    C --> D[Skip Deletion]
    
    B -->|Found| E[Soft Delete Strategy]
    
    E --> F[Set isActive = false]
    E --> G[Set clerkId = null]
    E --> H[Revoke All Tokens]
    
    F --> I[User Cannot Login]
    G --> J[Unlinked from Clerk]
    H --> K[All Sessions Invalidated]
    
    I --> L[Data Preserved]
    J --> L
    K --> L
    
    L --> M[Success Response]
    D --> M
    
    style A fill:#e3f2fd
    style E fill:#ffebee
    style L fill:#fff9c4
    style M fill:#c8e6c9
```

**Why Soft Delete?**

```mermaid
graph LR
    A[Soft Delete] --> B[Data Integrity]
    A --> C[Audit Trail]
    A --> D[Account Recovery]
    A --> E[GDPR Compliant]
    
    B --> F[Posts Preserved]
    B --> G[Comments Preserved]
    B --> H[No Orphaned Data]
    
    C --> I[Compliance]
    C --> J[Legal Requirements]
    
    D --> K[User Can Return]
    D --> L[Data Restoration]
    
    style A fill:#ffebee
    style B fill:#e8f5e9
    style C fill:#e3f2fd
    style D fill:#fff3e0
    style E fill:#f3e5f5
```

---

## Security Flow

### Svix Signature Verification

```mermaid
sequenceDiagram
    participant Clerk
    participant Webhook
    participant Svix
    participant Handler
    
    Note over Clerk: Generate Event Payload
    Clerk->>Clerk: payload = JSON.stringify(event)
    Clerk->>Clerk: timestamp = Date.now()
    Clerk->>Clerk: id = generateId()
    
    Note over Clerk: Create Signature
    Clerk->>Clerk: message = id + "." + timestamp + "." + payload
    Clerk->>Clerk: signature = HMAC-SHA256(message, secret)
    
    Clerk->>Webhook: POST with Headers:<br/>svix-id: {id}<br/>svix-timestamp: {timestamp}<br/>svix-signature: {signature}
    
    activate Webhook
    Webhook->>Svix: verify(payload, headers, secret)
    
    activate Svix
    Svix->>Svix: Reconstruct message
    Svix->>Svix: Calculate expected signature
    Svix->>Svix: Compare signatures
    
    alt Signatures Match
        Svix->>Svix: Check timestamp (prevent replay)
        Svix-->>Webhook: ✅ Valid Event
        Webhook->>Handler: Process Event
    else Signatures Don't Match
        Svix-->>Webhook: ❌ Invalid Signature
        Webhook-->>Clerk: 400 Bad Request
    end
    deactivate Svix
    deactivate Webhook
```

**Security Checks:**

1. **HMAC Signature Verification**
   - Ensures request came from Clerk
   - Prevents tampering with payload
   - Uses shared secret (CLERK_WEBHOOK_SECRET)

2. **Timestamp Validation**
   - Prevents replay attacks
   - Rejects old requests
   - Configurable tolerance window

3. **Request Origin**
   - Only accepts requests from Clerk IPs (optional)
   - Can add IP whitelist for extra security

---

## Data Synchronization

### Account Linking Flow

```mermaid
flowchart TD
    A[Webhook: user.created] --> B{Check Email<br/>in Database}
    
    B -->|Email Exists| C[Existing Manual User]
    B -->|Email Not Exists| D[New Clerk User]
    
    C --> E[Scenario: Account Linking]
    E --> F[User signed up manually<br/>with email/password]
    E --> G[Now signs in with Clerk<br/>OAuth/Social]
    
    F --> H[Upsert Operation]
    G --> H
    
    H --> I[Update Record]
    I --> J[Add clerkId to existing user]
    I --> K[Keep existing password]
    I --> L[Set emailVerified = true]
    I --> M[Update profile info]
    
    D --> N[Create New Record]
    N --> O[Set clerkId]
    N --> P[Create UserSecurity]
    N --> Q[password = empty string]
    N --> R[emailVerified = true]
    
    L --> S[Hybrid Auth Enabled]
    R --> S
    
    S --> T[User can login with:<br/>1. Clerk OAuth<br/>2. Email/Password]
    
    style A fill:#e3f2fd
    style E fill:#fff3e0
    style H fill:#e1bee7
    style S fill:#c8e6c9
    style T fill:#81c784
```

### Database Transaction Flow

```mermaid
sequenceDiagram
    participant Service
    participant Transaction
    participant UserTable
    participant SecurityTable
    participant TokenTable
    
    Service->>Transaction: BEGIN TRANSACTION
    activate Transaction
    
    alt user.created / user.updated
        Transaction->>UserTable: UPSERT User
        activate UserTable
        UserTable-->>Transaction: User Record
        deactivate UserTable
        
        Transaction->>SecurityTable: CREATE/UPDATE UserSecurity
        activate SecurityTable
        SecurityTable-->>Transaction: Security Record
        deactivate SecurityTable
        
        Transaction->>Transaction: COMMIT
        Transaction-->>Service: ✅ Success
        
    else user.deleted
        Transaction->>UserTable: UPDATE User<br/>(isActive=false, clerkId=null)
        activate UserTable
        UserTable-->>Transaction: Updated
        deactivate UserTable
        
        Transaction->>TokenTable: UPDATE RefreshTokens<br/>(isRevoked=true)
        activate TokenTable
        TokenTable-->>Transaction: Tokens Revoked
        deactivate TokenTable
        
        Transaction->>Transaction: COMMIT
        Transaction-->>Service: ✅ Success
    end
    
    deactivate Transaction
    
    Note over Service,TokenTable: If any step fails, entire transaction rolls back
```

---

## Error Handling

### Error Flow Diagram

```mermaid
flowchart TD
    A[Webhook Request] --> B{Signature Valid?}
    
    B -->|No| C[BadRequestException]
    C --> D[Log Error]
    D --> E[Return 400]
    
    B -->|Yes| F{Event Type Known?}
    
    F -->|No| G[Log Warning]
    G --> H[Return 200 OK]
    
    F -->|Yes| I[Process Event]
    
    I --> J{Database Operation}
    
    J -->|Success| K[Log Success]
    K --> L[Return 200 OK]
    
    J -->|Failure| M[InternalServerErrorException]
    M --> N[Log Error with Stack]
    N --> O[Return 500]
    
    O --> P[Clerk Retries]
    P --> Q{Retry Count < 3?}
    Q -->|Yes| A
    Q -->|No| R[Mark as Failed]
    
    style C fill:#ffcdd2
    style M fill:#ffcdd2
    style K fill:#c8e6c9
    style L fill:#c8e6c9
```

### Retry Mechanism

```mermaid
sequenceDiagram
    participant Clerk
    participant Webhook
    participant Database
    
    Clerk->>Webhook: Attempt 1
    activate Webhook
    Webhook->>Database: Operation
    Database-->>Webhook: ❌ Error
    Webhook-->>Clerk: 500 Error
    deactivate Webhook
    
    Note over Clerk: Wait 5 seconds
    
    Clerk->>Webhook: Attempt 2
    activate Webhook
    Webhook->>Database: Operation
    Database-->>Webhook: ❌ Error
    Webhook-->>Clerk: 500 Error
    deactivate Webhook
    
    Note over Clerk: Wait 25 seconds
    
    Clerk->>Webhook: Attempt 3
    activate Webhook
    Webhook->>Database: Operation
    Database-->>Webhook: ✅ Success
    Webhook-->>Clerk: 200 OK
    deactivate Webhook
    
    Note over Clerk: Success - Stop Retrying
```

**Clerk Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: After 5 seconds
- Attempt 3: After 25 seconds
- Attempt 4: After 125 seconds (2 minutes)
- After 4 failures: Marked as failed in Clerk Dashboard

---

## Complete System Flow

### End-to-End Process

```mermaid
graph TB
    subgraph "1. User Action"
        A1[User Signs Up on Clerk]
        A2[User Updates Profile]
        A3[User Deletes Account]
    end
    
    subgraph "2. Clerk Processing"
        B1[Event Generated]
        B2[Payload Created]
        B3[HMAC Signature]
        B4[Add Headers]
    end
    
    subgraph "3. Network Layer"
        C1[Localtunnel/Public URL]
        C2[Forward to NestJS]
    end
    
    subgraph "4. NestJS Controller"
        D1[Receive POST Request]
        D2[Extract Raw Body]
        D3[Extract Svix Headers]
        D4[@Public Decorator<br/>Bypass JWT]
    end
    
    subgraph "5. Service Layer"
        E1[Verify Signature]
        E2[Parse Event]
        E3[Route to Handler]
    end
    
    subgraph "6. Event Handlers"
        F1[handleUserCreated]
        F2[handleUserUpdated]
        F3[handleUserDeleted]
    end
    
    subgraph "7. Database Operations"
        G1[Upsert User]
        G2[Create/Update Security]
        G3[Soft Delete]
        G4[Revoke Tokens]
    end
    
    subgraph "8. Response"
        H1[Log Success]
        H2[Return 200 OK]
        H3[Clerk Marks Delivered]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    
    B1 --> B2 --> B3 --> B4
    
    B4 --> C1 --> C2
    
    C2 --> D1 --> D2 --> D3 --> D4
    
    D4 --> E1 --> E2 --> E3
    
    E3 --> F1
    E3 --> F2
    E3 --> F3
    
    F1 --> G1 --> G2
    F2 --> G1
    F3 --> G3 --> G4
    
    G2 --> H1
    G4 --> H1
    
    H1 --> H2 --> H3
    
    style A1 fill:#e3f2fd
    style A2 fill:#e3f2fd
    style A3 fill:#e3f2fd
    style E1 fill:#fff3e0
    style G1 fill:#e8f5e9
    style H3 fill:#c8e6c9
```

---

## Implementation Summary

### File Structure

```
src/webhooks/clerk/
├── clerk.module.ts          # Module configuration
├── clerk.controller.ts      # POST /webhooks/clerk endpoint
└── clerk.service.ts         # Business logic & handlers
```

### Key Technologies

- **Svix**: Webhook signature verification
- **NestJS**: Framework for webhook endpoint
- **Prisma**: Database ORM for user sync
- **Localtunnel**: Local development tunnel

### Configuration Required

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

### Clerk Dashboard Setup

1. Navigate to Webhooks
2. Add endpoint: `https://your-domain.com/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret to `.env`

---

## Testing Workflow

```mermaid
flowchart LR
    A[Start NestJS Server] --> B[Start Localtunnel]
    B --> C[Configure Clerk Webhook]
    C --> D[Create Test User]
    D --> E[Check Logs]
    E --> F{Success?}
    F -->|Yes| G[Verify Database]
    F -->|No| H[Check Error Logs]
    H --> I[Fix Issue]
    I --> D
    G --> J[Test Update Event]
    J --> K[Test Delete Event]
    K --> L[All Tests Pass ✅]
    
    style A fill:#e3f2fd
    style L fill:#c8e6c9
    style H fill:#ffcdd2
```

---

## Conclusion

This webhook system provides:
- ✅ **Real-time synchronization** between Clerk and your database
- ✅ **Secure verification** using Svix HMAC signatures
- ✅ **Hybrid authentication** supporting both Clerk and manual signup
- ✅ **Account linking** for seamless user experience
- ✅ **Soft delete** preserving data integrity
- ✅ **Comprehensive error handling** with automatic retries
- ✅ **Production-ready** with logging and monitoring

The implementation ensures your local database stays perfectly in sync with Clerk while maintaining security, data integrity, and compliance requirements.
