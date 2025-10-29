---
id: "authentication-readme"
title: "Authentication & Security Documentation"
category: "Authentication"
description: "Authentication system documentation covering dual-account model, verification, JWT implementation, and security features"
audience: "admin"
tags: ["authentication", "security", "jwt", "verification", "overview"]
status: "published"
version: "1.0.0"
created_at: "2025-01-28"
updated_at: "2025-01-28"
---

# Authentication & Security Documentation

## Overview
This section contains all documentation related to user authentication, security, verification systems, and access control in the Looplly platform.

## Documents in this Category

### Core Authentication
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete authentication system architecture including dual-account model and JWT implementation
- **[REGISTRATION_FLOW.md](./REGISTRATION_FLOW.md)** - User registration process and account creation workflows
- **[PASSWORD_RESET_FLOW.md](./PASSWORD_RESET_FLOW.md)** - Password reset and recovery procedures

### Validation & Verification
- **[EMAIL_VALIDATION.md](./EMAIL_VALIDATION.md)** - Email validation rules and verification processes
- **[MOBILE_VERIFICATION_SYSTEM.md](./MOBILE_VERIFICATION_SYSTEM.md)** - Mobile phone verification and OTP systems

### API Security
- **[API_AUTHENTICATION.md](./API_AUTHENTICATION.md)** - API authentication, JWT tokens, and secure endpoint access

## Quick Start

### For Developers
1. Start with [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the dual-account model
2. Review [REGISTRATION_FLOW.md](./REGISTRATION_FLOW.md) for user onboarding implementation
3. Check [API_AUTHENTICATION.md](./API_AUTHENTICATION.md) for securing your API endpoints

### For Product Managers
1. Begin with [REGISTRATION_FLOW.md](./REGISTRATION_FLOW.md) to understand user experience
2. Review [MOBILE_VERIFICATION_SYSTEM.md](./MOBILE_VERIFICATION_SYSTEM.md) for verification requirements
3. Study [PASSWORD_RESET_FLOW.md](./PASSWORD_RESET_FLOW.md) for account recovery processes

## Key Concepts

### Dual-Account Model
Looplly implements a unique dual-account architecture:
- **Admin Accounts**: Full auth.users integration (no custom JWT)
- **Regular Users**: Custom JWT-based authentication (bypass auth.users)

### Authentication Methods
- Email + Password (primary)
- Mobile verification (required for earning)
- OTP verification for password reset

### Security Features
- Custom JWT token generation
- Bcrypt password hashing
- Rate limiting on authentication endpoints
- Email and mobile validation
- Role-based access control (RBAC)

## Related Documentation
- [User Management](../users/README.md) - User roles, types, and classifications
- [Admin Portal](../admin/README.md) - Admin-specific authentication and access
- [Technical Documentation](../technical/README.md) - Database schema and data isolation

## Common Tasks

### Implementing User Registration
```typescript
// See REGISTRATION_FLOW.md for complete implementation
// Key steps: validate input → create profile → generate JWT
```

### Adding Mobile Verification
```typescript
// See MOBILE_VERIFICATION_SYSTEM.md for OTP implementation
// Requires: Twilio/SMS provider integration
```

### Securing API Endpoints
```typescript
// See API_AUTHENTICATION.md for JWT validation
// Use: JWT middleware for protected routes
```

## Need Help?
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system-wide authentication concepts
- Check [../reference/RECENT_CHANGES.md](../reference/RECENT_CHANGES.md) for latest authentication updates
- Consult [API_AUTHENTICATION.md](./API_AUTHENTICATION.md) for integration examples
