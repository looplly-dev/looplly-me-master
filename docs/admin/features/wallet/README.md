---
id: "wallet-overview"
title: "Wallet Feature Documentation"
category: "Features"
description: "Complete overview and navigation for wallet-related documentation"
audience: "admin"
tags: ["wallet", "earnings", "cash-out", "overview", "index"]
status: "published"
version: "1.0.0"
---

# Wallet Feature Documentation

## Overview

The Looplly Wallet is your central hub for managing earnings, tracking transactions, and withdrawing funds. This section contains comprehensive documentation for all wallet-related features.

---

## Documentation Index

### 📖 **Core Guides**

#### [Wallet User Guide](./WALLET_USER_GUIDE.md)
**Audience**: End users  
**Topics Covered**:
- Understanding Available vs Pending Balance
- Transaction history and status meanings
- Security and privacy features
- Common issues and troubleshooting

**Start here if**: You want to understand how your wallet works and how to use it effectively.

---

#### [Cash-Out Methods Guide](./CASH_OUT_METHODS.md)
**Audience**: End users  
**Topics Covered**:
- Mobile Airtime withdrawals ($1 minimum)
- M-Pesa mobile money ($5 minimum)
- Cryptocurrency withdrawals ($10 minimum)
- PayPal (coming soon)
- Detailed comparison of all methods
- Fees, processing times, and requirements
- Step-by-step instructions for each method

**Start here if**: You're ready to withdraw funds and need to choose the best method.

---

#### [AI Accountant System](./AI_ACCOUNTANT.md)
**Audience**: All users and admins  
**Topics Covered**:
- How AI verification works
- Transaction status flow explained
- Why verification takes time
- What AI checks for (fraud detection)
- Security and privacy measures
- Troubleshooting stuck transactions

**Start here if**: You want to understand why transactions take time to verify or how the security system works.

---

## Quick Start Paths

### For New Users

**Goal: Understand Your Wallet**
1. Read: [Wallet User Guide](./WALLET_USER_GUIDE.md)
2. Learn about: [AI Accountant System](./AI_ACCOUNTANT.md)
3. When ready to withdraw: [Cash-Out Methods](./CASH_OUT_METHODS.md)

**Estimated Time**: 15 minutes

---

### For First Withdrawal

**Goal: Successfully Cash Out Earnings**
1. Check your **Available Balance** in [Wallet User Guide](./WALLET_USER_GUIDE.md#understanding-your-balance)
2. Review all options: [Cash-Out Methods Comparison](./CASH_OUT_METHODS.md#method-comparison-table)
3. Choose your method and follow step-by-step guide
4. Understand verification: [AI Accountant - Withdrawal Flow](./AI_ACCOUNTANT.md#outgoing-withdrawal-verification)

**Estimated Time**: 10 minutes

---

### For Troubleshooting

**Goal: Resolve Transaction Issues**
1. Check status meanings: [Transaction Status Flow](./AI_ACCOUNTANT.md#transaction-status-flow)
2. Find your issue: [Common Issues](./WALLET_USER_GUIDE.md#common-issues--solutions)
3. Method-specific problems: [Cash-Out Troubleshooting](./CASH_OUT_METHODS.md) (each method has section)
4. Still stuck: [Contact Support](./WALLET_USER_GUIDE.md#need-help)

**Estimated Time**: 5 minutes

---

## Key Concepts

### Balance Types

| Balance Type | What It Means | Can I Withdraw? |
|--------------|--------------|----------------|
| **Available** | Verified and cleared funds | ✅ Yes - withdraw anytime |
| **Pending** | Recently earned, being verified | ❌ Not yet - wait 24-48 hours |
| **Total Earned** | All-time earnings (lifetime) | ℹ️ For information only |

**Learn more**: [Understanding Your Balance](./WALLET_USER_GUIDE.md#understanding-your-balance)

---

### Withdrawal Methods

| Method | Minimum | Best For | Processing Time |
|--------|---------|----------|----------------|
| **Mobile Airtime** | $1 | Small, frequent withdrawals | Instant - 24 hrs |
| **M-Pesa** | $5 | East African users | Instant - 24 hrs |
| **Cryptocurrency** | $10 | Larger amounts, global | 24-48 hrs |
| **PayPal** | $5 | Coming soon | Coming soon |

**Learn more**: [Cash-Out Methods Comparison](./CASH_OUT_METHODS.md#method-comparison-table)

---

### Transaction Statuses

| Status | Meaning | Typical Duration |
|--------|---------|------------------|
| **Pending** | Just submitted | 1-5 minutes |
| **Verifying** | AI checking | 1-24 hours |
| **Awaiting Funds** | Provider confirming | 24-48 hours |
| **Completed** | Done ✅ | - |
| **Failed** | Issue detected | - |

**Learn more**: [Transaction Status Flow](./AI_ACCOUNTANT.md#transaction-status-flow)

---

## Common Questions

### "Why is my balance pending?"

All new earnings require AI verification (24-48 hours) to ensure they're legitimate and that providers have confirmed payment. This protects against fraud and ensures you actually get paid.

**Read**: [Why Verification Takes Time](./AI_ACCOUNTANT.md#why-verification-takes-time)

---

### "What's the fastest way to withdraw?"

**Mobile Airtime** or **M-Pesa** are fastest (instant to 24 hours after AI approval). Crypto takes 24-48 hours due to blockchain confirmations.

**Read**: [Choosing the Right Method](./CASH_OUT_METHODS.md#choosing-the-right-method)

---

### "How long until I can withdraw new earnings?"

**Timeline**:
1. Earn money from activity: Immediate
2. AI verification: 24-48 hours
3. Moves to Available Balance: Can withdraw
4. Cash-out request: 2-4 hours for AI approval
5. Payment delivery: Varies by method (instant to 48 hours)

**Total**: ~48-96 hours from earning to receiving money

**Read**: [Transaction Status Flow](./AI_ACCOUNTANT.md#transaction-status-flow)

---

### "Can I withdraw to different methods?"

Yes! You can use different withdrawal methods for different transactions. Choose based on:
- Amount available
- Urgency
- Fees
- Regional availability

**Read**: [Choosing the Right Method](./CASH_OUT_METHODS.md#choosing-the-right-method)

---

### "Is the AI Accountant safe?"

Yes. The AI Accountant:
- ✅ Protects your earnings from fraud
- ✅ Ensures providers actually pay for your work
- ✅ Validates withdrawal destinations
- ✅ Detects unauthorized access attempts
- ✅ Uses encrypted data (never sees passwords or private keys)

**Read**: [Security & Privacy](./AI_ACCOUNTANT.md#security--privacy)

---

## Regional Guides

### East Africa (Kenya, Tanzania, Uganda)

**Recommended Method**: M-Pesa  
**Why**: Instant transfers, easy conversion to cash, widely accepted

**Resources**:
- [M-Pesa Detailed Guide](./CASH_OUT_METHODS.md#m-pesa-)
- [Regional Recommendations](./CASH_OUT_METHODS.md#regional-recommendations)

---

### South Africa & Nigeria

**Recommended Method**: Cryptocurrency or Mobile Airtime  
**Why**: Crypto for larger amounts, airtime for small frequent withdrawals

**Resources**:
- [Cryptocurrency Guide](./CASH_OUT_METHODS.md#cryptocurrency-)
- [Mobile Airtime Guide](./CASH_OUT_METHODS.md#mobile-airtime-)

---

### Global / Other Regions

**Recommended Method**: Cryptocurrency  
**Why**: Available globally, no regional restrictions

**Alternative**: Wait for PayPal (coming Q2 2025)

**Resources**:
- [Cryptocurrency Guide](./CASH_OUT_METHODS.md#cryptocurrency-)
- [PayPal Coming Soon](./CASH_OUT_METHODS.md#paypal--coming-soon)

---

## Related Documentation

### Earning More

Want to increase your wallet balance?

- **[Earning Opportunities](../earning/EARNING_OPPORTUNITIES.md)** - All ways to earn
- **[Survey Matching System](../earning/SURVEY_MATCHING_SYSTEM.md)** - Get more surveys
- **[Referral Program](../referrals/REFERRAL_PROGRAM.md)** - Earn from referrals
- **[Profiling User Guide](../profiling/USER_GUIDE.md)** - Complete profile for better matches
- **[Reputation System](../reputation/STREAK_REPUTATION_SYSTEM.md)** - Streak multipliers

### Account Management

- **[Account Management](../../users/ACCOUNT_MANAGEMENT.md)** - Profile settings
- **[Mobile Verification](../../authentication/MOBILE_VERIFICATION_SYSTEM.md)** - Required for withdrawals
- **[Security Settings](../../users/ACCOUNT_MANAGEMENT.md#security)** - Protect your account

---

## For Administrators

### Operational Documentation

- **Transaction Monitoring** (Coming Soon) - How to oversee AI Accountant
- **Payout Processing** (Coming Soon) - End-to-end workflow
- **User Support Procedures** (Coming Soon) - Common scenarios

### Technical Documentation

- **[Wallet Schema](../../technical/TABLE_ARCHITECTURE.md)** - Database structure
- **Transaction Status Flow** (Backend) - API documentation
- **AI Accountant Integration** - Technical details

---

## Getting Help

### Self-Service Resources

1. **Search this documentation** - Use Knowledge Centre search
2. **Check FAQ sections** - Each guide has troubleshooting
3. **Review transaction details** - Often contains error explanations

### Contact Support

**When to Contact**:
- ❌ Transaction stuck beyond 48 hours
- ❌ Withdrawal failed with unclear error
- ❌ Account security concerns
- ❌ Money sent to wrong destination

**What to Include**:
- Transaction ID
- Screenshot of issue
- Date and amount
- Method used
- Steps you've already tried

**Response Time**: 24-48 hours

**Access**: Settings → Support or [Support Documentation](../../users/ACCOUNT_MANAGEMENT.md#support)

---

## Document Updates

### Version History

- **v1.0.0** (2025-01-28): Initial wallet documentation suite released
  - Wallet User Guide
  - Cash-Out Methods Guide
  - AI Accountant System Guide

### Upcoming Documentation

**Q1 2025**:
- Transaction Monitoring Guide (for admins)
- Payout Processing Workflow (operations)
- Advanced Crypto Withdrawal Guide

**Q2 2025**:
- PayPal Integration Guide (when launched)
- Bank Transfer Options (regional)
- Wallet API Documentation (developers)

---

## Feedback

Found something unclear? Have suggestions for improvement?

**Submit Feedback**:
1. Use feedback widget at bottom of any documentation page
2. Rate helpfulness and leave comments
3. Admin team reviews all feedback weekly

**Your input helps us improve these guides for everyone!**
