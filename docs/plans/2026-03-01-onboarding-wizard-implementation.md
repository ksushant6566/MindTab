# Onboarding Wizard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a mandatory 4-step onboarding wizard for new users that creates their first project, goal, and habit before showing the dashboard.

**Architecture:** Database-backed `onboardingCompleted` boolean on the users table, exposed via NextAuth session. A full-screen client-side wizard component with 4 steps (Welcome, Create Project, Create Goal, Create Habit) that calls existing tRPC mutations. Routing in `page.tsx` gates the dashboard behind the onboarding flag.

**Tech Stack:** Next.js 14, React 18, tRPC, Drizzle ORM, PostgreSQL, shadcn/ui, Tailwind CSS, Lucide icons, Framer Motion (already installed)

---

### Task 1: Add `onboardingCompleted` column to users table

**Files:**
- Modify: `src/server/db/schema.ts:388-407` (users table definition)

**Step 1: Add the column to the schema**

In `src/server/db/schema.ts`, add `onboardingCompleted` to the users table, after the `xp` field (line 400):

```typescript
onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
```

**Step 2: Generate the migration**

Run: `pnpm db:generate`
Expected: A new migration file in `drizzle/` adding the column

**Step 3: Push the schema to the database**

Run: `pnpm db:push`
Expected: Schema synced, column added to the database

**Step 4: Update existing users to have onboardingCompleted = true**

Run a one-time SQL command via the database to set all existing users:
```sql
UPDATE mindmap_user SET onboarding_completed = true WHERE onboarding_completed = false;
```

This ensures existing users skip onboarding. New users will get `false` by default.

**Step 5: Commit**

```bash
git add src/server/db/schema.ts drizzle/
git commit -m "feat: add onboarding_completed column to users table"
```

---

### Task 2: Expose `onboardingCompleted` in NextAuth session

**Files:**
- Modify: `src/server/auth.ts:25-56` (type declarations + session callback)

**Step 1: Add `onboardingCompleted` to the NextAuth type declarations**

In `src/server/auth.ts`, update the module augmentation (lines 25-40):

Add `onboardingCompleted: boolean` to the `Session.user` interface (after `xp: number`, line 29):

```typescript
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      xp: number
      onboardingCompleted: boolean
    } & DefaultSession['user']
  }

  interface User {
    xp: number
    onboardingCompleted: boolean
  }
}
```

**Step 2: Pass `onboardingCompleted` through the session callback**

Update the session callback (lines 49-56) to include the new field:

```typescript
session: ({ session, user }) => ({
  ...session,
  user: {
    ...session.user,
    id: user.id,
    xp: user.xp,
    onboardingCompleted: user.onboardingCompleted,
  },
}),
```

**Step 3: Verify the dev server still starts**

Run: `pnpm dev`
Expected: No errors. The session now includes `onboardingCompleted`.

**Step 4: Commit**

```bash
git add src/server/auth.ts
git commit -m "feat: expose onboardingCompleted in NextAuth session"
```

---

### Task 3: Add `completeOnboarding` tRPC mutation

**Files:**
- Modify: `src/server/api/routers/users.ts:6-76` (add new mutation)

**Step 1: Add the `completeOnboarding` mutation**

Add after the `updateXP` mutation (after line 75, before the closing `});`):

```typescript
completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, ctx.session.user.id));
    return { success: true };
}),
```

**Step 2: Verify it compiles**

Run: `pnpm dev`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/server/api/routers/users.ts
git commit -m "feat: add completeOnboarding tRPC mutation"
```

---

### Task 4: Update routing in `page.tsx` to gate on onboarding

**Files:**
- Modify: `src/app/page.tsx:1-36`

**Step 1: Update the routing logic**

Replace the contents of `src/app/page.tsx` with:

```tsx
import Home from '~/app/_components/home'
import { HydrateClient } from '~/trpc/server'
import { getServerAuthSession } from '~/server/auth'
import Auth from '~/app/_components/auth'
import { Header } from './_components/header'
import { headers } from 'next/headers'
import MobilePlaceholder from './_components/mobile-layout-placeholder'
import { Onboarding } from './_components/onboarding'

export default async function App() {
  const session = await getServerAuthSession()
  const user = session?.user

  if (!user) return (
    <Auth />
  )

  const userAgent = headers().get('user-agent') || ''
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  if (isMobile) {
    return (
      <MobilePlaceholder />
    )
  }

  if (!user.onboardingCompleted) {
    return (
      <HydrateClient>
        <Onboarding userName={user.name || 'there'} />
      </HydrateClient>
    )
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b">
        <div className='w-full flex flex-col items-center p-6 px-12 max-w-screen-2xl mx-auto'>
          <Header session={session} />
        </div>
        <Home />
      </main>
    </HydrateClient>
  )
}
```

**Step 2: This will show a TypeScript error because `Onboarding` doesn't exist yet — that's expected. Commit.**

```bash
git add src/app/page.tsx
git commit -m "feat: gate dashboard behind onboarding completion check"
```

---

### Task 5: Create the onboarding wizard orchestrator

**Files:**
- Create: `src/app/_components/onboarding/index.tsx`

**Step 1: Create the directory**

Run: `mkdir -p src/app/_components/onboarding`

**Step 2: Create the orchestrator component**

Create `src/app/_components/onboarding/index.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { WelcomeStep } from "./welcome-step";
import { CreateProjectStep } from "./create-project-step";
import { CreateGoalStep } from "./create-goal-step";
import { CreateHabitStep } from "./create-habit-step";
import { Check } from "lucide-react";

const STEPS = [
    { label: "Welcome", number: 1 },
    { label: "Project", number: 2 },
    { label: "Goal", number: 3 },
    { label: "Habit", number: 4 },
] as const;

type OnboardingProps = {
    userName: string;
};

export function Onboarding({ userName }: OnboardingProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

    const completeOnboarding = api.users.completeOnboarding.useMutation({
        onSuccess: () => {
            setIsCompleting(true);
            setTimeout(() => {
                router.refresh();
            }, 1500);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to complete onboarding");
        },
    });

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleProjectCreated = (projectId: string) => {
        setCreatedProjectId(projectId);
        handleNext();
    };

    const handleOnboardingComplete = () => {
        completeOnboarding.mutate();
    };

    if (isCompleting) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b">
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                        <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
                    <p className="text-muted-foreground">Taking you to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b">
            {/* Progress Bar */}
            <div className="w-full max-w-lg px-6 pt-12 pb-8">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        currentStep > step.number
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.number
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {currentStep > step.number ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span
                                    className={`text-xs ${
                                        currentStep >= step.number
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`h-px flex-1 mx-2 mb-6 transition-colors ${
                                        currentStep > step.number
                                            ? "bg-green-500"
                                            : "bg-muted"
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="w-full max-w-xl px-6">
                {currentStep === 1 && (
                    <WelcomeStep userName={userName} onNext={handleNext} />
                )}
                {currentStep === 2 && (
                    <CreateProjectStep
                        onProjectCreated={handleProjectCreated}
                        onBack={handleBack}
                    />
                )}
                {currentStep === 3 && (
                    <CreateGoalStep
                        projectId={createdProjectId}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {currentStep === 4 && (
                    <CreateHabitStep
                        onComplete={handleOnboardingComplete}
                        onBack={handleBack}
                        loading={completeOnboarding.isPending}
                    />
                )}
            </div>
        </div>
    );
}
```

**Step 3: Commit**

```bash
git add src/app/_components/onboarding/index.tsx
git commit -m "feat: add onboarding wizard orchestrator with progress bar"
```

---

### Task 6: Create the Welcome step component

**Files:**
- Create: `src/app/_components/onboarding/welcome-step.tsx`

**Step 1: Create the welcome step**

Create `src/app/_components/onboarding/welcome-step.tsx`:

```tsx
"use client";

import { Button } from "~/components/ui/button";
import { FolderOpen, Target, Repeat } from "lucide-react";

type WelcomeStepProps = {
    userName: string;
    onNext: () => void;
};

export function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
    const firstName = userName.split(" ")[0];

    return (
        <div className="flex flex-col items-center gap-8 text-center">
            <div className="space-y-3">
                <h1 className="text-3xl font-bold">
                    Welcome to MindTab, {firstName}!
                </h1>
                <p className="text-muted-foreground text-lg">
                    Your new tab is about to become your personal productivity hub.
                </p>
            </div>

            <p className="text-muted-foreground text-sm">
                Let&apos;s set up three things to get you started:
            </p>

            <div className="grid grid-cols-3 gap-4 w-full">
                <div className="flex flex-col items-center gap-3 rounded-lg border p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                        <FolderOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-sm">A Project</p>
                        <p className="text-xs text-muted-foreground">
                            Organize your work
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 rounded-lg border p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                        <Target className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-sm">A Goal</p>
                        <p className="text-xs text-muted-foreground">
                            Track what matters
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 rounded-lg border p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <Repeat className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-sm">A Habit</p>
                        <p className="text-xs text-muted-foreground">
                            Build consistency
                        </p>
                    </div>
                </div>
            </div>

            <Button size="lg" onClick={onNext} className="w-full max-w-xs">
                Let&apos;s get started
            </Button>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/app/_components/onboarding/welcome-step.tsx
git commit -m "feat: add onboarding welcome step component"
```

---

### Task 7: Create the Create Project step component

**Files:**
- Create: `src/app/_components/onboarding/create-project-step.tsx`

This step reuses the existing `projects.create` tRPC mutation but with a simplified, onboarding-specific UI.

**Step 1: Create the project step**

Create `src/app/_components/onboarding/create-project-step.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

type CreateProjectStepProps = {
    onProjectCreated: (projectId: string) => void;
    onBack: () => void;
};

export function CreateProjectStep({
    onProjectCreated,
    onBack,
}: CreateProjectStepProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const createProject = api.projects.create.useMutation({
        onSuccess: (project) => {
            onProjectCreated(project.id);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create project");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProject.mutate({
            name,
            description,
            status: "active",
            startDate: new Date().toISOString(),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Create your first project</h2>
                <p className="text-muted-foreground">
                    Projects help you organize goals and notes. Think of them like
                    folders.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        placeholder='e.g. "Personal Growth", "Work Q1", "Fitness"'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="project-description">
                        Description{" "}
                        <span className="text-muted-foreground font-normal">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="project-description"
                        placeholder="What is this project about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!name.trim() || createProject.isPending}
                        loading={createProject.isPending}
                    >
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/app/_components/onboarding/create-project-step.tsx
git commit -m "feat: add onboarding create project step"
```

---

### Task 8: Create the Create Goal step component

**Files:**
- Create: `src/app/_components/onboarding/create-goal-step.tsx`

This step reuses the existing `goals.create` tRPC mutation. It includes priority and impact selectors matching the existing goal creation patterns from `src/app/_components/goals/create-goal.tsx`.

**Step 1: Create the goal step**

Create `src/app/_components/onboarding/create-goal-step.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Flag, Zap } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type goalPriorityEnum, type goalImpactEnum } from "~/server/db/schema";

type Priority = (typeof goalPriorityEnum.enumValues)[number];
type Impact = (typeof goalImpactEnum.enumValues)[number];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
    priority_1: { label: "Urgent", color: "text-red-500" },
    priority_2: { label: "High", color: "text-yellow-500" },
    priority_3: { label: "Medium", color: "text-green-500" },
    priority_4: { label: "Low", color: "text-white" },
};

const IMPACT_CONFIG: Record<Impact, { label: string; count: number }> = {
    low: { label: "Low", count: 1 },
    medium: { label: "Medium", count: 2 },
    high: { label: "High", count: 3 },
};

type CreateGoalStepProps = {
    projectId: string | null;
    onNext: () => void;
    onBack: () => void;
};

export function CreateGoalStep({
    projectId,
    onNext,
    onBack,
}: CreateGoalStepProps) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("priority_1");
    const [impact, setImpact] = useState<Impact>("medium");

    const createGoal = api.goals.create.useMutation({
        onSuccess: () => {
            onNext();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create goal");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createGoal.mutate({
            title,
            priority,
            impact,
            projectId: projectId ?? undefined,
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Set your first goal</h2>
                <p className="text-muted-foreground">
                    What do you want to accomplish? Goals can be tracked from pending
                    to completed.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                        id="goal-title"
                        placeholder='e.g. "Learn TypeScript", "Run a marathon"'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={priority}
                            onValueChange={(val) => setPriority(val as Priority)}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        <Flag
                                            className={`h-3.5 w-3.5 ${PRIORITY_CONFIG[priority].color}`}
                                        />
                                        {PRIORITY_CONFIG[priority].label}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PRIORITY_CONFIG).map(
                                    ([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2">
                                                <Flag
                                                    className={`h-3.5 w-3.5 ${config.color}`}
                                                />
                                                {config.label}
                                            </span>
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Impact</Label>
                        <Select
                            value={impact}
                            onValueChange={(val) => setImpact(val as Impact)}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        {Array.from({
                                            length: IMPACT_CONFIG[impact].count,
                                        }).map((_, i) => (
                                            <Zap
                                                key={i}
                                                className="h-3.5 w-3.5 text-yellow-500"
                                            />
                                        ))}
                                        {IMPACT_CONFIG[impact].label}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(IMPACT_CONFIG).map(
                                    ([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2">
                                                {Array.from({
                                                    length: config.count,
                                                }).map((_, i) => (
                                                    <Zap
                                                        key={i}
                                                        className="h-3.5 w-3.5 text-yellow-500"
                                                    />
                                                ))}
                                                {config.label}
                                            </span>
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!title.trim() || createGoal.isPending}
                        loading={createGoal.isPending}
                    >
                        Create Goal
                    </Button>
                </div>
            </form>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/app/_components/onboarding/create-goal-step.tsx
git commit -m "feat: add onboarding create goal step with priority and impact"
```

---

### Task 9: Create the Create Habit step component

**Files:**
- Create: `src/app/_components/onboarding/create-habit-step.tsx`

This step reuses the existing `habits.create` tRPC mutation. It matches the pattern from `src/app/_components/habits/create-habit.tsx`.

**Step 1: Create the habit step**

Create `src/app/_components/onboarding/create-habit-step.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

type CreateHabitStepProps = {
    onComplete: () => void;
    onBack: () => void;
    loading: boolean;
};

export function CreateHabitStep({
    onComplete,
    onBack,
    loading,
}: CreateHabitStepProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const createHabit = api.habits.create.useMutation({
        onSuccess: () => {
            onComplete();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create habit");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createHabit.mutate({
            title,
            description,
            frequency: "daily",
        });
    };

    const isLoading = createHabit.isPending || loading;

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Build your first habit</h2>
                <p className="text-muted-foreground">
                    Track daily habits and build streaks. You earn 10 XP every time
                    you complete one!
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <Label htmlFor="habit-title">Habit Title</Label>
                    <Input
                        id="habit-title"
                        placeholder='e.g. "Read for 30 minutes", "Exercise", "Meditate"'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="habit-description">
                        Description{" "}
                        <span className="text-muted-foreground font-normal">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="habit-description"
                        placeholder="Any details about this habit?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        disabled={isLoading}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!title.trim() || isLoading}
                        loading={isLoading}
                    >
                        Create Habit & Finish Setup
                    </Button>
                </div>
            </form>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add src/app/_components/onboarding/create-habit-step.tsx
git commit -m "feat: add onboarding create habit step"
```

---

### Task 10: Verify end-to-end and final commit

**Step 1: Start the dev server and verify compilation**

Run: `pnpm dev`
Expected: No TypeScript errors, app compiles successfully

**Step 2: Test the onboarding flow manually**

To test, either:
- Create a new user via a fresh Google sign-in, OR
- Temporarily set `onboarding_completed = false` for your test user in the database

Expected flow:
1. Login → see onboarding wizard (not the dashboard)
2. Step 1: Welcome page with 3 icon cards and "Let's get started" button
3. Step 2: Create project form → creates project on submit → advances
4. Step 3: Create goal form with priority/impact → creates goal assigned to project → advances
5. Step 4: Create habit form → creates habit → "You're all set!" screen → redirects to dashboard
6. Dashboard shows the created project, goal, and habit
7. Refreshing the page shows the dashboard (not the wizard again)

**Step 3: Fix any issues found during testing**

Address any TypeScript errors, UI alignment issues, or mutation failures.

**Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address onboarding wizard issues found during testing"
```
