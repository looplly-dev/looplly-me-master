# Admin Profiling Management Guide

## Overview

The Profiling Admin Portal provides comprehensive tools for managing profile questions, categories, and country-specific configurations.

## Accessing Profiling Admin

Navigate to **Admin Portal → Profile Questions** to access the profiling management dashboard.

## Core Concepts

### Profile Categories
Categories organize related questions and map to the 3-level profiling strategy:

- **Level 1 Categories** - Essential demographic data
- **Level 2 Categories** - Lifestyle and preferences
- **Level 3 Categories** - Detailed behavioral data

Each category has:
- Display name and description
- Icon for visual identification
- Display order for UI presentation
- Default decay configuration
- Active/inactive status

### Profile Questions
Questions are the building blocks of the profiling system:

- **Question Key** - Unique identifier (e.g., `employment_status`)
- **Question Text** - User-facing prompt
- **Question Type** - Input type (select, multiselect, text, date, address, etc.)
- **Level** - Which profile level (1, 2, or 3)
- **Category** - Parent category
- **Required** - Whether answering is mandatory
- **Options** - Answer choices (for select/multiselect types)
- **Validation Rules** - Input constraints
- **Decay Configuration** - Staleness interval

### Country-Specific Options
Many questions have different answer options per country:

- **Global Fallback** - Default options for all countries
- **Country-Specific** - Localized options per ISO country code
- **AI Generation** - Automatically generate country options

## Managing Categories

### View Categories
All categories are listed with their level, order, and status. Filter by level or search by name.

### Create Category
1. Click **Add Category**
2. Enter display name and description
3. Choose icon from library
4. Set display order
5. Select level (1, 2, or 3)
6. Choose default decay config (optional)
7. Set active status
8. Click **Save**

### Edit Category
1. Click category card or row
2. Modify fields as needed
3. Click **Save Changes**

### Reorder Categories
Drag and drop categories to change display order, or edit the `display_order` field directly.

### Deactivate Category
Toggle the "Active" switch. Inactive categories are hidden from users but data is preserved.

## Managing Questions

### View Questions
Questions are organized by category and level. Use filters to narrow down:

- Filter by level (1, 2, 3)
- Filter by category
- Filter by active status
- Search by question text or key

### Create Question

#### Basic Information
1. Click **Add Question**
2. Enter question key (lowercase, underscores, unique)
3. Enter question text (user-facing prompt)
4. Select question type:
   - `text` - Short text input
   - `textarea` - Long text input
   - `select` - Single choice dropdown
   - `multiselect` - Multiple choice checkboxes
   - `date` - Date picker
   - `address` - Address autocomplete
   - `number` - Numeric input
   - `phone` - Phone number with country code

#### Categorization
5. Select level (1, 2, or 3)
6. Select parent category
7. Set display order within category
8. Mark as required if mandatory

#### Options (for select/multiselect types)
9. Add answer options:
   - Enter label (user-facing text)
   - Enter value (stored value)
   - Set display order
   - Add metadata if needed

#### Country Configuration
10. Choose applicability:
    - `global` - Same question for all countries
    - `country_specific` - Different per country
11. If country-specific, add country codes (ISO 2-letter)

#### Advanced Settings
12. Add help text (tooltip for users)
13. Add placeholder text
14. Configure validation rules (min/max length, regex, etc.)
15. Add targeting tags for survey matching
16. Set decay configuration
17. Mark as immutable if never expires (e.g., date_of_birth)

18. Click **Save Question**

### Edit Question
1. Click question card or row
2. Modify fields as needed
3. Save changes

**Note:** Changing `question_key` breaks existing answers. Use caution.

### Country Options Management

For questions with country-specific answer options:

#### Manual Entry
1. Open question editor
2. Navigate to **Country Options** tab
3. Select country code
4. Add options specific to that country
5. Save

#### AI Generation
1. Open question editor
2. Navigate to **Country Options** tab
3. Select country code(s) with missing options
4. Click **Generate with AI**
5. Review generated options
6. Approve or edit before saving

See [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md) for detailed AI usage.

### Bulk Operations
- **Import Questions** - Upload CSV with question definitions
- **Export Questions** - Download current question set
- **Bulk Deactivate** - Turn off multiple questions at once
- **Bulk Country Options** - Generate options for multiple countries

## Profile Decay Configuration

### Understanding Decay
Profile decay ensures data freshness by marking answers as "stale" after a configurable interval.

### Decay Config Keys
Predefined configurations:

- `immutable` - Never expires (e.g., date_of_birth)
- `short_term` - 30 days (e.g., current employment)
- `medium_term` - 180 days (e.g., brand preferences)
- `long_term` - 365 days (e.g., general interests)

### Assign Decay to Questions
1. Open question editor
2. Select decay config from dropdown
3. Save

### Create Custom Decay Config
1. Navigate to **Admin → Profile Decay**
2. Click **Add Configuration**
3. Enter config key and description
4. Set interval type and days
5. Save

See [Decay System](DECAY_SYSTEM.md) for technical details.

## Testing & Preview

### Preview Mode
Enable badge preview mode to see profiling UI as users see it:

1. Go to **Admin → Users**
2. Find your test account
3. Enable **Badge Preview Mode**
4. Navigate to user-facing Profile tab

### Test with Simulator
Use the Simulator to test profiling at different stages:

1. Navigate to **Admin → Simulator**
2. Create or select test user
3. Reset journey to specific stage
4. Complete profile questions
5. Verify data storage and decay logic

## Best Practices

### Question Design
- **Clear and Concise** - Use simple language
- **Single Topic** - One question per concept
- **Neutral Wording** - Avoid leading questions
- **Appropriate Options** - Cover full range of answers
- **Logical Order** - Progress from general to specific

### Category Organization
- **Logical Grouping** - Related questions together
- **Balanced Load** - Avoid categories with 50+ questions
- **Clear Labels** - Descriptive category names
- **Consistent Icons** - Visual consistency across levels

### Country-Specific Questions
- **Test Thoroughly** - Verify options for each country
- **Use AI Smartly** - Generate first draft, then review
- **Fallback Always** - Ensure global options exist
- **Local Expertise** - Consult local team for validation

### Decay Configuration
- **Match Data Type** - Align intervals with data volatility
- **User Burden** - Don't over-refresh
- **Strategic Freshness** - Prioritize business-critical data

## Monitoring & Analytics

### Question Performance
Track completion rates, skip rates, and time spent per question.

### Country Coverage
Monitor which countries have complete option sets.

### Decay Effectiveness
Review how often users refresh stale data.

### User Feedback
Monitor support requests related to specific questions.

## Troubleshooting

### Users Can't See Questions
- Verify question is active
- Check level matches user's profile level
- Confirm category is active
- Verify country applicability

### Country Options Missing
- Check if country-specific configuration exists
- Verify fallback global options are set
- Use AI generation tool to create options

### Data Not Saving
- Check validation rules aren't too restrictive
- Verify question type matches expected input
- Review RLS policies in database

## Additional Resources

- [Question Builder Guide](QUESTION_BUILDER_GUIDE.md) - Detailed question creation
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md) - Country-specific setup
- [Admin Auto-Generation Guide](ADMIN_AUTO_GENERATION_GUIDE.md) - AI tools usage
- [Architecture](ARCHITECTURE.md) - Technical implementation

## Need Help?

Contact the platform development team through the admin support channel.
