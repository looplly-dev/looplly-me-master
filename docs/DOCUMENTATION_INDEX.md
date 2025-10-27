---
title: "Documentation Index"
slug: "documentation-index"
category: "Getting Started"
tags: ["navigation", "index", "reference"]
description: "Master index of all Looplly documentation with categorized navigation"
author: "Nadia Gaspari"
technical_content: "AI-Generated with Human Review"
version: 1.0
status: "published"
created_at: "2025-01-27"
updated_at: "2025-01-27"
change_summary: "Initial creation - comprehensive documentation index for Knowledge Centre navigation"
audience: ["admin", "developer"]
seo_title: "Looplly Documentation Index | Complete Guide"
seo_description: "Complete index of all Looplly platform documentation including authentication, user management, admin guides, and technical references"
seo_keywords: ["documentation", "index", "navigation", "guides", "reference"]
---

# Documentation Index

## Overview

Welcome to the Looplly Knowledge Centre. This index provides categorized access to all platform documentation with brief descriptions to help you find what you need quickly.

## 📚 Documentation Categories

### 🔐 Authentication & Security (7 documents)

**Core Authentication**
- **[Authentication Architecture](AUTHENTICATION_ARCHITECTURE.md)** (v3.0) - Complete authentication system overview covering Custom JWT for regular users, Supabase Auth for admins, session isolation, and security model
- **[API Authentication](API_AUTHENTICATION.md)** (v1.0) - Developer guide for authentication methods, JWT structure, validation, and RLS policy enforcement across all user types
- **[Edge Functions Guide](EDGE_FUNCTIONS_GUIDE.md)** (v1.0) - Comprehensive guide to edge functions covering authentication, user context, security patterns, and best practices

**User Management**
- **[User Classification](USER_CLASSIFICATION.md)** (v3.0) - Database architecture and characteristics of looplly_user, looplly_team_user, and future client_user types
- **[User Type Management](USER_TYPE_MANAGEMENT.md)** (v2.5) - Managing different user types with authentication flows, access control, and security rules
- **[Role Architecture](ROLE_ARCHITECTURE.md)** (v3.0) - Security-first role-based access control system with server-side enforcement, permissions matrix, and attack mitigation

**Role Security**
- **[Role Security Migration Guide](ROLE_SECURITY_MIGRATION.md)** (v1.0) - Step-by-step guide for migrating from insecure role storage to database-enforced role architecture

**Password Management**
- **[Password Reset Flow](PASSWORD_RESET_FLOW.md)** (v1.5) - Password reset and management flows for both regular users (Custom JWT) and team members (Supabase Auth)

---

### 👥 User Management (5 documents)

**User System**
- **[User Classification](USER_CLASSIFICATION.md)** (v3.0) - User type definitions, database structure, and access controls
- **[User Type Management](USER_TYPE_MANAGEMENT.md)** (v2.5) - Detailed user type management guide
- **[Account Management](ACCOUNT_MANAGEMENT.md)** - User account lifecycle, profile management, and data privacy

**Onboarding**
- **[Registration Flow](REGISTRATION_FLOW.md)** (v2.0) - Complete registration journey from signup through earning activation with Custom JWT authentication
- **[Mobile Verification System](MOBILE_VERIFICATION_SYSTEM.md)** (v1.5) - Mobile-based verification architecture, OTP flow, and security considerations

---

### 🛡️ Admin Portal (4 documents)

**Admin Guides**
   - **[Admin Platform Guide](admin/PLATFORM_GUIDE.md)** (v2.0) - Plain-English admin guide covering authentication, team management, and portal features
   - **[Admin Portal Guide](admin/PORTAL_GUIDE.md)** (v2.0) - Complete admin portal documentation including authentication, authorization, and feature navigation
- **[Role Architecture](ROLE_ARCHITECTURE.md)** (v3.0) - Security-first role system with hierarchical permissions and server-side enforcement

**Configuration**
- **[Country Blocklist Management](docs/AdminCountryBlocklist.md)** - Managing restricted countries and blocklist rules

---

### 🧪 Testing & Simulation (3 documents)

**Simulator System**
- **[Simulator Architecture](SIMULATOR_ARCHITECTURE.md)** (v2.0) - Complete simulator system for testing user journeys with isolated test accounts and stage management
- **[Testing Simulator Guide](TESTING_SIMULATOR_GUIDE.md)** (v1.0) - Step-by-step guide to using the simulator for testing different user states and flows
- **[Feature Testing Catalog](FEATURE_TESTING_CATALOG.md)** - Comprehensive test scenarios for all platform features

---

### 📋 Feature Documentation - PROFILING (9 documents)

**Admin Profiling Guides**
- **[PROFILING: Admin Guide](PROFILING/ADMIN_GUIDE.md)** (v1.3) - Administrator guide for managing profile questions, country options, and targeting
- **[PROFILING: Admin Auto-Generation Guide](PROFILING/ADMIN_AUTO_GENERATION_GUIDE.md)** (v1.3) - Using AI to auto-generate country-specific question options
- **[PROFILING: Question Builder Guide](PROFILING/QUESTION_BUILDER_GUIDE.md)** (v1.3) - Step-by-step guide to creating and configuring profile questions

**User Profiling Guides**
- **[PROFILING: User Guide](PROFILING/USER_GUIDE.md)** (v1.3) - End-user documentation for completing profile questions and understanding benefits
- **[PROFILING: Integration Guide](PROFILING/INTEGRATION_GUIDE.md)** (v1.3) - Developer guide for integrating profiling system with other features

**Technical Profiling Docs**
- **[PROFILING: Architecture](PROFILING/ARCHITECTURE.md)** (v1.3) - Technical architecture of the profiling system including database schema and data flow
- **[PROFILING: Country Question Management](PROFILING/COUNTRY_QUESTION_MANAGEMENT.md)** (v1.3) - Managing country-specific question options and localization
- **[PROFILING: Decay System](PROFILING/DECAY_SYSTEM.md)** - Profile data staleness detection and refresh prompts
- **[PROFILING: Auto-Scaling System](PROFILING/AUTO_SCALING_SYSTEM.md)** - Automatic question adjustment based on user engagement

**Strategic Profiling Docs**
- **[PROFILING: Level Strategy](PROFILING/LEVEL_STRATEGY.md)** - Profile level progression and completion requirements
- **[PROFILING: Contextual Triggers](PROFILING/CONTEXTUAL_TRIGGERS.md)** - Context-aware question triggering logic
- **[PROFILING: Earning Rules](PROFILING/EARNING_RULES.md)** - Relationship between profile completion and earning opportunities
- **[PROFILING: Global vs Local Brands](PROFILING/GLOBAL_VS_LOCAL_BRANDS.md)** - Managing global and country-specific brand targeting

---

### 🎯 Feature Documentation - Other (8 documents)

**Core Features**
- **[Reputation & Streaks System](STREAK_REPUTATION_SYSTEM.md)** - Reputation scoring, streak tracking, and tier progression
- **[Rep Classification System](REP_CLASSIFICATION_SYSTEM.md)** - User reputation classification logic and benefits
- **[Profile System Architecture](PROFILE_SYSTEM_ARCHITECTURE.md)** - Complete profile system with levels, completeness scoring, and data management
- **[Profile Decay System](PROFILE_DECAY_SYSTEM.md)** - Automatic detection of stale profile data and refresh mechanisms

**Mobile Features**
- **[Mobile Validation](MOBILE_VALIDATION.md)** - Mobile number validation for 193 countries using libphonenumber-js
- **[Mobile Validation Global Expansion](MOBILE_VALIDATION_GLOBAL_EXPANSION.md)** - Expanding mobile support to new countries
- **[Mobile Validation Implementation](MOBILE_VALIDATION_IMPLEMENTATION.md)** - Technical implementation of mobile validation system

**Miscellaneous**
- **[Email Validation](EMAIL_VALIDATION.md)** - Email validation and verification system

---

### ⚙️ Technical Documentation (6 documents)

**Database & Schema**
- **[Table Architecture](TABLE_ARCHITECTURE.md)** (v1.5) - Complete database schema including authentication tables, profile system, and RLS policies
- **[Data Isolation Quick Reference](DATA_ISOLATION_QUICK_REFERENCE.md)** - Quick guide to RLS policies and data isolation patterns

**Technical Guides**
- **[Edge Functions Guide](EDGE_FUNCTIONS_GUIDE.md)** (v1.0) - Complete edge function development guide
- **[API Authentication](API_AUTHENTICATION.md)** (v1.0) - API authentication patterns and implementation
- **[Supabase Migration Guide](SUPABASE_MIGRATION_GUIDE.md)** - Database migration best practices

**Testing**
- **[Testing Strategy](TESTING_STRATEGY.md)** - Comprehensive testing approach including unit, integration, and E2E tests

---

### 🔧 System & Configuration (6 documents)

**Environment & Deployment**
- **[Environment Setup](ENVIRONMENT_SETUP.md)** - Setting up development, staging, and production environments
- **[Deployment Configuration](DEPLOYMENT_CONFIG.md)** - Deployment settings and CI/CD configuration
- **[Production Readiness](PRODUCTION_READINESS.md)** (v2.0) - Production launch checklist including Custom JWT security

**Configuration Management**
- **[Supabase Config Management](SUPABASE_CONFIG_MANAGEMENT.md)** - Dynamic configuration system using Supabase
- **[Country Code Specification](COUNTRY_CODE_SPECIFICATION.md)** - Country code standards and validation rules

**Integrations**
- **[Integrations Setup](INTEGRATIONS_SETUP.md)** (v1.3) - Setting up Google Places API, AI providers, and other integrations with authentication requirements
- **[Analytics](ANALYTICS.md)** (v1.3) - Analytics implementation with user type segmentation

---

### 📖 Quick Reference Guides (3 documents)

- **[Data Isolation Quick Reference](DATA_ISOLATION_QUICK_REFERENCE.md)** - Quick guide to RLS policies
- **[Country Code Specification](COUNTRY_CODE_SPECIFICATION.md)** - Country codes and dial codes reference
- **[Recent Changes](RECENT_CHANGES.md)** (v1.1) - Latest platform changes and updates (last updated: 2025-10-27)

---

## 🎯 Getting Started Paths

### For Administrators
1. Start with [Admin Platform Guide](admin/PLATFORM_GUIDE.md) for plain-English overview
2. Read [Admin Portal Guide](admin/PORTAL_GUIDE.md) for feature navigation
3. Review [Role Architecture](ROLE_ARCHITECTURE.md) to understand permissions
4. Use [Simulator Architecture](SIMULATOR_ARCHITECTURE.md) for testing

### For Developers
1. Begin with [Authentication Architecture](AUTHENTICATION_ARCHITECTURE.md) to understand the dual auth system
2. Study [API Authentication](API_AUTHENTICATION.md) for implementation patterns
3. Review [Edge Functions Guide](EDGE_FUNCTIONS_GUIDE.md) for backend development
4. Reference [Table Architecture](TABLE_ARCHITECTURE.md) for database schema

### For Product Managers
1. Read [User Classification](USER_CLASSIFICATION.md) to understand user types
2. Review [Registration Flow](REGISTRATION_FLOW.md) for onboarding journey
3. Study [Profile System Architecture](PROFILE_SYSTEM_ARCHITECTURE.md) for data collection
4. Check [Recent Changes](RECENT_CHANGES.md) for latest features

### For QA & Testing
1. Start with [Testing Simulator Guide](TESTING_SIMULATOR_GUIDE.md) for test environment
2. Use [Feature Testing Catalog](FEATURE_TESTING_CATALOG.md) for test scenarios
3. Reference [Simulator Architecture](SIMULATOR_ARCHITECTURE.md) for test data management
4. Follow [Testing Strategy](TESTING_STRATEGY.md) for comprehensive testing

---

## 🔍 Search Tips

**Finding Authentication Information:**
- Search: "authentication", "JWT", "login", "session"
- Key docs: AUTHENTICATION_ARCHITECTURE, API_AUTHENTICATION, EDGE_FUNCTIONS_GUIDE

**Finding User Management Information:**
- Search: "user type", "profile", "registration", "onboarding"
- Key docs: USER_CLASSIFICATION, USER_TYPE_MANAGEMENT, REGISTRATION_FLOW

**Finding Admin Information:**
- Search: "admin", "role", "permissions", "portal"
- Key docs: PLATFORM_GUIDE, PORTAL_GUIDE, ROLE_ARCHITECTURE

**Finding Testing Information:**
- Search: "simulator", "testing", "test user", "stage"
- Key docs: SIMULATOR_ARCHITECTURE, TESTING_SIMULATOR_GUIDE

**Finding Profile System Information:**
- Search: "profiling", "questions", "answers", "level"
- Key docs: PROFILING/*, PROFILE_SYSTEM_ARCHITECTURE

**Finding Technical Implementation:**
- Search: "database", "edge function", "RLS", "migration"
- Key docs: TABLE_ARCHITECTURE, EDGE_FUNCTIONS_GUIDE, API_AUTHENTICATION

---

## 📊 Documentation Statistics

**Total Documents:** 49+
- Authentication & Security: 8 (added Role Security Migration Guide)
- User Management: 5
- Admin Portal: 4
- Testing & Simulation: 3
- PROFILING Feature Docs: 9
- Other Feature Docs: 8
- Technical Documentation: 6
- System & Configuration: 6
- Quick Reference: 3

**Documentation Versions:**
- v3.0 (Major security overhaul): 3 documents (ROLE_ARCHITECTURE, USER_CLASSIFICATION, AUTHENTICATION_ARCHITECTURE)
- v2.0+ (Major update): 10 documents
- v1.5 (Significant update): 4 documents
- v1.3 (Minor update): 10+ documents
- v1.0 (Initial): 21+ documents

**Primary Author:** Nadia Gaspari
**Technical Content:** AI-Generated with Human Review
**Last Updated:** 2025-10-27

---

## 🆘 Need Help?

**Can't find what you're looking for?**
- Use the search bar in the Knowledge Centre
- Check [Recent Changes](RECENT_CHANGES.md) for latest updates
- Review the category that best matches your question
- Contact support with specific documentation requests

**Documentation Issues?**
- Report outdated information to administrators
- Suggest improvements via feedback forms
- Request new documentation topics
- Help improve clarity and accuracy

---

## Related Documentation
- [Recent Changes](reference/RECENT_CHANGES.md) - Latest platform updates
- [Admin Platform Guide](admin/PLATFORM_GUIDE.md) - Admin quick start
- [Authentication Architecture](AUTHENTICATION_ARCHITECTURE.md) - Core auth concepts
- [User Classification](USER_CLASSIFICATION.md) - User types overview
