"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight, Chrome, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

type ChromeExtensionStepProps = {
    onNext: () => void;
    onBack: () => void;
};

export function ChromeExtensionStep({ onNext, onBack }: ChromeExtensionStepProps) {
    const [installClicked, setInstallClicked] = useState(false);

    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-3 text-center">
                <motion.h2
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    One last thing
                </motion.h2>
                <motion.p
                    className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                >
                    Replace your blank new tab with your MindTab dashboard.
                </motion.p>
            </div>

            {/* Browser mockup */}
            <motion.div
                className="rounded-xl border-2 border-border bg-card overflow-hidden"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
            >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/50">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-2 rounded-md bg-background/60 border border-border/30 px-3 py-1 text-xs text-muted-foreground/70 min-w-[200px]">
                            <span>New Tab</span>
                        </div>
                    </div>
                    <div className="w-[52px]" />
                </div>

                {/* Before / After */}
                <div className="grid grid-cols-2">
                    {/* Before */}
                    <div className="p-5 border-r border-border/30">
                        <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">Without extension</div>
                        <div className="rounded-lg border border-border/20 bg-muted/10 p-8 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <div className="text-3xl text-muted-foreground/20">G</div>
                                <div className="h-2 w-24 rounded bg-muted/20 mx-auto" />
                            </div>
                        </div>
                    </div>
                    {/* After */}
                    <div className="p-5">
                        <div className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider mb-3">With MindTab</div>
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                            {/* Mini dashboard wireframe */}
                            <div className="flex items-center justify-between">
                                <div className="text-[8px] text-muted-foreground font-mono">12:00 PM</div>
                                <div className="flex gap-1">
                                    <div className="px-1.5 py-0.5 rounded text-[7px] bg-primary/20 text-primary font-medium">Goals</div>
                                    <div className="px-1.5 py-0.5 rounded text-[7px] bg-muted/30 text-muted-foreground font-medium">Notes</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-10 gap-1.5">
                                <div className="col-span-4 space-y-1">
                                    <div className="rounded border border-border/20 bg-card/30 p-1.5 space-y-1">
                                        <div className="h-1 w-[80%] rounded bg-foreground/10" />
                                        <div className="flex gap-0.5">
                                            <div className="h-1 w-3 rounded bg-red-500/25" />
                                            <div className="h-1 w-2 rounded bg-yellow-500/20" />
                                        </div>
                                    </div>
                                    <div className="rounded border border-border/15 bg-card/20 p-1.5 space-y-1">
                                        <div className="h-1 w-[60%] rounded bg-foreground/8" />
                                        <div className="flex gap-0.5">
                                            <div className="h-1 w-3 rounded bg-green-500/20" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-6 space-y-1">
                                    <div className="grid grid-cols-8 gap-0.5">
                                        <div className="h-1 rounded bg-foreground/5" />
                                        {[true, false, true, false, false, false, false].map((on, i) => (
                                            <div key={i} className={`h-2.5 rounded-sm ${on ? "bg-emerald-500/25" : "bg-muted/10"}`} />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-8 gap-0.5">
                                        <div className="h-1 rounded bg-foreground/5" />
                                        {[true, true, false, false, false, false, false].map((on, i) => (
                                            <div key={i} className={`h-2.5 rounded-sm ${on ? "bg-emerald-500/25" : "bg-muted/10"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
            >
                <Button
                    size="lg"
                    className="w-full"
                    asChild
                >
                    <a
                        href="https://chromewebstore.google.com/detail/mindtab/ndnegdefonikfckhbgmejdodebnbhjll"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setInstallClicked(true)}
                    >
                        <Chrome className="mr-2 h-4 w-4" />
                        Install Chrome Extension
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                </Button>
            </motion.div>

            <motion.div
                className="flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <Button type="button" variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button variant={installClicked ? "default" : "ghost"} size="sm" onClick={onNext}>
                    {installClicked ? (
                        <>
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                        "Skip for now"
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
