"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { TipTapEditor } from "~/components/text-editor";
import { api } from "~/trpc/react";
import { Edit3, FolderOpen } from "lucide-react";
import { ToggleGroupItem } from "~/components/ui/toggle-group";
import { ToggleGroup } from "~/components/ui/toggle-group";

type TMentionedItem = {
    label: string;
    id: string;
    type: "journal" | "goal" | "habit";
};
type TMentionedItems = {
    journal: TMentionedItem[];
    goal: TMentionedItem[];
    habit: TMentionedItem[];
};

type TJournalDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultMode: "edit" | "view" | null;
    journal: {
        id: string;
        title: string;
        content: string;
        projectId?: string | null;
        project?: {
            id: string;
            name: string | null;
            status: string;
        } | null;
    } | null;
};

export const JournalDialog = ({
    isOpen,
    onOpenChange,
    defaultMode,
    journal,
}: TJournalDialogProps) => {
    const apiUtils = api.useUtils();
    const { data: projects } = api.projects.getAll.useQuery();

    const [mode, setMode] = useState<"edit" | "view" | null>(defaultMode);
    const [info, setInfo] = useState({
        id: journal?.id ?? "",
        title: journal?.title ?? "",
        content: journal?.content ?? "",
        projectId: journal?.projectId ?? null,
    });

    const { mutate: updateJournal, isPending: isUpdatingJournal } =
        api.journals.update.useMutation({
            onSuccess: () => {
                setMode("view");
            },
            onError: (error) => {
                toast.error(error.message || "Failed to update note");
            },
            onSettled: () => {
                apiUtils.journals.getAll.invalidate();
                apiUtils.journals.search.invalidate();
            },
        });

    useEffect(() => {
        setMode(defaultMode ?? mode ?? "view");
        setInfo({
            id: journal?.id ?? "",
            title: journal?.title ?? "",
            content: journal?.content ?? "",
            projectId: journal?.projectId ?? null,
        });
    }, [defaultMode, journal]);

    if (!journal || !info) return null;

    const handleSubmit = () => {
        updateJournal({
            id: journal.id,
            content: info.content,
            title: info.title,
            projectId: info.projectId,
        });
    };

    const toggleMode = () => {
        setMode(mode === "edit" ? "view" : "edit");
    };

    // function to extract mentioned items from the journal content
    const getMentionedItems = () => {
        const mentionedItems: TMentionedItems = {
            journal: [],
            goal: [],
            habit: [],
        };

        // 1. get all spans in this journal content with class 'mention'
        // Parse the HTML string into a DOM object
        const parser = new DOMParser();
        const doc = parser.parseFromString(info.content, "text/html");

        // Select all span elements with the class 'mention'
        const mentionSpans = doc.querySelectorAll(".mention");

        if (!mentionSpans) return mentionedItems;

        const mentionedIdsSet = new Set<string>();

        // 2. loop through each span
        mentionSpans.forEach((span) => {
            const [type, id] = span.getAttribute("data-id")?.split(":") || [];
            const label = span.getAttribute("data-label");

            if (id && label && type) {
                if (!mentionedIdsSet.has(id)) {
                    mentionedItems[type as keyof TMentionedItems].push({
                        id,
                        label,
                        type,
                    } as TMentionedItem);
                    mentionedIdsSet.add(id);
                }
            }
        });

        return mentionedItems;
    };

    const mentionedItems = getMentionedItems();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className={`sm:max-w-[1000px] ${mode === "view" ? "p-0" : ""}`}
            >
                {mode === "edit" ? (
                    <>
                        <DialogTitle>Edit note</DialogTitle>
                        <DialogDescription className="-mt-2">
                            Edit your note.
                        </DialogDescription>
                    </>
                ) : (
                    <>
                        <DialogTitle className="sr-only">
                            {info.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            {info.content}
                        </DialogDescription>
                    </>
                )}
                <ToggleGroup
                    type="single"
                    className="absolute top-2.5 right-9 cursor-pointer z-10"
                >
                    <ToggleGroupItem
                        value="edit"
                        aria-label="Toggle edit"
                        onClick={toggleMode}
                        data-state={mode === "edit" ? "on" : "off"}
                        className="p-1.5 h-7 w-7"
                    >
                        <Edit3 className="h-3 w-3" />
                    </ToggleGroupItem>
                </ToggleGroup>

                {/* Project Selection - only in edit mode */}
                {mode === "edit" && (
                    <div className="flex gap-2 pb-2">
                        <Select
                            onValueChange={(value) =>
                                setInfo({
                                    ...info,
                                    projectId: value === "none" ? null : value,
                                })
                            }
                            value={info.projectId || "none"}
                        >
                            <SelectTrigger className="w-fit focus:ring-0">
                                <SelectValue placeholder="Project">
                                    <span className="flex items-center gap-1 text-sm">
                                        <FolderOpen className="h-4 w-4" />
                                        {info.projectId
                                            ? projects?.find(
                                                  (p) => p.id === info.projectId
                                              )?.name || "Project"
                                            : "No Project"}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="text-sm">
                                <SelectGroup>
                                    <SelectLabel>Project</SelectLabel>
                                    <SelectItem value="none">
                                        <span className="flex items-center gap-2 text-sm">
                                            No Project
                                        </span>
                                    </SelectItem>
                                    {projects?.map((project) => (
                                        <SelectItem
                                            key={project.id}
                                            value={project.id}
                                        >
                                            <span className="flex items-center gap-2 text-sm">
                                                <FolderOpen className="h-4 w-4" />
                                                {project.name ||
                                                    "Unnamed Project"}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div
                    className={`border border-input rounded-lg overflow-y-auto overflow-x-visible ${mode === "view" ? "max-h-[calc(100vh-8rem)] p-4 pb-0 rounded-b-none" : "max-h-[calc(100vh-18rem)] p-1 pb-0"}`}
                >
                    <TipTapEditor
                        content={info.content}
                        onContentChange={(content) =>
                            setInfo({ ...info, content })
                        }
                        title={info.title}
                        onTitleChange={(title) => setInfo({ ...info, title })}
                        editable={mode !== "view"}
                    />
                </div>
                {mode === "edit" ? (
                    <DialogFooter>
                        <Button
                            onClick={() => onOpenChange(false)}
                            size={"sm"}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            size={"sm"}
                            disabled={
                                isUpdatingJournal ||
                                !info.title ||
                                !info.content
                            }
                        >
                            {isUpdatingJournal ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                ) : (
                    <div className="p-4 pt-2 flex flex-wrap gap-1 -mt-2">
                        <div className="flex flex-wrap gap-1">
                            {/* Project badge in view mode */}
                            {journal.project && (
                                <span className="flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-sm text-blue-800 dark:text-blue-200">
                                    <FolderOpen className="h-3 w-3" />
                                    {journal.project.name || "Project"}
                                </span>
                            )}
                            {mentionedItems.goal.map((item) => (
                                <span
                                    key={item.id}
                                    data-id={`goal:${item.id}`}
                                    data-label={item.label}
                                    className="text-sm bg-secondary rounded-md px-2 py-0.5 hover:bg-secondary/50 text-green-500 cursor-pointer"
                                >
                                    {item.label.split(":")[1]}
                                </span>
                            ))}
                            {mentionedItems.habit.map((item) => (
                                <span
                                    key={item.id}
                                    data-id={`habit:${item.id}`}
                                    data-label={item.label}
                                    className="text-sm bg-secondary rounded-md px-2 py-0.5 hover:bg-secondary/50 text-fuchsia-400 cursor-pointer"
                                >
                                    {item.label.split(":")[1]}
                                </span>
                            ))}
                            {mentionedItems.journal.map((item) => (
                                <span
                                    key={item.id}
                                    data-id={`journal:${item.id}`}
                                    data-label={item.label}
                                    className="text-sm bg-secondary rounded-md px-2 py-0.5 hover:bg-secondary/50 text-orange-400 cursor-pointer"
                                >
                                    {item.label.split(":")[1]}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
