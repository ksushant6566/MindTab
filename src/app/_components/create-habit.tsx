import { createInsertSchema } from "drizzle-zod";
import { useState } from "react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { habits } from "~/server/db/schema";

const ZInsertHabit = createInsertSchema(habits).omit({ userId: true });

export type CreateHabitProps = {
    onSave: (habit: z.infer<typeof ZInsertHabit>) => void;
    onCancel: () => void;
};

export const CreateHabit: React.FC<CreateHabitProps> = ({
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState<z.infer<typeof ZInsertHabit>>({
        title: "",
        description: "",
        frequency: "daily",
    });

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

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 rounded-lg border p-4"
        >
            <div className="">
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Habit name"
                    value={formData.title || ""}
                    onChange={handleChange}
                    required
                    className="w-full bg-inherit text-base font-semibold focus:border-none focus:outline-none"
                />
                <textarea
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full resize-none overflow-hidden bg-inherit text-sm font-normal focus:border-none focus:outline-none"
                    style={{ height: "auto" }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />
            </div>
            <div className="flex justify-end items-center gap-2">
                <Button
                    size={"sm"}
                    variant={"secondary"}
                    className="h-8 text-xs"
                    onClick={onCancel}
                    type="button"
                >
                    Cancel
                </Button>
                <Button size={"sm"} type="submit" className="h-8 text-xs">
                    Create
                </Button>
            </div>
        </form>
    );
};
