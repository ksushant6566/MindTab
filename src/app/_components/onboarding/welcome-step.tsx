"use client";

import { Button } from "~/components/ui/button";
import { FolderOpen, Target, Repeat, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type WelcomeStepProps = {
    userName: string;
    onNext: () => void;
};

const features = [
    {
        icon: FolderOpen,
        label: "A Project",
        description: "Organize your work into focused spaces",
        color: "text-blue-400",
        glow: "bg-blue-500/10",
        border: "border-blue-500/10 hover:border-blue-500/25",
    },
    {
        icon: Target,
        label: "A Goal",
        description: "Track progress on what matters most",
        color: "text-amber-400",
        glow: "bg-amber-500/10",
        border: "border-amber-500/10 hover:border-amber-500/25",
    },
    {
        icon: Repeat,
        label: "A Habit",
        description: "Build streaks and earn XP daily",
        color: "text-emerald-400",
        glow: "bg-emerald-500/10",
        border: "border-emerald-500/10 hover:border-emerald-500/25",
    },
] as const;

export function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
    const firstName = userName.split(" ")[0];

    return (
        <div className="flex flex-col items-center gap-10 text-center">
            {/* Hero */}
            <div className="space-y-4">
                <motion.h1
                    className="text-4xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Welcome to MindTab,{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                        {firstName}
                    </span>
                </motion.h1>
                <motion.p
                    className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Your new tab is about to become your personal productivity hub.
                    Let&apos;s set up three things to get you started.
                </motion.p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3 w-full">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.label}
                        className={`group relative flex flex-col items-center gap-4 rounded-xl border ${feature.border} bg-card/30 p-6 transition-colors duration-300`}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.35 + index * 0.1,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        {/* Glow */}
                        <div className={`absolute inset-0 rounded-xl ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                        <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${feature.glow}`}>
                            <feature.icon className={`h-5.5 w-5.5 ${feature.color}`} strokeWidth={1.75} />
                        </div>
                        <div className="relative space-y-1">
                            <p className="font-semibold text-sm">{feature.label}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CTA */}
            <motion.div
                className="w-full max-w-xs"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                <Button size="lg" onClick={onNext} className="w-full group">
                    Let&apos;s get started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
            </motion.div>
        </div>
    );
}
