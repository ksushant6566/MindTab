import { type CheckedState } from "@radix-ui/react-checkbox";
import { type InferSelectModel } from "drizzle-orm";
import { Edit3, Flag, Trash2, Zap, FolderOpen } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { type goals } from "~/server/db/schema";

type TGoal = InferSelectModel<typeof goals> & {
    project?: {
        id: string;
        name: string | null;
        status: string;
    } | null;
};

const priorityColors = {
    priority_1: "red",
    priority_2: "yellow",
    priority_3: "green",
    priority_4: "white",
};

interface GoalProps {
    goal: TGoal;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, checked: CheckedState) => void;
    isDeleting: boolean;
    deleteVariables?: { id: string };
}

export const Goal: React.FC<GoalProps> = ({
    goal,
    onEdit,
    onDelete,
    onToggleStatus,
    isDeleting,
    deleteVariables,
}) => {
    return (
        <div className="group relative grid grid-cols-[auto,1fr] gap-3 items-start">
            <Checkbox
                id={goal.id}
                className="h-4 w-4 rounded-full mt-0.5"
                checked={["completed", "archived"].includes(goal.status)}
                onCheckedChange={(checked) => onToggleStatus(goal.id, checked)}
            />
            <div className="flex flex-col gap-1 min-w-0">
                <Label
                    className={`text-sm font-medium ${["completed", "archived"].includes(goal.status) ? "line-through" : ""}`}
                >
                    {goal.title}
                </Label>
                {goal.description && (
                    <p
                        className={`text-sm text-muted-foreground ${["completed", "archived"].includes(goal.status) ? "line-through" : ""} break-words`}
                    >
                        {goal.description}
                    </p>
                )}
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-muted-foreground">
                        <Flag
                            className="h-3 w-3"
                            color={
                                priorityColors[
                                    goal.priority as keyof typeof priorityColors
                                ]
                            }
                            fill={
                                priorityColors[
                                    goal.priority as keyof typeof priorityColors
                                ]
                            }
                        />
                        P{goal.priority.split("_")[1]}
                    </span>
                    <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-muted-foreground text-yellow-300">
                        <Zap
                            className="mr-1 h-3 w-3"
                            color={"gold"}
                            fill={"gold"}
                        />
                        {goal.impact}
                    </span>
                    {/* <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-green-300">
                        {goal.category}
                    </span> */}
                    {goal.project && (
                        <span className="flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900 px-1 py-0.5 text-xs text-blue-800 dark:text-blue-200">
                            <FolderOpen className="h-3 w-3" />
                            {goal.project.name || "Project"}
                        </span>
                    )}
                </div>
            </div>
            <div className="absolute right-0 bottom-0 flex z-10 -translate-y-6 gap-0 opacity-0 transition-all group-hover:translate-y-1.5 group-hover:opacity-100">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0.5"
                    onClick={() => onEdit(goal.id)}
                >
                    <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-900 active:bg-red-900 h-8 w-8 p-0.5"
                    onClick={() => onDelete(goal.id)}
                    disabled={isDeleting && deleteVariables?.id === goal.id}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
