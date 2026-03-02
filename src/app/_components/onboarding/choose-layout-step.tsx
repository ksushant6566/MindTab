"use client";

import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "~/lib/store";

type ChooseLayoutStepProps = {
    onNext: () => void;
    onBack: () => void;
    isLastStep?: boolean;
    loading?: boolean;
};

/* ── Layout 1: List + Table ── */
function ListWireframe() {
    const checks = [
        [true, false, false, false, false, false, false],
        [true, false, false, false, false, false, false],
        [true, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [true, false, false, false, false, false, false],
    ];

    return (
        <div className="flex h-full w-full p-3 gap-3">
            {/* Left: Goals list */}
            <div className="flex flex-col w-[38%] overflow-hidden">
                {/* Section header */}
                <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="text-[8px] text-muted-foreground font-semibold">Pending</div>
                    <div className="text-[7px] bg-muted/30 rounded px-1 text-muted-foreground/70">3</div>
                </div>
                {/* Goal cards */}
                <div className="flex flex-col gap-2 flex-1">
                    {[
                        { badge: "P2", bc: "bg-yellow-500/30 text-yellow-400", impact: "bg-yellow-500/20" },
                        { badge: "P4", bc: "bg-muted/30 text-muted-foreground", impact: "bg-green-500/20" },
                        { badge: "P1", bc: "bg-red-500/30 text-red-400", impact: "bg-yellow-500/20" },
                    ].map((g, i) => (
                        <div key={i} className="rounded-md border border-border/20 bg-card/30 p-2 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full border border-border/50 shrink-0" />
                                <div className="h-2 flex-1 rounded bg-foreground/10" />
                            </div>
                            <div className="flex gap-1 pl-4">
                                <div className={`h-2 w-5 rounded text-[5px] font-bold flex items-center justify-center ${g.bc}`}>{g.badge}</div>
                                <div className={`h-2 w-4 rounded ${g.impact}`} />
                                <div className="h-2 w-8 rounded bg-blue-500/20" />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Notes at bottom */}
                <div className="pt-2 mt-auto border-t border-border/20">
                    <div className="text-[8px] text-muted-foreground font-semibold mb-1.5">Notes</div>
                    <div className="rounded-md border border-border/15 bg-purple-500/5 p-1.5 space-y-1">
                        <div className="h-1.5 w-[80%] rounded bg-purple-500/25" />
                        <div className="h-1.5 w-[60%] rounded bg-purple-500/15" />
                    </div>
                </div>
            </div>
            <div className="w-px bg-border/25" />
            {/* Right: Habits table */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="text-[8px] text-muted-foreground font-semibold mb-1">Week 10</div>
                <div className="text-[6px] text-muted-foreground/50 mb-2.5">Mar 02 – Mar 08</div>
                {/* Day headers */}
                <div className="grid grid-cols-[1fr_repeat(7,1fr)] gap-1 mb-1.5">
                    <div />
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div key={i} className="text-[6px] text-muted-foreground/50 text-center font-semibold">{d}</div>
                    ))}
                </div>
                {/* Habit rows */}
                <div className="flex flex-col gap-1.5 flex-1">
                    {checks.map((row, ri) => (
                        <div key={ri} className="grid grid-cols-[1.2fr_repeat(7,1fr)] gap-1 items-center">
                            <div className="h-2 rounded bg-foreground/6 truncate" />
                            {row.map((checked, ci) => (
                                <div
                                    key={ci}
                                    className={`h-4 rounded-sm border ${
                                        checked
                                            ? "bg-emerald-500/20 border-emerald-500/25"
                                            : "bg-muted/5 border-border/15"
                                    }`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Layout 2: Kanban + Cards ── */
function KanbanWireframe() {
    return (
        <div className="flex h-full w-full p-3 gap-3">
            {/* Kanban columns */}
            <div className="flex gap-2 flex-1 min-w-0">
                {/* Pending */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-2">
                        <div className="text-[8px] text-amber-400/80 font-semibold">Pending</div>
                        <div className="text-[7px] bg-amber-500/15 rounded px-1 text-amber-400/60">3</div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="rounded-md border border-amber-500/15 bg-amber-500/5 p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full border border-border/40 shrink-0" />
                                <div className="h-1.5 w-[85%] rounded bg-amber-500/30" />
                            </div>
                            <div className="flex gap-0.5 pl-3">
                                <div className="h-1.5 w-3.5 rounded bg-red-500/25" />
                                <div className="h-1.5 w-3 rounded bg-yellow-500/20" />
                            </div>
                        </div>
                        <div className="rounded-md border border-amber-500/12 bg-amber-500/4 p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full border border-border/40 shrink-0" />
                                <div className="h-1.5 w-[70%] rounded bg-amber-500/25" />
                            </div>
                            <div className="flex gap-0.5 pl-3">
                                <div className="h-1.5 w-3 rounded bg-green-500/20" />
                                <div className="h-1.5 w-3 rounded bg-blue-500/15" />
                            </div>
                        </div>
                        <div className="rounded-md border border-amber-500/10 bg-amber-500/3 p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full border border-border/40 shrink-0" />
                                <div className="h-1.5 w-[60%] rounded bg-amber-500/20" />
                            </div>
                            <div className="flex gap-0.5 pl-3">
                                <div className="h-1.5 w-3 rounded bg-yellow-500/15" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* In Progress */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-2">
                        <div className="text-[8px] text-blue-400/80 font-semibold">In Progress</div>
                        <div className="text-[7px] bg-blue-500/15 rounded px-1 text-blue-400/60">2</div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="rounded-md border border-blue-500/15 bg-blue-500/5 p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full border border-border/40 shrink-0" />
                                <div className="h-1.5 w-[85%] rounded bg-blue-500/30" />
                            </div>
                            <div className="flex gap-0.5 pl-3">
                                <div className="h-1.5 w-3.5 rounded bg-yellow-500/20" />
                                <div className="h-1.5 w-3 rounded bg-blue-500/15" />
                            </div>
                        </div>
                        <div className="rounded-md border border-blue-500/10 bg-blue-500/3 p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full border border-border/40 shrink-0" />
                                <div className="h-1.5 w-[70%] rounded bg-blue-500/22" />
                            </div>
                            <div className="flex gap-0.5 pl-3">
                                <div className="h-1.5 w-3 rounded bg-red-500/20" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Completed */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-2">
                        <div className="text-[8px] text-emerald-400/80 font-semibold">Done</div>
                        <div className="text-[7px] bg-emerald-500/15 rounded px-1 text-emerald-400/60">1</div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="rounded-md border border-emerald-500/15 bg-emerald-500/5 p-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-emerald-500/40 border border-emerald-500/50 shrink-0" />
                                <div className="h-1.5 w-[80%] rounded bg-emerald-500/25" />
                            </div>
                            <div className="flex gap-0.5 pl-3">
                                <div className="h-1.5 w-3 rounded bg-yellow-500/15" />
                                <div className="h-1.5 w-3 rounded bg-blue-500/15" />
                            </div>
                        </div>
                        <div className="flex-1" />
                    </div>
                </div>
            </div>
            <div className="w-px bg-border/25" />
            {/* Habits sidebar: cards with checkbox + streak dots */}
            <div className="flex flex-col w-[24%] min-w-0">
                <div className="text-[8px] text-muted-foreground font-semibold mb-2">Habits</div>
                <div className="flex flex-col gap-1.5 flex-1">
                    {[
                        { streak: [true, false, false, false, false, false, false], checked: true },
                        { streak: [true, false, false, false, false, false, false], checked: true },
                        { streak: [false, false, false, false, false, false, false], checked: false },
                        { streak: [true, false, false, false, false, false, false], checked: true },
                        { streak: [false, false, false, false, false, false, false], checked: false },
                    ].map((h, i) => (
                        <div key={i} className="rounded-md border border-border/20 bg-card/30 p-1.5 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1">
                                <div className="h-1.5 flex-1 rounded bg-foreground/8" />
                                <div className={`h-3 w-3 rounded-sm border shrink-0 ${
                                    h.checked
                                        ? "bg-emerald-500/25 border-emerald-500/35"
                                        : "border-border/30"
                                }`} />
                            </div>
                            <div className="flex gap-0.5">
                                {h.streak.map((on, j) => (
                                    <div key={j} className={`h-1.5 w-1.5 rounded-full ${on ? "bg-emerald-500/50" : "bg-muted/20"}`} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Notes label */}
                <div className="pt-2 mt-auto border-t border-border/20">
                    <div className="text-[8px] text-muted-foreground font-semibold mb-1.5">Notes</div>
                    <div className="rounded-md border border-border/15 bg-purple-500/5 p-1.5 space-y-1">
                        <div className="h-1.5 w-[80%] rounded bg-purple-500/25" />
                        <div className="h-1.5 w-[55%] rounded bg-purple-500/15" />
                    </div>
                </div>
            </div>
        </div>
    );
}

const layouts = [
    {
        version: 1,
        title: "List + Table",
        description: "A structured, scannable layout",
        bullets: [
            "Goals as a checklist with priority badges",
            "Habits in a weekly grid you check off",
            "Notes stacked below for easy scrolling",
        ],
    },
    {
        version: 2,
        title: "Kanban + Cards",
        description: "A visual, drag-and-drop layout",
        bullets: [
            "Goals in columns by status — drag to progress",
            "Habits as individual cards with streaks",
            "Notes alongside for quick reference",
        ],
    },
] as const;

const wireframes: Record<number, React.ReactNode> = {
    1: <ListWireframe />,
    2: <KanbanWireframe />,
};

export function ChooseLayoutStep({ onNext, onBack, isLastStep, loading }: ChooseLayoutStepProps) {
    const layoutVersion = useAppStore((s) => s.layoutVersion);
    const setLayoutVersion = useAppStore((s) => s.setLayoutVersion);

    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-3 text-center">
                <motion.h2
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    Choose your layout
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    Pick how you want your dashboard organized. You can always change this later.
                </motion.p>
            </div>

            <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
            >
                {layouts.map((layout) => {
                    const isSelected = layoutVersion === layout.version;
                    return (
                        <button
                            key={layout.version}
                            type="button"
                            onClick={() => setLayoutVersion(layout.version)}
                            className={`relative flex flex-col gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                                isSelected
                                    ? "border-primary ring-2 ring-primary/20 bg-card/60"
                                    : "border-border/50 bg-card/30 hover:border-border hover:bg-card/40"
                            }`}
                        >
                            {isSelected && (
                                <motion.div
                                    className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary z-10"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                </motion.div>
                            )}
                            <div className="rounded-lg border border-border/30 bg-background/50 overflow-hidden h-56">
                                {wireframes[layout.version]}
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-sm">{layout.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {layout.description}
                                </p>
                                <ul className="space-y-1 pt-1">
                                    {layout.bullets.map((bullet) => (
                                        <li key={bullet} className="flex items-start gap-2 text-xs text-muted-foreground/80">
                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </button>
                    );
                })}
            </motion.div>

            <motion.div
                className="flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <Button type="button" variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button size="sm" onClick={onNext} disabled={loading} loading={loading}>
                    {isLastStep ? "Go to Dashboard" : "Continue"}
                    {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </motion.div>
        </div>
    );
}
