# Competition Feature Implementation Guide

## Overview

The Competition (Musobaqa) feature has been successfully implemented as an MVP in your Remote Testing System. This document provides a complete guide for setup, usage, and understanding of the feature.

## What's Been Implemented

### 1. Database Schema

**File**: `supabase/migrations/002_competitions.sql`

Created two main tables:

- **competitions**: Stores competition metadata (title, dates, test reference, limits)
- **competition_participants**: Tracks student participation and scores

Key features:

- Row Level Security (RLS) policies for admin/student access
- Automatic rank calculation via PostgreSQL function
- Indexes for performance optimization
- One attempt per student constraint

### 2. React Components

**Directory**: `web/src/components/competitions/`

Created 4 reusable components:

- **CompetitionStatus**: Badge showing upcoming/active/ended status
- **CompetitionTimer**: Real-time countdown with color-coded warnings
- **CompetitionCard**: Display card for competition listings
- **LeaderboardTable**: Rankings table with medals for top 3

### 3. Admin Pages

**Directory**: `web/src/app/admin/competitions/`

- **List/Create Page** (`page.tsx`): View all competitions, create new ones
- **Detail Page** (`[competitionId]/page.tsx`): Edit competition, view stats and leaderboard
- **Server Actions** (`actions.ts`): Create, update, delete competitions

Features:

- Create competitions with time limits and participant caps
- Edit competition details and publish status
- View real-time statistics (participants, completions, questions)
- Monitor leaderboard with rankings

### 4. Student Pages

**Directory**: `web/src/app/student/competitions/`

- **List Page** (`page.tsx`): Browse available competitions
- **Detail Page** (`[competitionId]/page.tsx`): View competition info and leaderboard
- **Attempt Page** (`[competitionId]/attempt/page.tsx`): Take the test
- **Results Page** (`[competitionId]/results/page.tsx`): View personal results and ranking
- **Server Actions** (`actions.ts`): Join competition, submit answers

Features:

- Browse published competitions
- Join competitions (with eligibility checks)
- One-way test navigation (no backward movement)
- Auto-submit on timeout
- View personal rank and score
- See full leaderboard with highlighting

### 5. Navigation Updates

Updated both admin and student layouts to include "Musobaqalar" navigation links.

## Setup Instructions

### Step 1: Apply Database Migration

Run the SQL migration in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/002_competitions.sql`
4. Execute the SQL

The migration will:

- Create `competitions` table
- Create `competition_participants` table
- Set up RLS policies
- Create rank update function
- Add performance indexes

### Step 2: Environment Variables

No additional environment variables needed. Uses existing Supabase configuration.

### Step 3: Start the Application

```bash
cd web
npm run dev
```

Access the application at `http://localhost:3000`

## Usage Guide

### For Admins

#### Creating a Competition

1. Navigate to `/admin/competitions`
2. Fill in the competition form:
   - **Title**: Name of the competition (e.g., "Matematika Olimpiadasi 2024")
   - **Description**: Brief description (optional)
   - **Start Date**: When the competition begins
   - **End Date**: When the competition ends
   - **Test**: Select from published tests
   - **Max Participants**: Limit entries (optional, leave blank for unlimited)
   - **Published**: Check to make visible to students
3. Click "Musobaqa Yaratish"

#### Managing Competitions

- View all competitions in the table
- Click "Ko'rish" to see details and statistics
- Edit competition details on the detail page
- Delete competitions with confirmation
- Monitor leaderboard in real-time

#### Viewing Statistics

On the competition detail page, you can see:

- Total participants (enrolled)
- Completed participants (finished)
- Number of questions in the test
- Full leaderboard with ranks

### For Students

#### Browsing Competitions

1. Navigate to `/student/competitions`
2. View all published competitions
3. See competition status (upcoming/active/ended)
4. Check participant counts and limits

#### Joining a Competition

1. Click on a competition card or "Qatnashish"
2. On the detail page, review:
   - Competition dates
   - Test information
   - Current leaderboard
   - Number of questions
3. Click "Qatnashish" to join (only during active period)

#### Taking the Test

1. After joining, click "Boshlash"
2. Test interface features:
   - Real-time countdown timer
   - Progress bar showing answered questions
   - One question at a time
   - Cannot go back to previous questions
   - Must answer current question to proceed
3. Answer all questions
4. Click "Testni yakunlash" to submit
5. Auto-submit occurs if time runs out

#### Viewing Results

After completion, you'll see:

- Your rank (with medal if top 3)
- Your score
- Time taken
- Full leaderboard with your position highlighted

## MVP Features Implemented

✅ **Core Functionality**

- Competition creation and management
- Student enrollment with limits
- One attempt per student
- Timed test taking
- Auto-submit on timeout
- Real-time leaderboard

✅ **User Experience**

- Modern, responsive UI
- Clear competition status indicators
- Real-time countdown timers
- Progress tracking during tests
- Medal badges for top 3
- Uzbek language interface

✅ **Security**

- Row Level Security policies
- Server-side score calculation
- Participation validation
- Time limit enforcement

## Not Included in MVP

As per requirements, the following were intentionally excluded:

- Payment system
- Certificate generation
- Real-time notifications
- Chat/messaging
- Advanced analytics
- Email notifications
- Mobile app

## Technical Details

### Database Schema

**competitions table:**

```sql
- id (uuid, primary key)
- title (text)
- description (text, nullable)
- test_id (uuid, foreign key to tests)
- start_date (timestamptz)
- end_date (timestamptz)
- max_participants (integer, nullable)
- published (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

**competition_participants table:**

```sql
- id (uuid, primary key)
- competition_id (uuid, foreign key)
- student_id (uuid, foreign key)
- score (integer, nullable)
- time_taken (integer, nullable) -- seconds
- rank (integer, nullable)
- joined_at (timestamptz)
- completed_at (timestamptz, nullable)
```

### Rank Calculation

Ranks are automatically calculated by the `update_competition_ranks` PostgreSQL function:

- Primary sort: Score (descending)
- Secondary sort: Time taken (ascending)
- Ties are broken by completion time

The function is called after each submission to update all ranks.

### Security Policies

**Admin Access:**

- Full CRUD on competitions
- View all participants

**Student Access:**

- View published competitions only
- Create participation records (during active period)
- Update own participation (score submission)
- View all completed participants (leaderboard)

### Component Props

**CompetitionCard:**

- Competition metadata (id, title, dates, etc.)
- Participant counts
- User participation status
- Role-based actions

**CompetitionTimer:**

- End time (timestamp)
- Callback on timeout
- Color-coded warnings (red < 60s, yellow < 5min)

**LeaderboardTable:**

- Array of entries (rank, name, score, time)
- Current user highlighting
- Maximum score for percentage calculation

## Testing Checklist

### Admin Flow

- ✅ Create competition with all fields
- ✅ Create competition with minimal fields
- ✅ Edit competition details
- ✅ Delete competition
- ✅ Toggle publish status
- ✅ View statistics
- ✅ View leaderboard updates

### Student Flow

- ✅ Browse competitions
- ✅ View competition details
- ✅ Join active competition
- ✅ Cannot join upcoming competition
- ✅ Cannot join ended competition
- ✅ Cannot join when full
- ✅ Take test with timer
- ✅ Forward-only navigation
- ✅ Auto-submit on timeout
- ✅ View results with rank
- ✅ See updated leaderboard

### Edge Cases

- ✅ Competition starts/ends while viewing
- ✅ Multiple students completing simultaneously
- ✅ Participant limit reached
- ✅ Test with no questions
- ✅ Already joined competition

## Troubleshooting

### Migration Errors

If the migration fails:

1. Check if tables already exist
2. Verify RLS is enabled on your project
3. Ensure you have admin permissions

### Rank Not Updating

If ranks don't update after submission:

1. Check if the `update_competition_ranks` function exists
2. Verify it's being called in the submit action
3. Look for errors in Supabase logs

### Timer Issues

If the timer displays incorrectly:

1. Verify server time synchronization
2. Check browser console for errors
3. Ensure `time_limit_seconds` is set on the test

### Permission Errors

If users can't access pages:

1. Verify RLS policies are applied
2. Check user role in profiles table
3. Confirm competition is published (for students)

## Future Enhancements

Potential features for future versions:

- PDF certificate generation
- Email notifications for competition start/results
- Competition categories and filtering
- Practice mode (unlimited attempts)
- Question bank randomization
- Detailed analytics dashboard
- Export results to CSV
- Student performance history
- Competition templates
- Scheduled publishing
- Multi-language support

## API Reference

### Server Actions

**joinCompetitionAction(formData)**

- Enrolls student in competition
- Validates eligibility (dates, limits)
- Creates participant record

**submitCompetitionAction(formData)**

- Calculates score based on correct answers
- Records completion time
- Updates participant record
- Triggers rank recalculation

**createCompetitionAction(formData)**

- Creates new competition (admin only)
- Validates required fields
- Links to existing test

**updateCompetitionAction(formData)**

- Updates competition details (admin only)
- Maintains test reference
- Updates publish status

**deleteCompetitionAction(formData)**

- Removes competition (admin only)
- Cascades to participant records

## Database Functions

**update_competition_ranks(comp_id uuid)**

```sql
-- Recalculates ranks for all participants in a competition
-- Orders by: score DESC, time_taken ASC, completed_at ASC
-- Updates rank field for each participant
```

## Support

For issues or questions:

1. Check TypeScript errors in browser console
2. Review Supabase logs for database errors
3. Verify migration was applied successfully
4. Ensure all environment variables are set

## Conclusion

The Competition feature is now fully integrated into your Remote Testing System. Students can participate in time-limited competitions, and admins can create and manage them with ease. The leaderboard provides real-time feedback on performance, encouraging healthy competition among students.

The implementation follows MVP principles with a focus on core functionality, security, and user experience. All features are production-ready and can be used immediately after applying the database migration.
