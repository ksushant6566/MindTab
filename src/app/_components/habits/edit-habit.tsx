import { createInsertSchema } from "drizzle-zod";
import { KeyboardEvent, useRef, useState } from "react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { habits } from "~/server/db/schema";

const ZInsertHabit = createInsertSchema(habits).omit({ userId: true });

export type EditHabitProps = {
    onSave: (habit: z.infer<typeof ZInsertHabit>) => void;
    onCancel: () => void;
    habit: typeof habits.$inferSelect;
    loading?: boolean;
};

export const EditHabit: React.FC<EditHabitProps> = ({
    onSave,
    onCancel,
    habit,
    loading,
}) => {
    const [formData, setFormData] = useState<z.infer<typeof ZInsertHabit>>({
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
    });

    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === "ArrowUp" && e.target === descriptionRef.current) {
            e.preventDefault();
            titleRef.current?.focus();
        } else if (e.key === "ArrowDown" && e.target === titleRef.current) {
            e.preventDefault();
            descriptionRef.current?.focus();
        }
    };

    titleRef.current?.focus();

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 rounded-lg border p-6"
        >
            <div className="space-y-2">
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Habit"
                    value={formData.title || ""}
                    onChange={handleChange}
                    required
                    className="w-full bg-inherit text-xl font-semibold focus:border-none focus:outline-none"
                    ref={titleRef}
                    onKeyDown={handleKeyDown}
                />
                <textarea
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full resize-none overflow-hidden bg-inherit text-base font-normal focus:border-none focus:outline-none"
                    style={{ height: "auto" }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                    ref={descriptionRef}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="flex justify-end items-center gap-2">
                <Button
                    size={"sm"}
                    variant={"secondary"}
                    className="h-8 text-xs"
                    onClick={onCancel}
                    type="button"
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    size={"sm"}
                    type="submit"
                    className="h-8 text-xs"
                    loading={loading}
                    disabled={loading}
                >
                    Save
                </Button>
            </div>
        </form>
    );
};
