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
