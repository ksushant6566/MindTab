import React, { useMemo } from "react";
import { TipTapEditor } from "~/components/text-editor";
import { Button } from "~/components/ui/button";
import { Edit3, Trash2, FolderOpen } from "lucide-react";
import { type InferSelectModel } from "drizzle-orm";

import { journal } from "~/server/db/schema";

type TJournal = InferSelectModel<typeof journal> & {
    project?: {
        id: string;
        name: string | null;
        status: string;
    } | null;
};

type JournalProps = {
    journal: TJournal;
    overflowingJournals: Set<string>;
    contentRefs: React.MutableRefObject<{
        [key: string]: HTMLDivElement | null;
    }>;
    onShowMore: (id: string) => void;
    onEditJournal: (id: string) => void;
    deleteJournal: (id: string) => void;
    isDeletingJournal: boolean;
    deleteJournalVariables: { id: string } | undefined;
};

export const JournalPreview = ({
    journal,
    overflowingJournals,
    contentRefs,
    onShowMore,
    onEditJournal,
    deleteJournal,
    isDeletingJournal,
    deleteJournalVariables,
}: JournalProps) => {
    return (
        <div
            key={journal.id}
            className="mb-6 py-2 relative rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            <div
                className="max-h-56 overflow-y-hidden"
                ref={(el) => {
                    if (el) {
                        contentRefs.current[journal.id] = el;
                    }
                }}
            >
                <TipTapEditor
                    content={journal.content ?? ""}
                    onContentChange={() => void {}}
                    title={journal.title ?? ""}
                    onTitleChange={() => void {}}
                    editable={false}
                />
            </div>
            {overflowingJournals.has(journal.id) && (
                <div className="flex justify-end -mt-2 mr-2">
                    <Button
                        variant="link"
                        className="text-sm hover:no-underline text-muted-foreground hover:text-foreground"
                        onClick={() => onShowMore(journal.id)}
                    >
                        Show more
                    </Button>
                </div>
            )}
            <div className="flex justify-between items-center px-4 py-0 rounded-b-lg -mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {journal.createdAt.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                        })}
                    </span>
                    {journal.project && (
                        <span className="flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900 px-1 py-0.5 text-xs text-blue-800 dark:text-blue-200">
                            <FolderOpen className="h-3 w-3" />
                            {journal.project.name || "Project"}
                        </span>
                    )}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditJournal(journal.id)}
                    >
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-900 active:bg-red-900"
                        onClick={() => deleteJournal(journal.id)}
                        disabled={
                            isDeletingJournal &&
                            deleteJournalVariables?.id === journal.id
                        }
                        loading={
                            isDeletingJournal &&
                            deleteJournalVariables?.id === journal.id
                        }
                        hideContentWhenLoading
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
