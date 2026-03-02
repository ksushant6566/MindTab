"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TipTapEditor } from "~/components/text-editor";

type NotesIntroStepProps = {
    goalTitle: string | null;
    onNext: () => void;
    onBack: () => void;
};

function getNotesContent(goalTitle: string) {
    return `<h3>What you can do with Notes</h3><p>Notes are your space to think, plan, and reflect. Everything you write is <strong>saved automatically</strong> and organized by project.</p><h3>Rich formatting</h3><p>You can write in <strong>bold</strong>, <em>italic</em>, <s>strikethrough</s>, or use <code>inline code</code> for technical notes. Structure your thoughts with headings, lists, and more.</p><ul><li><p>Bullet lists for quick ideas</p></li><li><p>Nested thoughts and outlines</p></li></ul><ol><li><p>Numbered steps for processes</p></li><li><p>Sequential instructions</p></li></ol><blockquote><p>"The faintest ink is more powerful than the strongest memory." — Start writing, and your future self will thank you.</p></blockquote><h3>@mentions</h3><p>Link your notes to anything in your workspace. Type <code>@</code> to reference goals, habits, and other notes. For example, you could mention your goal <strong>${goalTitle}</strong> and it becomes a clickable link in your note.</p><p>Notes pair with everything else in MindTab — use them to plan goals, log habit reflections, or just capture what's on your mind.</p>`;
}

export function NotesIntroStep({ goalTitle, onNext, onBack }: NotesIntroStepProps) {
    const mentionText = goalTitle ?? "Learn TypeScript";
    const [title, setTitle] = useState("Notes — your thinking space");
    const [content, setContent] = useState(() => getNotesContent(mentionText));

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
                className="flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Button type="button" variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button size="sm" onClick={onNext} className="group">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
            </motion.div>
        </div>
    );
}
