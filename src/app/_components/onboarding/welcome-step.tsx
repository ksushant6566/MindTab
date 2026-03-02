"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TipTapEditor } from "~/components/text-editor";
import { api } from "~/trpc/react";
import { toast } from "sonner";

type WelcomeStepProps = {
    userName: string;
    onNext: () => void;
};

function getDefaultContent(_firstName: string) {
    return `<p>Most productivity tools ask you to change how you work. MindTab just asks you to open a new tab.</p><p></p><p>You're reading a <strong>note</strong> right now — the same editor you'll use to journal, plan, and reflect. Everything you type here is real. Edit freely.</p><h3>How MindTab works</h3><p>Your dashboard replaces the new tab page. Every time you open one, you see:</p><ul><li><p><strong>Projects</strong> — containers for different areas of your life</p></li><li><p><strong>Goals</strong> — with priorities, impact levels, and statuses that track real progress</p></li><li><p><strong>Habits</strong> — daily check-ins that build streaks and earn you XP</p></li><li><p><strong>Notes</strong> — a rich editor (this one) with <strong>@mentions</strong> that link directly to your goals, habits, and other notes</p></li></ul><p>Everything is connected. A goal belongs to a project. A note can reference a habit. Your progress is visible at a glance.</p><h3>Let's build your workspace</h3><p>The next steps take about a minute: pick a layout, name a project, set one goal, start one habit. Small moves — but after this, your new tab will never feel empty again.</p><p></p><p>Hit <strong>Continue</strong> when you're ready. This note saves to your dashboard.</p>`;
}

export function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
    const firstName = userName.split(" ")[0] ?? "there";
    const [title, setTitle] = useState("Your new starting line");
    const [content, setContent] = useState(() => getDefaultContent(firstName));

    const createJournal = api.journals.create.useMutation({
        onSuccess: () => {
            onNext();
        },
        onError: (error) => {
            if (error.data?.code === "CONFLICT") {
                onNext();
                return;
            }
            toast.error(error.message || "Failed to save note");
        },
    });

    const handleContinue = () => {
        if (title.trim() && content.trim()) {
            createJournal.mutate({
                title: title.trim(),
                content,
                projectId: null,
            });
        } else {
            onNext();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <motion.div
                className="rounded-xl border-2 border-border bg-card overflow-hidden"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
            >
                <div className="px-2 py-3">
                    <TipTapEditor
                        title={title}
                        onTitleChange={setTitle}
                        content={content}
                        onContentChange={setContent}
                        editable={true}
                    />
                </div>
            </motion.div>

            <motion.div
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Button
                    size="sm"
                    onClick={handleContinue}
                    disabled={createJournal.isPending}
                    loading={createJournal.isPending}
                    className="group"
                >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
            </motion.div>
        </div>
    );
}
