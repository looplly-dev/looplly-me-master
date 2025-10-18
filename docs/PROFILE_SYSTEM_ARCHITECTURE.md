# Profile System Architecture

## Overview

This document outlines the complete architecture for Looplly's multi-level profile system. The system is designed to progressively collect user information across three levels of priority, with built-in data decay tracking and contextual triggers.

### Key Features
- **3-Level Profile System**: Mandatory Level 1 (signup), Compulsory Level 2 (pre-earning), Progressive Level 3 (contextual)
- **Data Decay Tracking**: Automatic staleness detection based on configurable intervals
- **Google Places Integration**: Structured address collection with international support
- **Collapsible Category UI**: User-friendly accordion view matching Action Plan pattern
- **Admin Configuration Portal**: (Future) Complete question and category management

---

## 1. Database Schema Design

### A. `profile_categories` Table

Organizes profile questions into logical categories with visual hierarchy.

```sql
CREATE TABLE public.profile_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  priority_level INTEGER NOT NULL CHECK (priority_level IN (1, 2, 3)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view categories"
  ON public.profile_categories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories"
  ON public.profile_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

**Initial Seed Data:**
```sql
INSERT INTO public.profile_categories (name, icon_name, display_order, priority_level) VALUES
  ('Identity & Security', 'ShieldCheck', 1, 1),
  ('Demographics', 'Users', 2, 2),
  ('Financial Profile', 'DollarSign', 3, 2),
  ('Employment & Career', 'Briefcase', 4, 3),
  ('Lifestyle & Housing', 'Home', 5, 3),
  ('Automotive & Transportation', 'Car', 6, 3),
  ('Technology & Communication', 'Smartphone', 7, 3),
  ('Health & Wellness', 'Heart', 8, 3);
```

---

### B. `profile_questions` Table

Individual questions with validation rules, decay settings, and contextual triggers.

```sql
CREATE TABLE public.profile_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.profile_categories(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'select', 'multiselect', 'date', 'address', 'number', 'boolean')),
  options JSONB DEFAULT '[]'::jsonb,
  priority_level INTEGER NOT NULL CHECK (priority_level IN (1, 2, 3)),
  decay_days INTEGER NOT NULL DEFAULT 180,
  is_required BOOLEAN NOT NULL DEFAULT false,
  country_specific BOOLEAN NOT NULL DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profile_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view questions"
  ON public.profile_questions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage questions"
  ON public.profile_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX idx_profile_questions_category ON public.profile_questions(category_id);
CREATE INDEX idx_profile_questions_priority ON public.profile_questions(priority_level);
```

**Sample Level 1 Questions:**
```sql
-- Identity & Security Category
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, priority_level, decay_days, is_required) VALUES
  ((SELECT id FROM profile_categories WHERE name = 'Identity & Security'), 'first_name', 'First Name', 'text', 1, 365, true),
  ((SELECT id FROM profile_categories WHERE name = 'Identity & Security'), 'last_name', 'Last Name', 'text', 1, 365, true),
  ((SELECT id FROM profile_categories WHERE name = 'Identity & Security'), 'mobile', 'Mobile Number', 'text', 1, 365, true),
  ((SELECT id FROM profile_categories WHERE name = 'Identity & Security'), 'email', 'Email Address', 'text', 1, 365, false),
  ((SELECT id FROM profile_categories WHERE name = 'Identity & Security'), 'address', 'Full Address', 'address', 1, 180, true);
```

**Sample Level 2 Questions:**
```sql
-- Demographics Category
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, options, priority_level, decay_days, is_required) VALUES
  ((SELECT id FROM profile_categories WHERE name = 'Demographics'), 'gender', 'Gender', 'select', 
   '["Male", "Female", "Other", "Prefer not to say"]'::jsonb, 2, 365, true),
  ((SELECT id FROM profile_categories WHERE name = 'Demographics'), 'date_of_birth', 'Date of Birth', 'date', 2, 365, true),
  ((SELECT id FROM profile_categories WHERE name = 'Demographics'), 'ethnicity', 'Ethnicity', 'select', 
   '["White", "Black/African", "Coloured", "Indian/Asian", "Other"]'::jsonb, 2, 365, false);

-- Financial Profile Category
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, priority_level, decay_days, is_required, country_specific) VALUES
  ((SELECT id FROM profile_categories WHERE name = 'Financial Profile'), 'household_income', 'Household Income', 'select', 2, 90, true, true),
  ((SELECT id FROM profile_categories WHERE name = 'Financial Profile'), 'personal_income', 'Personal Income', 'select', 2, 90, true, true),
  ((SELECT id FROM profile_categories WHERE name = 'Financial Profile'), 'sec', 'Socio-Economic Classification (SEC)', 'select', 
   '["A", "B", "C1", "C2", "D", "E"]'::jsonb, 2, 180, true),
  ((SELECT id FROM profile_categories WHERE name = 'Financial Profile'), 'sem', 'Socio-Economic Measure (SEM)', 'select', 2, 180, true),
  ((SELECT id FROM profile_categories WHERE name = 'Financial Profile'), 'nccs', 'National Consumer Classification System (NCCS)', 'select', 2, 180, true);
```

---

### C. `profile_answers` Table

Stores all user responses with automatic expiry tracking.

```sql
CREATE TABLE public.profile_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, question_id)
);

-- Computed column for staleness check
ALTER TABLE public.profile_answers 
  ADD COLUMN is_stale BOOLEAN GENERATED ALWAYS AS (expires_at < now()) STORED;

-- RLS Policies
ALTER TABLE public.profile_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers"
  ON public.profile_answers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own answers"
  ON public.profile_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own answers"
  ON public.profile_answers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all answers"
  ON public.profile_answers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_profile_answers_user ON public.profile_answers(user_id);
CREATE INDEX idx_profile_answers_question ON public.profile_answers(question_id);
CREATE INDEX idx_profile_answers_stale ON public.profile_answers(is_stale) WHERE is_stale = true;

-- Trigger to calculate expires_at automatically
CREATE OR REPLACE FUNCTION set_profile_answer_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.answered_at + (
    SELECT (decay_days || ' days')::interval 
    FROM profile_questions 
    WHERE id = NEW.question_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_answer_expiry_trigger
  BEFORE INSERT OR UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_answer_expiry();
```

---

### D. `address_components` Table

Structured address storage with Google Places integration.

```sql
CREATE TABLE public.address_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  street_address TEXT,
  suburb TEXT,
  city TEXT,
  province_state TEXT,
  postal_code TEXT,
  country TEXT,
  google_place_id TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  formatted_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.address_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own address"
  ON public.address_components FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own address"
  ON public.address_components FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own address"
  ON public.address_components FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
  ON public.address_components FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Index
CREATE INDEX idx_address_components_user ON public.address_components(user_id);
```

---

### E. Enhanced `profiles` Table

Add completion tracking columns to existing table.

```sql
-- Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_1_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_2_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level_3_completion_percentage INTEGER DEFAULT 0 CHECK (level_3_completion_percentage >= 0 AND level_3_completion_percentage <= 100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_last_reviewed TIMESTAMP WITH TIME ZONE;

-- Function to update completion status
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_level_1_count INTEGER;
  v_level_2_count INTEGER;
  v_level_3_count INTEGER;
  v_level_1_answered INTEGER;
  v_level_2_answered INTEGER;
  v_level_3_answered INTEGER;
BEGIN
  -- Count total questions per level
  SELECT COUNT(*) INTO v_level_1_count FROM profile_questions WHERE priority_level = 1 AND is_required = true;
  SELECT COUNT(*) INTO v_level_2_count FROM profile_questions WHERE priority_level = 2 AND is_required = true;
  SELECT COUNT(*) INTO v_level_3_count FROM profile_questions WHERE priority_level = 3;

  -- Count answered questions per level
  SELECT COUNT(DISTINCT pa.question_id) INTO v_level_1_answered
  FROM profile_answers pa
  JOIN profile_questions pq ON pa.question_id = pq.id
  WHERE pa.user_id = NEW.user_id AND pq.priority_level = 1 AND pq.is_required = true;

  SELECT COUNT(DISTINCT pa.question_id) INTO v_level_2_answered
  FROM profile_answers pa
  JOIN profile_questions pq ON pa.question_id = pq.id
  WHERE pa.user_id = NEW.user_id AND pq.priority_level = 2 AND pq.is_required = true;

  SELECT COUNT(DISTINCT pa.question_id) INTO v_level_3_answered
  FROM profile_answers pa
  JOIN profile_questions pq ON pa.question_id = pq.id
  WHERE pa.user_id = NEW.user_id AND pq.priority_level = 3;

  -- Update profiles table
  UPDATE profiles SET
    level_1_complete = (v_level_1_answered >= v_level_1_count),
    level_2_complete = (v_level_2_answered >= v_level_2_count),
    level_3_completion_percentage = CASE 
      WHEN v_level_3_count = 0 THEN 100 
      ELSE (v_level_3_answered * 100 / v_level_3_count) 
    END,
    profile_last_reviewed = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_trigger
  AFTER INSERT OR UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();
```

---

## 2. Profile Level Logic

### Level 1: Mandatory (Signup Blocker)

**Purpose**: Essential identity and contact information required before account creation.

**Required Fields:**
- First Name
- Last Name
- Mobile Number (with country code detection)
- Address (via Google Places - structured components)
- Email (optional but recommended)

**Validation TypeScript Interface:**
```typescript
interface Level1Requirements {
  firstName: string;
  lastName: string;
  mobile: string;
  countryCode: string;
  address: {
    street: string;
    suburb?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  email?: string;
}

const validateLevel1 = (profile: Profile, address: AddressComponents): boolean => {
  return !!(
    profile.first_name?.trim() &&
    profile.last_name?.trim() &&
    profile.mobile?.trim() &&
    profile.country_code &&
    address.street?.trim() &&
    address.city?.trim() &&
    address.province?.trim() &&
    address.country?.trim()
  );
};
```

**Enforcement Point**: Registration flow - user cannot complete signup without Level 1.

---

### Level 2: Compulsory (Pre-Earning Blocker)

**Purpose**: Demographic and socio-economic data required for survey matching and earning eligibility.

**Required Fields:**
- Gender
- Date of Birth
- Household Income (country-specific ranges)
- Personal Income (country-specific ranges)
- SEC (Socio-Economic Classification: A, B, C1, C2, D, E)
- SEM (Socio-Economic Measure)
- NCCS (National Consumer Classification System)
- Ethnicity (recommended)

**Validation TypeScript Interface:**
```typescript
interface Level2Requirements {
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth: string;
  householdIncome: string;
  personalIncome: string;
  sec: 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E';
  sem: string;
  nccs: string;
  ethnicity?: string;
}

const validateLevel2 = (answers: ProfileAnswer[]): boolean => {
  const requiredLevel2Keys = [
    'gender',
    'date_of_birth',
    'household_income',
    'personal_income',
    'sec',
    'sem',
    'nccs'
  ];
  
  const answeredKeys = answers.map(a => a.question_key);
  const allAnswered = requiredLevel2Keys.every(key => answeredKeys.includes(key));
  const noStaleRequired = answers
    .filter(a => requiredLevel2Keys.includes(a.question_key))
    .every(a => !a.is_stale);
  
  return allAnswered && noStaleRequired;
};
```

**Enforcement Point**: 
- Block access to "Earn" tab until Level 2 complete
- Show completion prompt on dashboard
- Allow profile setup but prevent earning activities

---

### Level 3: Progressive (Contextual & Optional)

**Purpose**: Additional profiling data collected over time based on survey type, feature access, or time-based triggers.

**Categories:**
- Employment & Career (job title, industry, company size)
- Lifestyle & Housing (home ownership, household size, pets)
- Automotive & Transportation (car ownership, vehicle make/model, driving frequency)
- Technology & Communication (devices owned, internet connection, software usage)
- Health & Wellness (exercise frequency, dietary preferences, health conditions)
- Financial Details (banking products, insurance, investment preferences)

**Contextual Trigger Logic:**
```typescript
interface Level3Trigger {
  questionKey: string;
  triggerType: 'survey_category' | 'feature_access' | 'time_based' | 'milestone';
  triggerValue: string;
  priority: number;
}

// Example: Automotive survey triggers car-related questions
const checkLevel3Triggers = (
  user: User,
  surveyCategory: string,
  triggers: Level3Trigger[]
): string[] => {
  const triggeredQuestions: string[] = [];
  
  // Survey-based triggers
  if (surveyCategory === 'automotive') {
    triggeredQuestions.push('car_ownership', 'vehicle_make', 'vehicle_model', 'driving_frequency');
  }
  
  // Time-based triggers (e.g., 30 days since signup)
  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceSignup >= 30 && !user.level_3_completion_percentage) {
    triggeredQuestions.push('employment_status', 'home_ownership');
  }
  
  // Milestone triggers (e.g., completed 10 surveys)
  if (user.surveys_completed >= 10) {
    triggeredQuestions.push('banking_products', 'insurance_types');
  }
  
  return triggeredQuestions;
};
```

**Enforcement**: 
- Optional prompts before accessing specific surveys
- Progressive disclosure in Profile tab
- Gamified completion tracking (badges, rewards)

---

## 3. Profile Decay System

### Decay Concept

Profile data becomes "stale" after a configurable period. Users must refresh stale answers before accessing certain features or surveys.

### Default Decay Intervals

| Category | Decay Period | Rationale |
|----------|--------------|-----------|
| Identity & Security | 365 days | Names/contact info rarely change |
| Demographics | 365 days | Age/gender stable |
| Financial Profile | 90 days | Income/economic status fluctuates |
| Employment & Career | 90 days | Job changes common |
| Lifestyle & Housing | 180 days | Moderate change frequency |
| Automotive & Transportation | 180 days | Vehicle ownership updates |
| Technology & Communication | 120 days | Device/tech changes frequent |
| Health & Wellness | 180 days | Moderate health status changes |

### Decay Calculation

```typescript
interface DecayStatus {
  isStale: boolean;
  daysRemaining: number;
  daysOverdue: number;
  expiresAt: Date;
}

const calculateDecayStatus = (
  answeredAt: Date,
  decayDays: number
): DecayStatus => {
  const expiresAt = new Date(answeredAt);
  expiresAt.setDate(expiresAt.getDate() + decayDays);
  
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return {
    isStale: diffDays <= 0,
    daysRemaining: Math.max(0, diffDays),
    daysOverdue: Math.abs(Math.min(0, diffDays)),
    expiresAt
  };
};
```

### Decay Enforcement

**Soft Enforcement:**
- Visual indicators (amber warning icons)
- Profile completion percentage affected
- Prompt on dashboard: "3 profile answers need updating"

**Hard Enforcement (for Level 2 questions):**
- Block earning activities if critical Level 2 answers are stale
- "Your profile needs updating before you can access new surveys"

### Admin Decay Configuration

```typescript
interface DecayConfig {
  categoryId: string;
  defaultDecayDays: number;
  minDecayDays: number;
  maxDecayDays: number;
  notificationThreshold: number; // Days before expiry to notify user
}

// Admin can override per category
const updateDecaySettings = async (
  categoryId: string,
  newDecayDays: number
) => {
  await supabase
    .from('profile_questions')
    .update({ decay_days: newDecayDays })
    .eq('category_id', categoryId);
};
```

---

## 4. Google Places Address Integration

### Setup Requirements

1. **Google Cloud Project**: Enable Places API and Geocoding API
2. **API Key**: Stored in Supabase secrets as `GOOGLE_PLACES_API_KEY`
3. **React Package**: `@react-google-maps/api` or `react-google-autocomplete`

### Address Component Structure

```typescript
interface AddressComponents {
  street: string;
  streetNumber?: string;
  route?: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  countryCode: string;
  placeId: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
```

### Google Places Parser Utility

```typescript
const parseGooglePlaceResult = (
  place: google.maps.places.PlaceResult
): AddressComponents => {
  const components: Partial<AddressComponents> = {
    placeId: place.place_id || '',
    formattedAddress: place.formatted_address || '',
    coordinates: {
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0
    }
  };

  place.address_components?.forEach(component => {
    const types = component.types;

    if (types.includes('street_number')) {
      components.streetNumber = component.long_name;
    }
    if (types.includes('route')) {
      components.route = component.long_name;
    }
    if (types.includes('sublocality') || types.includes('neighborhood')) {
      components.suburb = component.long_name;
    }
    if (types.includes('locality')) {
      components.city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      components.province = component.long_name;
    }
    if (types.includes('postal_code')) {
      components.postalCode = component.long_name;
    }
    if (types.includes('country')) {
      components.country = component.long_name;
      components.countryCode = component.short_name;
    }
  });

  // Combine street number and route
  components.street = [components.streetNumber, components.route]
    .filter(Boolean)
    .join(' ');

  return components as AddressComponents;
};
```

### React Component Implementation

```tsx
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const AddressAutocomplete: React.FC<{
  onAddressSelect: (address: AddressComponents) => void;
  defaultValue?: string;
}> = ({ onAddressSelect, defaultValue }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
    libraries: ['places']
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const parsedAddress = parseGooglePlaceResult(place);
      onAddressSelect(parsedAddress);
    }
  };

  if (!isLoaded) return <Input placeholder="Loading address search..." disabled />;

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <Input
        type="text"
        placeholder="Start typing your address..."
        defaultValue={defaultValue}
        className="w-full"
      />
    </Autocomplete>
  );
};
```

### Country-Specific Address Handling

Different countries have different address hierarchies. Map Google's address components accordingly:

| Country | street | suburb | city | province | postal_code |
|---------|--------|--------|------|----------|-------------|
| South Africa | street_number + route | sublocality_level_1 | locality | administrative_area_level_1 | postal_code |
| United States | street_number + route | neighborhood | locality | administrative_area_level_1 | postal_code |
| United Kingdom | street_number + route | postal_town | locality | administrative_area_level_1 | postal_code |
| India | street_number + route | sublocality_level_2 | locality | administrative_area_level_1 | postal_code |

---

## 5. UI/UX Patterns

### Collapsible Category Component

Matches the "Action Plan" accordion style from RepTab.

```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, AlertTriangle, Clock } from 'lucide-react';

interface ProfileCategoryProps {
  category: {
    id: string;
    name: string;
    iconName: string;
  };
  questions: ProfileQuestion[];
  answers: Record<string, ProfileAnswer>;
  onAnswerChange: (questionKey: string, value: any) => void;
}

export const ProfileCategory: React.FC<ProfileCategoryProps> = ({
  category,
  questions,
  answers,
  onAnswerChange
}) => {
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(q => answers[q.question_key]).length;
  const staleCount = questions.filter(q => {
    const answer = answers[q.question_key];
    return answer?.is_stale;
  }).length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);
  const isComplete = answeredCount === totalQuestions && staleCount === 0;

  return (
    <Card>
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Icon + Category Name */}
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="text-3xl">
                  <Icon name={category.iconName} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {answeredCount} of {totalQuestions} completed
                  </p>
                </div>
              </div>

              {/* Right: Status Indicators */}
              <div className="flex items-center gap-2">
                <Badge variant={isComplete ? "default" : "secondary"}>
                  {completionPercentage}%
                </Badge>

                {staleCount > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">{staleCount}</span>
                  </div>
                )}

                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 border-t">
            <div className="space-y-4 pt-4">
              {questions.map(question => {
                const answer = answers[question.question_key];
                const isStale = answer?.is_stale;

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <label className="text-sm font-medium">
                        {question.question_text}
                        {question.is_required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>

                      {isStale && (
                        <div className="flex items-center gap-1 text-amber-600 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Needs update</span>
                        </div>
                      )}
                    </div>

                    <ProfileQuestionInput
                      question={question}
                      value={answer?.answer_value}
                      onChange={(value) => onAnswerChange(question.question_key, value)}
                      isStale={isStale}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
```

### Stale Data Indicator

```tsx
const StaleDataBanner: React.FC<{ staleQuestions: ProfileQuestion[] }> = ({ staleQuestions }) => {
  if (staleQuestions.length === 0) return null;

  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Profile Update Needed</AlertTitle>
      <AlertDescription>
        {staleQuestions.length} profile {staleQuestions.length === 1 ? 'answer needs' : 'answers need'} updating.
        Please review and refresh your information.
      </AlertDescription>
    </Alert>
  );
};
```

### Profile Completion Progress

```tsx
const ProfileCompletionCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Profile Completion</h3>
            <span className="text-2xl font-bold text-primary">
              {profile.level_3_completion_percentage}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Level 1 - Essential Info
              </span>
              <Badge variant={profile.level_1_complete ? "default" : "secondary"}>
                {profile.level_1_complete ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Level 2 - Earning Requirements
              </span>
              <Badge variant={profile.level_2_complete ? "default" : "secondary"}>
                {profile.level_2_complete ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                Level 3 - Additional Details
              </span>
              <Badge variant="secondary">
                {profile.level_3_completion_percentage}%
              </Badge>
            </div>
          </div>

          <Progress value={profile.level_3_completion_percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 6. Admin Portal Requirements

### A. Profile Question Management

**Features:**
- ✅ CRUD operations for categories and questions
- ✅ Drag-and-drop reordering of categories and questions
- ✅ Set priority levels (1, 2, 3) per question
- ✅ Configure decay intervals (days) per question or category
- ✅ Define country-specific questions with option sets
- ✅ Set validation rules (min/max length, regex patterns, required)
- ✅ Preview question as users will see it
- ✅ Bulk import/export questions (CSV/JSON)

**UI Components:**
```
AdminQuestionsPage
├── CategoryList (sortable)
│   ├── CategoryCard (editable)
│   │   ├── CategoryForm (name, icon, priority level)
│   │   └── QuestionList (sortable)
│   │       └── QuestionCard (editable)
│   │           ├── QuestionForm (text, type, options, decay)
│   │           └── ValidationRulesBuilder
│   └── AddCategoryButton
└── BulkImportExportActions
```

---

### B. Profile Analytics Dashboard

**Metrics to Track:**

1. **Completion Rates:**
   - Level 1 completion rate (%)
   - Level 2 completion rate (%)
   - Level 3 average completion (%)
   - Completion rate by category

2. **Data Staleness:**
   - Total stale answers across all users
   - Stale answers by category
   - Average days since last profile update
   - Users with critical stale data (Level 2)

3. **Question Performance:**
   - Answer rate per question (%)
   - Average time to answer per question
   - Skip rate per question
   - Most/least completed categories

4. **User Segmentation:**
   - Completion rate by country
   - Completion rate by user tenure
   - Completion rate by earning tier

**Dashboard UI:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <MetricCard
    title="Level 1 Completion"
    value="98.5%"
    trend="+2.3%"
    icon={<CheckCircle />}
  />
  <MetricCard
    title="Level 2 Completion"
    value="76.2%"
    trend="-1.5%"
    icon={<Users />}
  />
  <MetricCard
    title="Stale Profiles"
    value="234"
    trend="+12"
    variant="warning"
    icon={<AlertTriangle />}
  />
</div>

<Card>
  <CardHeader>
    <CardTitle>Category Completion Rates</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={categoryCompletionData}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="completion" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

---

### C. Profile Configuration Settings

**Settings Panel:**

1. **Decay Settings:**
   - Enable/disable decay tracking globally
   - Set default decay intervals per category
   - Configure notification thresholds (e.g., notify 7 days before expiry)
   - Email/SMS reminder frequency

2. **Progressive Profiling:**
   - Enable/disable Level 3 contextual triggers
   - Define trigger rules (survey type, milestone, time-based)
   - Set Level 3 question priority queue

3. **Country-Specific Options:**
   - Manage income ranges per country
   - Define ethnicity options per country
   - Configure address parsing rules

4. **Validation Rules:**
   - Set global validation patterns (email, phone)
   - Configure min/max age requirements
   - Define acceptable answer formats

---

### D. User Profile Review

**Admin User Search & Management:**

1. **Search & Filter:**
   - Search users by name, email, mobile
   - Filter by profile completion status
   - Filter by stale data presence
   - Filter by country, SEC, level

2. **User Profile View:**
   - View all profile answers with timestamps
   - See stale answers highlighted
   - View completion percentage per level
   - Audit log of profile changes

3. **Admin Actions:**
   - Manually flag answer as stale
   - Reset decay timer for specific answers
   - Override validation rules for individual users
   - Export user profile data (CSV/PDF)

4. **Bulk Operations:**
   - Bulk reset stale data flags
   - Bulk notify users with incomplete profiles
   - Bulk export profile data for analysis

---

## 7. Migration Strategy

### Phase 1: Database Setup (Week 1)

**Tasks:**
1. ✅ Create `profile_categories` table with RLS policies
2. ✅ Create `profile_questions` table with RLS policies
3. ✅ Create `profile_answers` table with RLS policies and triggers
4. ✅ Create `address_components` table with RLS policies
5. ✅ Alter `profiles` table to add completion tracking columns
6. ✅ Create database functions for expiry calculation and completion updates
7. ✅ Seed initial categories (8 categories)
8. ✅ Seed Level 1 questions (5 questions)
9. ✅ Seed Level 2 questions (8 questions)

**Success Criteria:**
- All tables created with proper indexes
- RLS policies tested and validated
- Seed data inserted successfully
- Triggers firing correctly

---

### Phase 2: Data Migration (Week 1)

**Tasks:**
1. ✅ Migrate existing `profiles` table data to `profile_answers`:
   - Map `first_name` → question_key='first_name'
   - Map `last_name` → question_key='last_name'
   - Map `gender` → question_key='gender'
   - Map `date_of_birth` → question_key='date_of_birth'
   - Map `household_income` → question_key='household_income'
   - Map `ethnicity` → question_key='ethnicity'
   - Map `sec` → question_key='sec'
2. ✅ Parse existing `address` field into structured `address_components`
3. ✅ Calculate initial `expires_at` for migrated answers
4. ✅ Update `level_1_complete`, `level_2_complete` flags

**Migration SQL Example:**
```sql
-- Migrate first_name
INSERT INTO profile_answers (user_id, question_id, answer_value, answered_at, expires_at)
SELECT 
  p.user_id,
  (SELECT id FROM profile_questions WHERE question_key = 'first_name'),
  jsonb_build_object('value', p.first_name),
  p.created_at,
  p.created_at + INTERVAL '365 days'
FROM profiles p
WHERE p.first_name IS NOT NULL;

-- Repeat for all existing fields...
```

**Success Criteria:**
- 100% of existing profile data migrated
- No data loss during migration
- Completion flags accurately reflect migrated data

---

### Phase 3: Frontend Implementation (Week 2-3)

**Week 2: Core Components**
1. ✅ Install Google Places API dependencies
2. ✅ Create `AddressAutocomplete` component
3. ✅ Build `ProfileCategory` collapsible component
4. ✅ Build `ProfileQuestionInput` component (handles all question types)
5. ✅ Create `useProfileData` hook for fetching questions/answers
6. ✅ Create `useProfileAnswers` hook for submitting answers

**Week 3: Integration & Polish**
1. ✅ Refactor `ProfileTab` to use new category structure
2. ✅ Implement Level 1 validation in `ProfileSetup`
3. ✅ Add Level 2 blocker in `EarnTab`
4. ✅ Create stale data banner and indicators
5. ✅ Add profile completion progress card
6. ✅ Test mobile responsiveness

**Success Criteria:**
- Profile tab displays all categories correctly
- Address autocomplete works across multiple countries
- Stale data indicators appear correctly
- Level 1/2 blocking works as expected

---

### Phase 4: Admin Portal (Week 4-6) - FUTURE

**Week 4: Question Management**
1. Build admin question management page
2. Implement category CRUD operations
3. Implement question CRUD operations
4. Add drag-and-drop reordering

**Week 5: Analytics**
1. Build profile analytics dashboard
2. Implement completion rate tracking
3. Add stale data metrics
4. Create question performance reports

**Week 6: Configuration & Polish**
1. Build configuration settings page
2. Implement decay notification system
3. Add user profile review interface
4. Test and refine admin workflows

---

## 8. Security & Privacy Considerations

### Row-Level Security (RLS)

**User Access:**
```sql
-- Users can only access their own profile data
CREATE POLICY "Users can view own answers"
  ON profile_answers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own answers"
  ON profile_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own answers"
  ON profile_answers FOR UPDATE
  USING (user_id = auth.uid());
```

**Admin Access:**
```sql
-- Admins can view all profiles and manage questions
CREATE POLICY "Admins can view all answers"
  ON profile_answers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage questions"
  ON profile_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

---

### Data Encryption

**At-Rest Encryption:**
- Supabase provides automatic encryption for all stored data
- Consider additional encryption for highly sensitive fields (SSN, financial data) if added in future

**In-Transit Encryption:**
- All API calls use HTTPS/TLS
- Supabase client enforces encrypted connections

---

### Audit Trail

**Profile Change Logging:**
```sql
CREATE TABLE profile_answer_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES profile_answers(id),
  user_id UUID REFERENCES auth.users(id),
  question_id UUID REFERENCES profile_questions(id),
  old_value JSONB,
  new_value JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  change_source TEXT -- 'user_edit', 'admin_override', 'system_migration'
);

-- Trigger to log changes
CREATE OR REPLACE FUNCTION log_profile_answer_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.answer_value != NEW.answer_value) THEN
    INSERT INTO profile_answer_audit (answer_id, user_id, question_id, old_value, new_value, changed_by, change_source)
    VALUES (NEW.id, NEW.user_id, NEW.question_id, OLD.answer_value, NEW.answer_value, auth.uid(), 'user_edit');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_profile_answer_changes
  AFTER UPDATE ON profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_answer_change();
```

---

### GDPR Compliance

**Right to Access:**
```typescript
// Edge Function: export-user-profile
export const exportUserProfile = async (userId: string) => {
  const { data: answers } = await supabase
    .from('profile_answers')
    .select('*, profile_questions(*)')
    .eq('user_id', userId);

  const { data: address } = await supabase
    .from('address_components')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    profile_answers: answers,
    address_components: address,
    exported_at: new Date().toISOString()
  };
};
```

**Right to Deletion:**
```typescript
// Edge Function: delete-user-profile-data
export const deleteUserProfileData = async (userId: string) => {
  // Delete cascades handled by foreign key constraints
  await supabase.from('profile_answers').delete().eq('user_id', userId);
  await supabase.from('address_components').delete().eq('user_id', userId);
  
  // Anonymize profile record instead of deleting (retain analytics)
  await supabase
    .from('profiles')
    .update({
      first_name: 'Deleted',
      last_name: 'User',
      email: null,
      mobile: null,
      is_deleted: true
    })
    .eq('user_id', userId);
};
```

**Right to Portability:**
- Provide JSON/CSV export of all profile data
- Include timestamps and answer history

---

### Consent Management

**Question-Level Consent:**
```typescript
interface ProfileQuestionConsent {
  questionId: string;
  consentGiven: boolean;
  consentDate: Date;
  consentType: 'required' | 'optional' | 'marketing';
}

// Store consent in question metadata
const recordConsent = async (userId: string, questionId: string) => {
  await supabase.from('profile_answers').update({
    metadata: {
      consent_given: true,
      consent_date: new Date().toISOString()
    }
  }).match({ user_id: userId, question_id: questionId });
};
```

---

## 9. API Endpoints (Edge Functions)

### A. `get-profile-questions`

**Purpose**: Fetch profile questions by level and category

**Request:**
```typescript
{
  priorityLevel?: 1 | 2 | 3;
  categoryId?: string;
  includeAnswers?: boolean;
}
```

**Response:**
```typescript
{
  categories: Array<{
    id: string;
    name: string;
    iconName: string;
    priorityLevel: number;
    questions: Array<{
      id: string;
      questionKey: string;
      questionText: string;
      questionType: string;
      options: any[];
      decayDays: number;
      isRequired: boolean;
      answer?: {
        value: any;
        answeredAt: string;
        expiresAt: string;
        isStale: boolean;
      };
    }>;
  }>;
}
```

---

### B. `submit-profile-answers`

**Purpose**: Batch update user profile answers

**Request:**
```typescript
{
  answers: Array<{
    questionKey: string;
    answerValue: any;
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  updatedCount: number;
  profileCompletion: {
    level1Complete: boolean;
    level2Complete: boolean;
    level3Percentage: number;
  };
  errors?: Array<{
    questionKey: string;
    error: string;
  }>;
}
```

**Implementation:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const { answers } = await req.json();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const results = [];
  for (const { questionKey, answerValue } of answers) {
    const { data: question } = await supabase
      .from('profile_questions')
      .select('id')
      .eq('question_key', questionKey)
      .single();

    if (question) {
      const { error } = await supabase
        .from('profile_answers')
        .upsert({
          user_id: user.id,
          question_id: question.id,
          answer_value: { value: answerValue },
          answered_at: new Date().toISOString()
        }, { onConflict: 'user_id,question_id' });

      results.push({ questionKey, success: !error, error: error?.message });
    }
  }

  // Fetch updated completion status
  const { data: profile } = await supabase
    .from('profiles')
    .select('level_1_complete, level_2_complete, level_3_completion_percentage')
    .eq('user_id', user.id)
    .single();

  return new Response(JSON.stringify({
    success: true,
    updatedCount: results.filter(r => r.success).length,
    profileCompletion: profile,
    errors: results.filter(r => !r.success)
  }), { headers: { 'Content-Type': 'application/json' } });
});
```

---

### C. `check-profile-completeness`

**Purpose**: Validate profile level completion before allowing actions

**Request:**
```typescript
{
  requiredLevel: 1 | 2;
}
```

**Response:**
```typescript
{
  isComplete: boolean;
  missingQuestions?: Array<{
    questionKey: string;
    questionText: string;
    category: string;
  }>;
  staleQuestions?: Array<{
    questionKey: string;
    questionText: string;
    daysOverdue: number;
  }>;
}
```

---

### D. `get-stale-questions`

**Purpose**: Fetch all stale profile answers for a user

**Response:**
```typescript
{
  staleCount: number;
  staleQuestions: Array<{
    questionKey: string;
    questionText: string;
    category: string;
    lastAnswered: string;
    daysOverdue: number;
    priorityLevel: number;
  }>;
}
```

---

### E. `admin-manage-questions` (Future)

**Purpose**: Admin CRUD operations for questions and categories

**Endpoints:**
- `POST /admin/categories` - Create category
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category
- `POST /admin/questions` - Create question
- `PUT /admin/questions/:id` - Update question
- `DELETE /admin/questions/:id` - Delete question
- `PUT /admin/questions/reorder` - Reorder questions

---

## 10. Implementation Phases (User Portal)

### Phase 1: Database Foundation ✅

**Deliverables:**
1. All 4 new tables created (`profile_categories`, `profile_questions`, `profile_answers`, `address_components`)
2. RLS policies configured
3. Database triggers for expiry and completion tracking
4. Initial seed data (categories + Level 1/2 questions)
5. Data migration from existing `profiles` table

**Timeline**: 1 week

---

### Phase 2: Address Integration 🔄

**Deliverables:**
1. Google Places API key added to secrets
2. `@react-google-maps/api` package installed
3. `AddressAutocomplete` component built
4. Address parser utility (`parseGooglePlaceResult`)
5. Integration with `address_components` table
6. Test across SA, US, UK, India addresses

**Timeline**: 3-5 days

---

### Phase 3: ProfileTab Refactor 🔄

**Deliverables:**
1. `ProfileCategory` collapsible component
2. `ProfileQuestionInput` component (handles all input types)
3. `useProfileData` hook for fetching questions/categories/answers
4. `useProfileAnswers` hook for submitting answers
5. Refactored `ProfileTab` using new components
6. Profile completion progress card
7. Stale data indicators and banner

**Timeline**: 5-7 days

---

### Phase 4: Level Validation Logic 🔄

**Deliverables:**
1. Level 1 validation in `ProfileSetup` during registration
2. Level 2 blocker in `EarnTab` (block surveys until complete)
3. Profile completion prompts on dashboard
4. Level 3 contextual trigger system (basic version)
5. Testing of all blocking/gating logic

**Timeline**: 3-5 days

---

### Phase 5: Polish & Testing ⏳

**Deliverables:**
1. Mobile responsiveness testing
2. Cross-browser testing
3. Performance optimization (lazy loading, caching)
4. Edge case handling (network failures, partial saves)
5. User acceptance testing
6. Documentation for end users

**Timeline**: 3-5 days

---

## 11. Success Metrics

### User Metrics
- **Level 1 Completion Rate**: Target 98%+ (must complete to register)
- **Level 2 Completion Rate**: Target 80%+ (required for earning)
- **Level 3 Completion Rate**: Target 40%+ (optional, progressive)
- **Average Time to Complete Level 1**: Target <5 minutes
- **Average Time to Complete Level 2**: Target <8 minutes
- **Profile Update Rate**: Target 70%+ of stale profiles updated within 7 days

### System Metrics
- **Address Parsing Accuracy**: Target 95%+ correct component extraction
- **API Response Time**: Target <500ms for profile data fetch
- **Data Integrity**: 0% data loss during migrations

### Business Metrics
- **Survey Match Rate Improvement**: Target 15%+ increase with better profile data
- **User Engagement**: Target 25%+ increase in survey completions (due to better matching)
- **Data Freshness**: Target <10% of active users with stale Level 2 data

---

## 12. Future Enhancements

### Advanced Features (Post-MVP)
1. **AI-Powered Profiling**: Suggest answers based on user behavior
2. **Social Profile Import**: Import data from LinkedIn, Facebook (with consent)
3. **Progressive Disclosure**: Smart question ordering based on user preferences
4. **Gamification**: Badges/rewards for profile completion milestones
5. **Profile Verification**: Third-party verification for income, employment
6. **Multi-Language Support**: Translate questions based on country
7. **Voice Input**: Speech-to-text for mobile profile completion
8. **Profile Insights**: "Your profile is 85% similar to top earners"

### Admin Features (Post-MVP)
1. **A/B Testing**: Test different question phrasings
2. **Question Recommendation Engine**: Suggest new questions based on survey needs
3. **Profile Data Export**: Bulk export for analytics/reporting
4. **Custom Question Types**: Build new input types beyond standard set
5. **Profile Scoring**: Assign quality scores to profiles based on completeness

---

## Conclusion

This architecture provides a robust, scalable foundation for Looplly's multi-level profile system. The phased approach allows for incremental delivery while maintaining data integrity and user experience quality.

**Key Takeaways:**
- ✅ Clear separation of profile levels (mandatory, compulsory, progressive)
- ✅ Automated data decay tracking to ensure profile freshness
- ✅ User-friendly collapsible UI matching existing design patterns
- ✅ Comprehensive admin portal roadmap for future flexibility
- ✅ Strong security and privacy foundations (RLS, encryption, GDPR)
- ✅ Structured address collection with international support

**Next Steps:**
1. Review and approve this architecture document
2. Begin Phase 1 database implementation
3. Schedule weekly check-ins to track progress
4. Plan user acceptance testing after Phase 3

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-18  
**Author**: Looplly Development Team  
**Status**: Ready for Implementation
