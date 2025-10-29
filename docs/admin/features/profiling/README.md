---
id: "profiling-overview"
title: "Profiling System Documentation"
category: "Features"
description: "Progressive, AI-powered data collection engine for targeted survey distribution"
audience: "admin"
tags: ["profiling", "overview", "system", "architecture"]
status: "published"
version: "1.0.0"
---

# Profiling System Documentation

## Overview

The Looplly Profiling System is a progressive, AI-powered data collection engine that enables targeted survey distribution while respecting user privacy and minimizing friction.

## Documentation Structure

### User-Facing Guides
- **[User Guide](USER_GUIDE.md)** - How users complete their profile across 3 levels
- **[Earning Rules](EARNING_RULES.md)** - How profile completion unlocks earning opportunities

### Admin & Management
- **[Admin Guide](ADMIN_GUIDE.md)** - Managing profiling questions and categories
- **[Question Builder Guide](QUESTION_BUILDER_GUIDE.md)** - Creating and editing questions
- **[Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)** - Managing country-specific options
- **[Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md)** - Using AI tools in the admin portal

### Technical Architecture
- **[Architecture](ARCHITECTURE.md)** - Technical implementation and database schema
- **[Level Strategy](LEVEL_STRATEGY.md)** - Progressive profiling strategy and design
- **[Decay System](DECAY_SYSTEM.md)** - Profile staleness and refresh mechanisms
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Integrating profiling into features

### AI & Automation
- **[AI Generation Prompts](AI_GENERATION_PROMPTS.md)** - AI prompt templates for question generation
- **[Auto-Scaling System](AUTO_SCALING_SYSTEM.md)** - AI-powered country option generation
- **[Global vs Local Brands](GLOBAL_VS_LOCAL_BRANDS.md)** - Strategy for brand questions
- **[Contextual Triggers](CONTEXTUAL_TRIGGERS.md)** - Smart question triggering

## Key Concepts

### Progressive Profiling (3 Levels)
1. **Level 1 (Essential)** - Basic demographic data collected during onboarding
2. **Level 2 (Standard)** - Lifestyle and preference data for targeted surveys
3. **Level 3 (Premium)** - Detailed behavioral and attitudinal data for high-value targeting

### Profile Decay
Questions have configurable staleness intervals. Users are prompted to refresh outdated data to maintain profile quality and earn reputation points.

### Country-Aware Questions
Questions and answer options automatically adapt based on user country code, with AI assistance for generating localized options.

## Quick Start

**For Users**: Start with the [User Guide](USER_GUIDE.md)

**For Admins**: Start with the [Admin Guide](ADMIN_GUIDE.md)

**For Developers**: Start with the [Architecture](ARCHITECTURE.md)

## Support

For additional help, visit the Knowledge Centre in the admin portal or contact the platform team.
