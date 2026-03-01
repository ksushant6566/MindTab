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
            setTimeout(() => {
                router.refresh();
            }, 1500);
        },
        onError: (error) => {
            setIsCompleting(false);
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
        setIsCompleting(true);
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

            <p className="sr-only">Step {currentStep} of 4: {STEPS[currentStep - 1]!.label}</p>

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
