"use client";

import React, { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
    ArrowLeft,
    ArrowRight,
    Dumbbell,
    BookOpen,
    Brain,
    Droplets,
    PenLine,
    Moon,
    Salad,
    Plus,
} from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { handleCmdEnterSubmit } from "~/lib/utils";
import Confetti from "react-confetti";

export type CreatedHabitData = {
    title: string;
    description: string;
};

type CreateHabitStepProps = {
    onHabitCreated: (data: CreatedHabitData) => void;
    onNext: () => void;
    onBack: () => void;
    initialData: CreatedHabitData | null;
};

const PRESET_HABITS = [
    { title: "Exercise", description: "Stay active every day", icon: Dumbbell },
    { title: "Read", description: "Read for 30 minutes", icon: BookOpen },
    { title: "Meditate", description: "Practice mindfulness", icon: Brain },
    { title: "Drink Water", description: "Stay hydrated", icon: Droplets },
    { title: "Journal", description: "Write daily reflections", icon: PenLine },
    { title: "Sleep Early", description: "Lights off by 11pm", icon: Moon },
    { title: "Eat Healthy", description: "No junk food", icon: Salad },
];

type Phase = "picking" | "custom" | "created";

export function CreateHabitStep({
    onHabitCreated,
    onNext,
    onBack,
    initialData,
}: CreateHabitStepProps) {
    const [phase, setPhase] = useState<Phase>(initialData ? "created" : "picking");
    const [customTitle, setCustomTitle] = useState("");
    const [customDescription, setCustomDescription] = useState("");
    const [createdTitle, setCreatedTitle] = useState(initialData?.title ?? "");

    // Interactive habit card state
    const [checked, setChecked] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiSource, setConfettiSource] = useState({ x: 0, y: 0 });
    const [showXp, setShowXp] = useState(false);
    const [xpAmount, setXpAmount] = useState(10);
    const [xpKey, setXpKey] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const createHabit = api.habits.create.useMutation({
        onSuccess: () => {
            // handled in onSuccess
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create habit");
        },
    });

    const handlePresetSelect = (preset: typeof PRESET_HABITS[number]) => {
        createHabit.mutate(
            {
                title: preset.title,
                description: preset.description,
                frequency: "daily",
            },
            {
                onSuccess: () => {
                    setCreatedTitle(preset.title);
                    onHabitCreated({ title: preset.title, description: preset.description });
                    setPhase("created");
                },
            }
        );
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customTitle.trim() || createHabit.isPending) return;
        createHabit.mutate(
            {
                title: customTitle,
                description: customDescription,
                frequency: "daily",
            },
            {
                onSuccess: () => {
                    setCreatedTitle(customTitle.trim());
                    onHabitCreated({ title: customTitle.trim(), description: customDescription.trim() });
                    setPhase("created");
                },
            }
        );
    };

    const handleCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setConfettiSource({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });

        if (!checked) {
            setChecked(true);
            setShowConfetti(true);
            setXpAmount(10);
            setXpKey((k) => k + 1);
            setShowXp(true);
            audioRef.current?.play().catch(() => {});
        } else {
            setChecked(false);
            setXpAmount(-10);
            setXpKey((k) => k + 1);
            setShowXp(true);
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === "ArrowUp" && e.target === descriptionRef.current) {
            e.preventDefault();
            titleRef.current?.focus();
        } else if (e.key === "ArrowDown" && e.target === titleRef.current) {
            e.preventDefault();
            descriptionRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <audio ref={audioRef} src="/audio/success.mp3" preload="auto" />

            <div className="space-y-3">
                <motion.h2
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    {phase === "created" ? "Try checking off your habit!" : "Build your first habit"}
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    {phase === "created" ? (
                        <>Click the checkbox to see what happens. You earn{" "}
                            <span className="text-amber-400 font-medium">10 XP</span>{" "}
                            every time you complete a habit!
                        </>
                    ) : (
                        <>Pick a habit to track daily, or create your own. You earn{" "}
                            <span className="text-amber-400 font-medium">10 XP</span>{" "}
                            every time you complete one!
                        </>
                    )}
                </motion.p>
            </div>

            <AnimatePresence mode="wait">
                {/* Phase: Picking from presets */}
                {phase === "picking" && (
                    <motion.div
                        key="picking"
                        className="grid grid-cols-2 gap-2"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35, delay: 0.2 }}
                    >
                        {PRESET_HABITS.map((preset) => (
                            <button
                                key={preset.title}
                                type="button"
                                onClick={() => handlePresetSelect(preset)}
                                disabled={createHabit.isPending}
                                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/30 p-3 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 disabled:opacity-50"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 shrink-0">
                                    <preset.icon className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">{preset.title}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                                </div>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setPhase("custom")}
                            className="flex items-center gap-3 rounded-lg border border-dashed border-border/50 bg-card/20 p-3 text-left transition-all hover:border-border hover:bg-card/30"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/20 shrink-0">
                                <Plus className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium">Custom</p>
                                <p className="text-[11px] text-muted-foreground">Create your own</p>
                            </div>
                        </button>
                    </motion.div>
                )}

                {/* Phase: Custom form */}
                {phase === "custom" && (
                    <motion.div
                        key="custom"
                        className="rounded-xl border-2 border-border bg-card overflow-hidden"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35 }}
                    >
                        <form
                            onSubmit={handleCustomSubmit}
                            onKeyDown={handleCmdEnterSubmit}
                            className="flex flex-col gap-2 p-6"
                        >
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Habit name"
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    required
                                    className="w-full bg-inherit text-xl font-semibold focus:border-none focus:outline-none"
                                    ref={titleRef}
                                />
                                <textarea
                                    placeholder="Description"
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full resize-none overflow-hidden bg-inherit text-base font-normal focus:border-none focus:outline-none"
                                    style={{ height: "auto" }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = "auto";
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    ref={descriptionRef}
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <Button
                                    onClick={() => setPhase("picking")}
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-xs"
                                    type="button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-8 text-xs"
                                    disabled={!customTitle.trim() || createHabit.isPending}
                                    loading={createHabit.isPending}
                                >
                                    Add habit
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Phase: Created - Interactive habit card */}
                {phase === "created" && (
                    <motion.div
                        key="created"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="hover:bg-accent/50 transition-colors">
                            <CardContent className="p-4 flex flex-col justify-between">
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">{createdTitle}</h3>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={handleCheck}
                                                className={`h-5 w-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center ${
                                                    checked
                                                        ? "bg-emerald-500 border-emerald-500"
                                                        : "border-border/60 hover:border-emerald-500/50 cursor-pointer"
                                                }`}
                                            >
                                                {checked && (
                                                    <motion.svg
                                                        viewBox="0 0 12 12"
                                                        className="h-3 w-3 text-white"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                    >
                                                        <motion.path
                                                            d="M2 6L5 9L10 3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </motion.svg>
                                                )}
                                            </button>
                                            <AnimatePresence>
                                                {showXp && (
                                                    <motion.span
                                                        key={`xp-${xpKey}`}
                                                        className={`absolute -top-2 left-1/2 -translate-x-1/2 font-bold text-xs whitespace-nowrap pointer-events-none ${
                                                            xpAmount > 0 ? "text-amber-400" : "text-red-400"
                                                        }`}
                                                        initial={{ opacity: 1, y: 0 }}
                                                        animate={{ opacity: 0, y: -28 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                                        onAnimationComplete={() => setShowXp(false)}
                                                    >
                                                        {xpAmount > 0 ? "+10 XP" : "-10 XP"}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-2">
                                    <div className="flex gap-1">
                                        {Array.from({ length: 7 }).map((_, i) => {
                                            const isToday = i === 6;
                                            const isCompleted = isToday && checked;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-3 h-3 rounded-sm transition-colors duration-300 ${
                                                        isCompleted
                                                            ? "bg-green-500 dark:bg-green-600"
                                                            : "bg-muted"
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (phase === "custom") {
                            setPhase("picking");
                        } else {
                            onBack();
                        }
                    }}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                {phase === "created" && (
                    <Button size="sm" onClick={onNext}>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </motion.div>

            {showConfetti && (
                <Confetti
                    recycle={false}
                    gravity={0.5}
                    opacity={0.7}
                    wind={0.5}
                    initialVelocityY={40}
                    initialVelocityX={10}
                    numberOfPieces={15}
                    colors={["#FFD700", "#FF6347", "#4169E1", "#32CD32", "#FF1493"]}
                    confettiSource={{
                        x: confettiSource.x,
                        y: confettiSource.y,
                        w: 0,
                        h: 0,
                    }}
                    style={{
                        position: "fixed",
                        pointerEvents: "none",
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                    }}
                    tweenDuration={100}
                    onConfettiComplete={(confetti) => {
                        confetti?.stop();
                        confetti?.reset();
                        setShowConfetti(false);
                    }}
                />
            )}
        </div>
    );
}
