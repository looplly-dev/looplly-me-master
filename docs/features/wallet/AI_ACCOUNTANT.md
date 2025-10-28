---
id: "ai-accountant-system"
title: "AI Accountant System"
category: "Features"
description: "How the AI-powered transaction verification system protects your earnings and prevents fraud"
audience: "all"
tags: ["wallet", "ai", "verification", "security", "fraud-detection", "accountant"]
status: "published"
version: "1.0.0"
---

# AI Accountant System

## Overview

The AI Accountant (internally known as "The Accountant") is Looplly's intelligent transaction verification system. It uses artificial intelligence to verify every transaction, detect fraud, and protect both users and the platform from abuse.

**Key Functions**:
- ✅ Verifies incoming earnings are legitimate
- ✅ Approves outgoing withdrawal requests
- ✅ Detects fraudulent patterns and abuse
- ✅ Ensures providers have paid for completed work
- ✅ Protects your account from unauthorized access

---

## How It Works

### Two-Way Verification

The AI Accountant monitors transactions in both directions:

#### **Incoming Transactions** (Earnings)
When you complete a survey, watch a video, or earn through any activity:
1. Transaction created with status "Pending"
2. AI Accountant begins verification process
3. Checks with earning provider for confirmation
4. Validates amount matches activity completed
5. Moves funds to "Available Balance" once verified

#### **Outgoing Transactions** (Withdrawals)
When you request a cash-out:
1. Request submitted with status "Pending"
2. AI Accountant performs security checks
3. Verifies account ownership and details
4. Confirms sufficient Available Balance
5. Approves for payment processing

---

## Transaction Status Flow

### Status Definitions

| Status | What It Means | Typical Duration | Action Required |
|--------|--------------|------------------|-----------------|
| **Pending** | Just submitted, queued for AI | 1-5 minutes | None - automatic |
| **Verifying** | AI actively checking transaction | 1-24 hours | None - wait for AI |
| **Awaiting Funds** | Provider confirming payment | 24-48 hours | None - provider processing |
| **Funds Received** | Confirmed, moving to Available | 1-2 hours | None - almost ready |
| **Completed** | Verified and in Available Balance | Done | Can withdraw |
| **Failed** | Could not verify or process | - | Check error details |

### Incoming Earnings Flow

```
Survey/Activity Completed
         ↓
    [Pending] (1-5 min)
         ↓
    [Verifying] (1-24 hrs)
    AI checks with provider
         ↓
  [Awaiting Funds] (24-48 hrs)
  Provider confirms payment
         ↓
  [Funds Received] (1-2 hrs)
  Moving to Available Balance
         ↓
    [Completed]
  Money in Available Balance ✅
```

### Outgoing Withdrawal Flow

```
User Requests Cash-Out
         ↓
    [Pending] (1-5 min)
    Initial validation
         ↓
    [Verifying] (2-4 hrs)
    AI security checks
         ↓
    [Approved]
    Sent to payment processor
         ↓
    [Completed]
    Funds delivered ✅
```

---

## What AI Checks For

### Incoming Earnings Verification

#### 1. **Activity Legitimacy**
- Was the survey/task actually completed?
- Did the user meet qualification requirements?
- Was the activity completed within normal timeframe?

#### 2. **Provider Confirmation**
- Has the earning partner confirmed the activity?
- Did they send payment for this transaction?
- Does the amount match what they reported?

#### 3. **Duplicate Detection**
- Has this activity been claimed before?
- Is there a matching transaction already?
- Are there suspicious patterns of repeat claims?

#### 4. **Fraud Patterns**
- Multiple accounts from same device/IP?
- Abnormal completion speed or patterns?
- Using VPN/proxy to bypass restrictions?
- Bot-like behavior detected?

#### 5. **Amount Validation**
- Does amount match published activity reward?
- Are there unexpected bonuses or multipliers?
- Is amount within normal range for activity type?

### Outgoing Withdrawal Verification

#### 1. **Account Security**
- Is request from legitimate account owner?
- Recent suspicious login attempts?
- Password recently changed?
- Account age and history check

#### 2. **Destination Validation**
- Mobile number matches registered profile?
- Crypto address format valid for selected coin?
- M-Pesa number registered and active?
- Destination previously used successfully?

#### 3. **Balance Verification**
- Sufficient Available Balance (not Pending)?
- All incoming funds verified and cleared?
- No pending disputes on account?

#### 4. **Risk Assessment**
- First withdrawal from account? (extra scrutiny)
- Large amount relative to history?
- Multiple withdrawals in short timeframe?
- Withdrawal method consistent with location?

#### 5. **Compliance Checks**
- Account not flagged for terms violation?
- User age verified for cash-out?
- No active investigation on account?
- Region supports selected withdrawal method?

---

## Why Verification Takes Time

### Incoming Earnings (24-48 Hours)

**Technical Reasons**:
- Provider APIs update on batch schedule (not real-time)
- Fraud detection requires pattern analysis over time
- Multiple providers must confirm payment
- Cross-checking against survey quotas and qualifications

**Real-World Example**:
```
10:00 AM - You complete survey
10:05 AM - Survey provider logs completion
02:00 PM - Provider batches all completions for the day
06:00 PM - Provider sends confirmation to Looplly
07:00 PM - AI Accountant receives confirmation
08:00 PM - AI completes verification
08:30 PM - Funds move to Available Balance ✅
```

**Why Not Instant?**
- Protects against fraudulent or fake completions
- Ensures providers actually pay for the work
- Prevents credit-then-chargeback scenarios
- Allows time to detect bot/automation abuse

### Outgoing Withdrawals (2-4 Hours)

**Security Reasons**:
- Account ownership verification
- Fraud pattern analysis
- Destination validation
- Cross-reference with account history

**Real-World Example**:
```
2:00 PM - You request $10 M-Pesa withdrawal
2:05 PM - AI begins security checks
2:30 PM - Validates M-Pesa number
3:00 PM - Confirms no fraud flags
3:30 PM - Approves transaction
4:00 PM - Sent to M-Pesa payment processor
4:15 PM - You receive M-Pesa confirmation ✅
```

**Why Not Instant?**
- Prevents unauthorized withdrawals if account hacked
- Allows time to detect suspicious patterns
- Validates destination (prevents sending to wrong number)
- Protects users from mistakes (e.g., typos in wallet address)

---

## First-Time Withdrawals

### Extra Verification for Security

Your **first cash-out** may take longer (12-24 hours) because:

1. **Account Baseline Establishment**
   - AI learning your normal behavior patterns
   - Validating earning history is legitimate
   - Confirming profile information accuracy

2. **Enhanced Security Checks**
   - Manual review may be triggered for large amounts
   - Additional identity verification
   - Fraud team oversight (if flagged)

3. **Payment Method Validation**
   - First-time use of mobile number or crypto address
   - Ensuring destination is correct and accessible
   - Testing connectivity with payment processor

**Pro Tip**: Complete your profile fully and verify your mobile number before your first withdrawal to speed up the process.

---

## When Transactions Fail

### Common Failure Reasons

#### **Incoming Earnings Failed**
1. **Provider Did Not Confirm**
   - Survey quota filled before completion
   - Quality score too low (rushed through)
   - Disqualified due to profile mismatch
   - **Action**: Improve profile accuracy, take time on surveys

2. **Duplicate Transaction Detected**
   - Same survey attempted twice
   - Already claimed by another account
   - **Action**: Don't retake same surveys

3. **Fraud Pattern Detected**
   - Bot-like behavior identified
   - VPN/proxy usage flagged
   - Multiple accounts from same device
   - **Action**: Contact support if you believe this is an error

#### **Outgoing Withdrawals Failed**
1. **Invalid Destination**
   - Mobile number incorrect or inactive
   - Crypto address invalid for selected coin
   - M-Pesa account not registered
   - **Action**: Double-check details and retry

2. **Insufficient Balance**
   - Attempted withdrawal before verification complete
   - Balance fell below minimum during processing
   - **Action**: Wait for funds to clear, ensure sufficient balance

3. **Security Hold**
   - Recent suspicious activity detected
   - Account verification needed
   - Multiple failed attempts
   - **Action**: Contact support for account review

4. **Provider Service Down**
   - M-Pesa maintenance window
   - Blockchain network congestion
   - Payment processor temporary outage
   - **Action**: Wait a few hours and retry

---

## Understanding "Accountant Status"

### Status Field Explained

In your transaction history, you may see an "Accountant Status" field with these values:

| Accountant Status | Meaning | What's Happening |
|-------------------|---------|------------------|
| **Pending Review** | Queued for AI analysis | Waiting in queue |
| **Under Review** | AI actively analyzing | Checking all validation criteria |
| **Approved** | Passed all checks | Ready for payment processing |
| **Flagged** | Requires additional review | May need manual oversight |
| **Rejected** | Did not pass verification | Transaction will fail |
| **Resolved** | Issue fixed, re-approved | Originally flagged but now cleared |

### When Transactions Get Flagged

**Automatic Flags** (AI-triggered):
- First withdrawal over $50
- Withdrawal to new destination
- Multiple withdrawals same day
- Unusual earning pattern
- Account age less than 7 days

**Manual Flags** (Human review):
- High-value transaction ($100+)
- Fraud pattern detected
- User-reported dispute
- Provider investigation request

**What Happens Next**:
1. Transaction held (may take 24-48 hours)
2. Support team reviews manually
3. May request additional verification
4. Either approved or rejected with explanation

---

## AI Learning & Improvement

### Getting Faster Over Time

The AI Accountant learns your behavior patterns:

**After 5 Verified Transactions**:
- Normal verification: 12-24 hours → 6-12 hours

**After 10 Verified Transactions**:
- Normal verification: 6-12 hours → 2-4 hours

**After 20+ Transactions (Trusted User)**:
- Normal verification: 2-4 hours → 1-2 hours
- Some small withdrawals may be instant-approved

**What Helps**:
- Consistent earning patterns
- Accurate profile information
- Same withdrawal methods/destinations
- No failed or flagged transactions
- Good survey completion rates

---

## Tips for Faster Verification

### For Incoming Earnings

1. **Complete Your Profile**
   - Accurate information = better survey matches
   - Higher completion rate = faster trust building
   - Verified mobile number required for verification

2. **Take Surveys Seriously**
   - Don't rush through questions
   - Answer honestly and consistently
   - High quality score = faster future approvals

3. **Avoid Multiple Accounts**
   - One account per person (ToS requirement)
   - Multiple accounts trigger fraud flags
   - All accounts may be suspended

4. **Use Stable Connection**
   - Complete surveys in one session
   - Don't switch IPs mid-survey
   - Avoid VPNs (may flag as fraud)

### For Outgoing Withdrawals

1. **Verify Mobile Number First**
   - Required before any withdrawal
   - One-time verification speeds up future requests

2. **Use Same Withdrawal Method**
   - Consistent destinations build trust
   - First-time methods take longer

3. **Avoid Multiple Small Withdrawals**
   - Combine into larger withdrawals when possible
   - Too many requests may trigger rate limits

4. **Keep Account Secure**
   - Strong password
   - Don't share account access
   - Log out on shared devices

5. **Wait for Full Verification**
   - Let pending earnings clear before withdrawing
   - Don't request more than Available Balance

---

## Security & Privacy

### What AI Has Access To

The AI Accountant analyzes:
- ✅ Transaction amounts and timestamps
- ✅ Earning activity types and providers
- ✅ Account age and history
- ✅ Device and login patterns
- ✅ Withdrawal destinations (for validation)
- ✅ Survey completion rates and quality

**AI Does NOT Have Access To**:
- ❌ Your passwords or authentication credentials
- ❌ Full bank account numbers (only validation)
- ❌ Private keys for crypto wallets
- ❌ M-Pesa PINs or transaction passwords
- ❌ Personal messages or communications

### Data Protection

- All AI analysis happens on secure servers
- Data encrypted in transit and at rest
- No personal information shared with third parties
- Fraud detection models trained on anonymized data
- Human review only if transaction flagged (privacy-focused)

---

## Frequently Asked Questions

### Why is my transaction stuck in "Verifying"?

**Normal Timeframe**: 1-24 hours for earnings, 2-4 hours for withdrawals

**If Longer Than Expected**:
- Check provider service status (may be delayed on their end)
- Ensure you completed activity properly
- Wait full 48 hours before contacting support
- Check for any error messages in transaction details

---

### Can I speed up verification?

**No way to manually expedite**, but you can help by:
- Maintaining good account standing
- Building transaction history over time
- Keeping profile accurate and complete
- Using consistent withdrawal methods

**What Doesn't Work**:
- ❌ Contacting support (they can't override AI)
- ❌ Canceling and resubmitting (resets queue)
- ❌ Creating new account (makes it slower)

---

### What if AI rejects my transaction?

**Check Error Details**:
- Transaction history will show reason
- Common reasons: duplicate, fraud pattern, provider declined

**Next Steps**:
1. Read error message carefully
2. Address the specific issue (e.g., correct mobile number)
3. Retry if instructed
4. Contact support if you believe it's an error

**For Legitimate Rejections**:
- Failed surveys: Improve completion quality
- Fraud flags: Ensure you're following Terms of Service
- Technical issues: Wait and retry later

---

### Is the AI Accountant always accurate?

**Accuracy Rate**: 99.7% (very few false positives)

**False Positive**:
- Legitimate transaction flagged as suspicious
- Usually resolved within 24 hours
- Human review clears false flags

**False Negative** (Rare):
- Fraudulent transaction approved initially
- System learns and improves detection
- Retroactive action taken if fraud confirmed

**If You Believe There's An Error**:
- Contact support with transaction ID
- Provide any relevant evidence
- Human review will investigate and resolve

---

### Can humans override the AI?

**Yes, in specific cases**:
- Flagged transactions (manual review)
- User disputes with valid evidence
- System errors or technical issues
- High-value transactions (manual approval may be required)

**No override for**:
- Standard verification timeframes
- Anti-fraud security measures
- Provider payment delays
- Minimum balance requirements

---

## Related Documentation

- **[Wallet User Guide](./WALLET_USER_GUIDE.md)** - Managing your wallet and balances
- **[Cash-Out Methods](./CASH_OUT_METHODS.md)** - Withdrawal options and processing
- **[Account Security](../../users/ACCOUNT_MANAGEMENT.md#security)** - Protecting your account

---

## Need Help?

If your transaction is:
- ✅ **Pending/Verifying**: Wait the normal timeframe (24-48 hours)
- ⚠️ **Flagged**: Wait for human review (24-48 hours)
- ❌ **Failed**: Check error message and retry with corrections
- ❓ **Stuck Beyond 48 Hours**: Contact support with transaction ID

**Support Response Time**: 24-48 hours for transaction issues

**Include in Support Request**:
- Transaction ID
- Date and amount
- Activity type (survey, withdrawal, etc.)
- Screenshot of transaction status
- Any error messages shown
