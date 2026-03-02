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
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
    { label: "Welcome", number: 1 },
    { label: "Project", number: 2 },
    { label: "Goal", number: 3 },
    { label: "Habit", number: 4 },
] as const;

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
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

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
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleProjectCreated = (projectId: string) => {
        setCreatedProjectId(projectId);
        handleNext();
    };

    const handleOnboardingComplete = () => {
        setIsCompleting(true);
        completeOnboarding.mutate();
    };

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
                            x: Math.cos((i * 30 * Math.PI) / 180) * (120 + Math.random() * 80),
                            y: Math.sin((i * 30 * Math.PI) / 180) * (120 + Math.random() * 80),
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

            {/* Progress indicator */}
            <div className="w-full max-w-md px-6 pt-12 pb-8 relative z-10">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center gap-2.5">
                                <motion.div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-500 ${
                                        currentStep > step.number
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                            : currentStep === step.number
                                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                              : "bg-muted/50 text-muted-foreground/50 border border-border/50"
                                    }`}
                                    layout
                                    transition={{ duration: 0.3 }}
                                >
                                    {currentStep > step.number ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        step.number
                                    )}
                                </motion.div>
                                <span
                                    className={`text-xs font-medium transition-colors duration-300 ${
                                        currentStep >= step.number
                                            ? "text-foreground/80"
                                            : "text-muted-foreground/40"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className="relative flex-1 mx-3 mb-6 h-px">
                                    <div className="absolute inset-0 bg-border/30" />
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-emerald-500/40"
                                        initial={{ width: "0%" }}
                                        animate={{
                                            width: currentStep > step.number ? "100%" : "0%",
                                        }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <p className="sr-only">Step {currentStep} of 4: {STEPS[currentStep - 1]!.label}</p>

            {/* Step Content with AnimatePresence */}
            <div className="w-full max-w-xl px-6 relative z-10">
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
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
