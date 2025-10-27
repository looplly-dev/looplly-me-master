# Admin Portal Guide

Complete guide to all admin portal features and sections.

## Overview

The Admin Portal provides comprehensive tools for managing users, content, integrations, and platform configuration. Access is restricted to team members with admin privileges.

## Portal Sections

### User Management

#### **Users**
- View all registered users
- Search and filter by criteria
- View user profiles and activity
- Suspend or activate accounts
- Export user data

#### **Team**
- Manage team member accounts
- Invite new team members
- Reset passwords
- View team activity logs
- Deactivate team accounts

### Content & Configuration

#### **Profile Questions**
- Create and edit profile questions
- Configure question types (text, select, multi-select, date, address)
- Set validation rules
- Manage question categories
- Configure country-specific options
- Set staleness intervals

#### **Profile Decay**
- Configure data freshness intervals
- Set global, category, and question-level decay rules
- Monitor platform health metrics
- View staleness distribution

#### **Badges**
- Create and manage badge catalog
- Upload badge icons
- Set badge requirements
- Award badges to users
- View badge analytics

#### **Country Blocklist**
- Block registrations from specific countries
- View blocked countries
- Add/remove countries from blocklist
- Set block reasons

### Integrations

#### **Integrations**
- Configure Google Places API
- Set up AI Providers (OpenAI, Anthropic, Google)
- Test integration status
- View API usage

#### **Agents**
- View AI agent configurations
- Monitor agent health
- View execution history
- Configure agent dependencies

### Analytics & Monitoring

#### **Analytics**
- View user growth metrics
- Track earning activity
- Monitor survey completion rates
- Export analytics reports

#### **Earning Rules**
- Configure earning activities
- Set reward amounts
- Enable/disable earning rules
- View earning history

#### **Simulator**
- Test user journeys
- Create test accounts
- Simulate survey flows
- Debug user experience

### System Management

#### **Migration Helper**
- Run database migrations
- View migration history
- Rollback migrations
- Test migration scripts

#### **Knowledge**
- Access documentation
- Search knowledge base
- View technical references
- Read system architecture guides

## Common Tasks

### Adding a New Team Member

1. Navigate to **Admin → Team**
2. Click "Add Team Member"
3. Enter email, name, and company details
4. System sends invitation email with temporary password
5. Team member must change password on first login

### Configuring Profile Questions

1. Navigate to **Admin → Profile Questions**
2. Click "Add Question"
3. Select question type and category
4. Set validation rules and options
5. Configure country-specific variants if needed
6. Set staleness interval
7. Save and activate

### Setting Up Integrations

1. Navigate to **Admin → Integrations**
2. Click "Configure" for desired integration
3. Follow link to Backend settings to add secrets
4. Test integration status
5. Monitor API usage

### Monitoring User Activity

1. Navigate to **Admin → Users**
2. Use filters to find specific users
3. Click user row to view detailed profile
4. Review earning history, surveys, and reputation
5. Check profile completeness

## Security Best Practices

- **Access Control**: Only grant admin access to trusted team members
- **Password Management**: Enforce password changes for new team members
- **Audit Logs**: Regularly review team activity logs
- **Integration Secrets**: Store API keys in Backend settings, never in code
- **User Privacy**: Follow data protection regulations when viewing user data

## Troubleshooting

### Can't see user data
- Check your role permissions
- Verify RLS policies are correctly configured
- Ensure user exists in the system

### Integration not working
- Verify secrets are set in Backend settings
- Test integration status on Integrations page
- Check edge function logs for errors

### Team member can't log in
- Verify account is active
- Check if password reset is required
- Ensure invitation was sent successfully

## Quick Reference

| Section | Purpose | Key Actions |
|---------|---------|-------------|
| Users | Manage all users | View, search, suspend |
| Team | Manage team accounts | Invite, reset password |
| Profile Questions | Configure profiling | Add, edit, activate |
| Profile Decay | Data freshness | Configure intervals |
| Badges | Reward system | Create, award |
| Integrations | External APIs | Configure, test |
| Analytics | Platform metrics | View, export |
| Simulator | Testing | Create test users |

## Additional Resources

- [Password Reset Flow](./PASSWORD_RESET_FLOW.md)
- [Profile Decay System](./PROFILE_DECAY_SYSTEM.md)
- [Integrations Setup](./INTEGRATIONS_SETUP.md)
- [Table Architecture](./TABLE_ARCHITECTURE.md)
- [User Classification](./USER_CLASSIFICATION.md)
