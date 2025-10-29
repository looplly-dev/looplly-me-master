---
id: "warren-admin"
title: "Warren Admin Guide"
category: "Admin"
description: "Admin guide for Warren"
audience: "admin"
tags: ["warren", "admin", "guide"]
status: "published"
---

# Warren Admin Platform Guide

## Overview

The Warren Admin Platform provides comprehensive tools for managing the Looplly platform, users, content, and system configuration.

## Accessing the Admin Portal

### Login

Navigate to `/admin/login` and authenticate with admin credentials.

**Security:**
- Multi-factor authentication required
- Session timeout after 30 minutes of inactivity
- IP whitelisting (optional)
- Audit log of all admin actions

### Admin Roles

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| Super Admin | Full access | All features + user management |
| Content Admin | Content only | Manage questions, docs, badges |
| Support Admin | User management | View/edit users, reset passwords |
| Analytics Admin | Read-only | View reports and analytics |

## Dashboard Overview

### Key Metrics

The admin dashboard displays:

**User Metrics:**
- Total registered users
- Active users (last 7/30 days)
- New registrations (daily/weekly/monthly)
- User retention rate

**Engagement Metrics:**
- Survey completion rate
- Average surveys per user
- Profile completion rate by level
- Streak participation rate

**Financial Metrics:**
- Total earnings paid out
- Pending redemptions
- Revenue (from surveys/ads)
- Average earnings per user

**System Health:**
- API response times
- Error rates
- Database performance
- Edge function status

## User Management

### User List

Navigate to **Admin → Users** to view all registered users.

**Features:**
- Search by name, email, mobile
- Filter by country, tier, profile completion
- Sort by registration date, reputation, earnings
- Bulk actions (export, message, update)

### User Details

Click any user to view detailed information:

**Profile Tab:**
- Personal information
- Profile completion status
- Profile answers by category
- Last activity

**Reputation Tab:**
- Current tier and points
- Point history (transactions)
- Streaks and milestones
- Badges earned

**Activity Tab:**
- Survey completion history
- Earning activities
- Community posts/comments
- Login history

**Financial Tab:**
- Current balance
- Transaction history
- Redemption history
- Referral earnings

### User Actions

**Common Actions:**
- Edit profile information
- Reset password (sends email)
- Adjust reputation points (with reason)
- Ban/suspend account
- Delete account (GDPR compliance)
- Send direct message

**Security Actions:**
- Force logout
- Require password reset
- Enable/disable 2FA
- Review login history

## Profile Question Management

### Understanding Profile Levels

⚠️ **Important: Level 1 vs Level 2 Distinction**

**Level 1: Registration Fields (Super Admin Only)**
- Captured during user registration
- Fields: First Name, Last Name, DOB, Mobile, Password, GPS Toggle
- Purpose: Identity verification and fraud prevention
- **Locked from regular admins** - requires Super Admin approval to modify
- Email and Gender removed from Level 1 (moved to Level 2)

**Level 2: Pre-Earning Profiling (Admin Editable)**
- Captured via dashboard modal after registration
- 6 Required: Gender, Address, Ethnicity, Household Income (HHI), Personal Income (PHI), SEC
- 1 Optional: Email (for newsletters only, NOT account recovery)
- Purpose: Demographic profiling for survey targeting
- Must be complete + mobile verified before user can earn

**Level 3: Progressive Profiling (Admin Editable)**
- Captured contextually during user journey
- Categories: Technology, Media, Health, Finance, Travel, etc.
- Purpose: Deep profiling for high-value survey matching
- Optional - improves match quality but not required

### Question List

Navigate to **Admin → Profile Questions**

**View Options:**
- By category
- By level (1, 2, 3)
- By status (active/inactive)
- By completion rate

### Creating Questions

Click **"Add Question"** to open the question builder.

**Required Fields:**
- Question key (unique identifier)
- Question text (what user sees)
- Question type (select, multi_select, text, etc.)
- Category
- Level (1, 2, or 3)
- Display order

**Optional Fields:**
- Global answer options
- Country-specific options
- Help text
- Validation rules
- Decay configuration

**⚠️ Level 1 Questions:**
- Do NOT create new Level 1 questions without Super Admin approval
- Level 1 is tied to registration and identity verification
- Changes affect fraud prevention and account creation flow
- Consult technical team before modifications

**Level 2 Questions:**
- 6 required questions already defined (Gender, Address, Ethnicity, HHI, PHI, SEC)
- Additional Level 2 questions require approval (changes pre-earning requirements)
- Email remains optional in Level 2

**Level 3 Questions:**
- Freely add/edit Level 3 questions for progressive profiling
- Organize by category for contextual presentation
- Test with simulator before activating

See [Question Builder Guide](PROFILING/QUESTION_BUILDER_GUIDE.md) for details.

### Country-Specific Options

For brand/provider questions:

1. Open question details
2. Click **"Manage Country Options"**
3. Click **"Add Country"**
4. Select country from dropdown
5. Enter options (one per line)
6. Save

**AI Auto-Generation:**
1. Click **"Auto-Generate Options"**
2. Select target countries
3. Review generated options
4. Edit if needed
5. Approve and save

See [Admin Auto-Generation Guide](PROFILING/ADMIN_AUTO_GENERATION_GUIDE.md).

### Bulk Operations

**Import Questions:**
- Upload CSV/JSON file
- Map columns to fields
- Preview before import
- Validate and import

**Export Questions:**
- Select questions to export
- Choose format (CSV/JSON)
- Include country options
- Download file

## Content Management

### Badge Management

Navigate to **Admin → Badges**

**Operations:**
- Create new badges
- Edit existing badges
- Upload badge images
- Assign badge criteria
- View users with badge

**Badge Types:**
- Achievement badges (auto-awarded)
- Manual badges (admin-awarded)
- Event badges (limited time)
- Tier badges (reputation-based)

### Knowledge Centre

Navigate to **Admin → Knowledge Centre**

**Features:**
- Create/edit documentation
- Organize by category
- Version control (automatic)
- Search and filter
- Publish/unpublish

**Document Editor:**
- Markdown support
- Code syntax highlighting
- Image uploads
- Internal linking
- SEO optimization

See [Knowledge Centre Guide](KNOWLEDGE_CENTRE.md).

## Team & Permissions

### Team Members

Navigate to **Admin → Team**

**View Team:**
- All admin users
- Role assignments
- Last login
- Activity status

**Add Team Member:**
1. Click **"Add Team Member"**
2. Enter email
3. Select role
4. Set permissions
5. Send invitation

**Manage Permissions:**
- Grant/revoke access to modules
- Set read-only vs edit permissions
- Configure IP restrictions
- Enable/disable 2FA requirement

### Audit Log

All admin actions are logged:

```sql
SELECT 
  al.action_type,
  al.description,
  al.performed_by,
  p.full_name,
  al.created_at
FROM audit_log al
JOIN profiles p ON p.user_id = al.performed_by
WHERE al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;
```

**Searchable Fields:**
- Action type (create, update, delete)
- Admin user
- Target entity (user, question, etc.)
- Date range
- IP address

## Analytics & Reporting

### Reports Dashboard

Navigate to **Admin → Analytics**

**Available Reports:**

**User Growth:**
- Daily/weekly/monthly registrations
- User retention curves
- Churn analysis
- Demographic breakdown

**Engagement:**
- Survey completion rates
- Profile completion funnel
- Feature usage stats
- Session duration

**Financials:**
- Revenue trends
- Payout history
- Top earners
- Redemption patterns

**System Performance:**
- API latency
- Error rates by endpoint
- Database query performance
- Edge function metrics

### Custom Reports

**Create Custom Report:**
1. Navigate to Analytics
2. Click **"Custom Report"**
3. Select metrics
4. Choose dimensions
5. Set filters
6. Schedule (optional)
7. Export or view

**Export Options:**
- CSV
- Excel
- PDF
- JSON (API access)

## System Configuration

### Decay Settings

Navigate to **Admin → Profile Decay**

Configure staleness intervals:

```typescript
{
  "immutable": {
    "days": 999999,
    "description": "Never expires"
  },
  "short_term": {
    "days": 30,
    "description": "Current status"
  },
  "medium_term": {
    "days": 180,
    "description": "Seasonal preferences"
  },
  "long_term": {
    "days": 365,
    "description": "Stable data"
  }
}
```

See [Profile Decay System](PROFILE_DECAY_SYSTEM.md).

### Reputation Configuration

Navigate to **Admin → Reputation Config**

**Tier Settings:**
- Adjust point thresholds
- Modify tier benefits
- Configure earning rates
- Set decay rates

**Earning Rules:**
- Points per survey type
- Profile completion bonuses
- Referral rewards
- Streak milestones

See [Reputation System](REP_CLASSIFICATION_SYSTEM.md).

### Integration Management

Navigate to **Admin → Integrations**

**Manage External Services:**
- Survey providers (Cint, Toluna, etc.)
- SMS gateways
- Email providers
- Analytics platforms
- Payment processors

**For Each Integration:**
- Enable/disable
- Configure API keys
- Test connection
- View usage metrics
- Monitor errors

## Troubleshooting

### Common Issues

**Users Can't Register:**
1. Check country blocklist
2. Verify SMS gateway status
3. Review registration error logs
4. Test mobile validation

**Surveys Not Appearing:**
1. Check integration status
2. Verify user profile completion
3. Review survey matching logic
4. Check API rate limits

**Profile Questions Missing:**
1. Verify question is active
2. Check level assignment
3. Review category visibility
3. Clear frontend cache

**Performance Issues:**
1. Check database metrics
2. Review slow query log
3. Monitor edge function performance
4. Check CDN status

**Simulator Logs Out Admin:**
1. Verify session isolation architecture is intact
2. Check browser console for path detection logs
3. Confirm `activeClient.ts` returns correct client
4. Test with hard refresh during simulation
5. Review browser DevTools → Storage (localStorage vs sessionStorage)

See [Simulator Architecture](SIMULATOR_ARCHITECTURE.md) for technical details.

### Getting Help

**Internal Resources:**
- Knowledge Centre
- Admin documentation
- System health dashboard

**External Support:**
- Technical support team
- Platform status page
- Community forum

## Security Best Practices

### Admin Account Security

- Use strong, unique passwords
- Enable 2FA (required for Super Admins)
- Regularly review login history
- Use VPN when accessing remotely

### Data Protection

- Never share user PII outside secure channels
- Use audit log for compliance
- Follow GDPR/POPI/NDPR guidelines
- Report security incidents immediately

### Access Control

- Grant minimum necessary permissions
- Review team access quarterly
- Disable accounts for inactive admins
- Monitor for suspicious activity

## Related Documentation

- [User Management](ACCOUNT_MANAGEMENT.md)
- [Profile Questions](PROFILING/ADMIN_GUIDE.md)
- [Knowledge Centre](KNOWLEDGE_CENTRE.md)
- [Analytics](ANALYTICS.md)
- [Role Architecture](ROLE_ARCHITECTURE.md)
