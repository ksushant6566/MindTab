"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { WelcomeStep } from "./welcome-step";
import { CreateProjectStep } from "./create-project-step";
import { CreateGoalStep, type CreatedGoalData } from "./create-goal-step";
import { CreateHabitStep, type CreatedHabitData } from "./create-habit-step";
import { NotesIntroStep } from "./notes-intro-step";
import { ChromeExtensionStep } from "./chrome-extension-step";
import { ChooseLayoutStep } from "./choose-layout-step";

const TOTAL_STEPS = 7;

const STEP_LABELS = [
    "Welcome",
    "Project",
    "Goal",
    "Habit",
    "Notes",
    "Extension",
    "Layout",
] as const;

// Steps that use wider container
const WIDE_STEPS = new Set([1, 5, 7]);

type OnboardingProps = {
    userName: string;
};

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
        filter: "blur(4px)",
    }),
    center: {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -80 : 80,
        opacity: 0,
        filter: "blur(4px)",
    }),
};

export function Onboarding({ userName }: OnboardingProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [isCompleting, setIsCompleting] = useState(false);

    // Data passed between steps (also used as initial values when navigating back)
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [createdProjectName, setCreatedProjectName] = useState<string | null>(null);
    const [createdGoalData, setCreatedGoalData] = useState<CreatedGoalData | null>(null);
    const [createdHabitData, setCreatedHabitData] = useState<CreatedHabitData | null>(null);

    const completeOnboarding = api.users.completeOnboarding.useMutation({
        onSuccess: () => {
            setTimeout(() => {
                router.refresh();
            }, 2200);
        },
        onError: (error) => {
            setIsCompleting(false);
            toast.error(error.message || "Failed to complete onboarding");
        },
    });

    const handleNext = () => {
        setDirection(1);
        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleProjectCreated = (projectId: string, projectName: string) => {
        setCreatedProjectId(projectId);
        setCreatedProjectName(projectName);
        handleNext();
    };

    const handleGoalCreated = (data: CreatedGoalData) => {
        setCreatedGoalData(data);
        handleNext();
    };

    const handleHabitCreated = (data: CreatedHabitData) => {
        setCreatedHabitData(data);
    };

    const handleOnboardingComplete = () => {
        setIsCompleting(true);
        completeOnboarding.mutate();
    };

    const useWideContainer = WIDE_STEPS.has(currentStep);

    if (isCompleting) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-background via-background to-background overflow-hidden relative">
                {/* Radial glow burst */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[100px]" />
                </motion.div>

                {/* Floating particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-emerald-400/60"
                        initial={{
                            opacity: 0,
                            scale: 0,
                            x: 0,
                            y: 0,
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            x: Math.cos((i * 30 * Math.PI) / 180) * (120 + i * 8),
                            y: Math.sin((i * 30 * Math.PI) / 180) * (120 + i * 8),
                        }}
                        transition={{
                            duration: 1.4,
                            delay: 0.2 + i * 0.04,
                            ease: "easeOut",
                        }}
                    />
                ))}

                <motion.div
                    className="flex flex-col items-center gap-5 relative z-10"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 12,
                            delay: 0.15,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                                delay: 0.35,
                            }}
                        >
                            <Check className="h-8 w-8 text-emerald-400" strokeWidth={2.5} />
                        </motion.div>
                    </motion.div>
                    <motion.h2
                        className="text-2xl font-semibold tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        You&apos;re all set!
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.4 }}
                    >
                        Taking you to your dashboard...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-background via-background to-background relative overflow-hidden">
            {/* Subtle atmospheric glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/[0.03] blur-[120px]" />

            {/* Progress bar */}
            <div className="w-full max-w-xl px-6 pt-12 pb-8 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                        Step {currentStep} of {TOTAL_STEPS}{" "}
                        <span className="text-foreground/70 font-medium">
                            · {STEP_LABELS[currentStep - 1]}
                        </span>
                    </span>
                </div>
                <div className="relative h-1 w-full rounded-full bg-border/30 overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{
                            width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            <p className="sr-only">
                Step {currentStep} of {TOTAL_STEPS}: {STEP_LABELS[currentStep - 1]}
            </p>

            {/* Step Content */}
            <div
                className={`w-full px-6 relative z-10 transition-all duration-300 ${
                    useWideContainer ? "max-w-3xl" : "max-w-xl"
                }`}
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.25 },
                            filter: { duration: 0.25 },
                        }}
                    >
                        {/* Step 1: Welcome */}
                        {currentStep === 1 && (
                            <WelcomeStep userName={userName} onNext={handleNext} />
                        )}

                        {/* Step 2: Create Project */}
                        {currentStep === 2 && (
                            <CreateProjectStep
                                onProjectCreated={handleProjectCreated}
                                onBack={handleBack}
                                initialName={createdProjectName ?? ""}
                                initialDescription=""
                                alreadyCreated={!!createdProjectId}
                            />
                        )}

                        {/* Step 3: Create Goal */}
                        {currentStep === 3 && (
                            <CreateGoalStep
                                projectId={createdProjectId}
                                projectName={createdProjectName}
                                onGoalCreated={handleGoalCreated}
                                onBack={handleBack}
                                initialData={createdGoalData}
                            />
                        )}

                        {/* Step 4: Create Habit */}
                        {currentStep === 4 && (
                            <CreateHabitStep
                                onHabitCreated={handleHabitCreated}
                                onNext={handleNext}
                                onBack={handleBack}
                                initialData={createdHabitData}
                            />
                        )}

                        {/* Step 5: Notes Intro */}
                        {currentStep === 5 && (
                            <NotesIntroStep
                                goalTitle={createdGoalData?.title ?? null}
                                onNext={handleNext}
                                onBack={handleBack}
                            />
                        )}

                        {/* Step 6: Chrome Extension */}
                        {currentStep === 6 && (
                            <ChromeExtensionStep
                                onNext={handleNext}
                                onBack={handleBack}
                            />
                        )}

                        {/* Step 7: Choose Layout (last step) */}
                        {currentStep === 7 && (
                            <ChooseLayoutStep
                                onNext={handleOnboardingComplete}
                                onBack={handleBack}
                                isLastStep
                                loading={completeOnboarding.isPending}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
