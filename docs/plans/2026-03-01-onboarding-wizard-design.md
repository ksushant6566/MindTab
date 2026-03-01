# MindTab Onboarding Wizard Design

## Problem

New users sign up and land on a completely empty dashboard with no projects, goals, habits, or notes. There is no onboarding flow, so users must figure out the platform on their own. This leads to a poor first impression and likely early drop-off.

## Solution

A mandatory, full-screen, 4-step onboarding wizard that guides new users to create their first project, goal, and habit. The wizard is action-oriented — users learn by doing, and their dashboard is populated by the time they finish.

## Design Decisions

- **Mandatory, no skip** — every new user completes all 4 steps
- **Action-oriented** — each step creates a real item via existing tRPC mutations
- **Full-screen wizard** — clean, focused experience without dashboard distractions
- **Database-backed state** — `onboardingCompleted` boolean on users table, synced across devices
- **Existing mutations reused** — no new CRUD logic needed, only a new `completeOnboarding` mutation

## Flow

```
Step 1: Welcome        → Greet user by name, preview what they'll set up
Step 2: Create Project → Name + optional description
Step 3: Create Goal    → Title + priority + impact, auto-assigned to step 2's project
Step 4: Create Habit   → Title + optional description, then mark onboarding complete
```

After step 4, a brief success state is shown, then the user is redirected to the populated dashboard.

## Step Details

### Step 1 — Welcome

- **Heading:** "Welcome to MindTab, {firstName}!"
- **Subtitle:** "Your new tab is about to become your personal productivity hub."
- **Content:** 3 icon cards previewing what they'll set up:
  - A Project (folder icon) — "Organize your work"
  - A Goal (target icon) — "Track what matters"
  - A Habit (repeat icon) — "Build consistency"
- **CTA:** "Let's get started" button
- **No back button** on this step

### Step 2 — Create Your First Project

- **Heading:** "Create your first project"
- **Subtitle:** "Projects help you organize goals and notes. Think of them like folders."
- **Form fields:**
  - Project Name (required, text input)
  - Description (optional, textarea)
- **Placeholder suggestions:** "Personal Growth", "Work Q1", "Fitness"
- **CTA:** "Create Project" button (disabled until name filled)
- **Mutation:** `projects.create` with status "active", startDate = today
- **Back button** returns to step 1

### Step 3 — Create Your First Goal

- **Heading:** "Set your first goal"
- **Subtitle:** "What do you want to accomplish? Goals can be tracked from pending to completed."
- **Form fields:**
  - Title (required, text input)
  - Priority selector (4 levels with color-coded flags: red, yellow, green, white)
  - Impact selector (low/medium/high with lightning bolt icons)
- **Auto-behavior:** Goal is automatically assigned to the project created in step 2 (projectId passed through)
- **CTA:** "Create Goal" button (disabled until title filled)
- **Mutation:** `goals.create` with projectId from step 2
- **Back button** returns to step 2

### Step 4 — Create Your First Habit

- **Heading:** "Build your first habit"
- **Subtitle:** "Track daily habits and build streaks. You earn 10 XP every time you complete one!"
- **Form fields:**
  - Title (required, text input)
  - Description (optional, textarea)
- **Placeholder suggestions:** "Read for 30 minutes", "Exercise", "Meditate"
- **CTA:** "Create Habit & Finish Setup" button (disabled until title filled)
- **Mutations:** `habits.create`, then `users.completeOnboarding`
- **Back button** returns to step 3

### Completion Transition

- Brief success state: "You're all set!" with a checkmark animation
- Auto-redirects to dashboard after ~1.5 seconds
- Dashboard now shows the created project, goal, and habit

## Data Model Changes

### users table

Add column:
```sql
onboarding_completed BOOLEAN NOT NULL DEFAULT false
```

Existing users should default to `true` (they don't need onboarding).

### NextAuth Session Extension

Include `onboardingCompleted` in the session object so the client can check it without an extra API call:

```typescript
// In src/server/auth.ts session callback
session.user.onboardingCompleted = user.onboardingCompleted
```

### New tRPC Mutation

```typescript
// users router
completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
  await ctx.db
    .update(users)
    .set({ onboardingCompleted: true })
    .where(eq(users.id, ctx.session.user.id));
})
```

## Routing Logic

In `src/app/page.tsx`:

```
1. Not authenticated?                      → Show Auth component
2. Authenticated + mobile?                 → Show MobilePlaceholder
3. Authenticated + !onboardingCompleted?   → Show Onboarding wizard
4. Authenticated + onboardingCompleted?    → Show Home dashboard
```

## Component Structure

```
src/app/_components/onboarding/
  index.tsx              — Wizard orchestrator (manages step state, progress bar)
  welcome-step.tsx       — Step 1: Welcome screen
  create-project-step.tsx — Step 2: Project creation form
  create-goal-step.tsx   — Step 3: Goal creation form
  create-habit-step.tsx  — Step 4: Habit creation form
```

## UI Details

### Progress Bar
- Horizontal step indicator at the top of the wizard
- Shows 4 steps with labels: Welcome, Project, Goal, Habit
- Current step highlighted, completed steps show checkmark
- Subtle connecting lines between steps

### Styling
- Full viewport height and width
- Centered content card (max-w-xl or similar)
- Consistent with existing dark theme and shadcn/ui components
- Animated transitions between steps (fade or slide)
- Same form patterns as existing create dialogs (dropdowns, inputs, textareas)

### State Management
- Wizard step state managed locally in the orchestrator component (useState)
- Created item IDs passed forward (project ID → goal step)
- No Zustand needed for wizard state (ephemeral)

## Edge Cases

- **User refreshes mid-wizard:** Since `onboardingCompleted` is still false, they return to step 1. Previously created items still exist in the database but that's fine — they can create new ones. The wizard always starts from step 1 on refresh.
- **Duplicate names:** Existing duplicate-name validation on projects/habits/journals will show errors via toast. User can pick a different name.
- **API errors:** Toast notification with error message. User stays on current step and can retry.
- **Existing users after migration:** Migration sets `onboarding_completed = true` for all existing users so they're unaffected.
