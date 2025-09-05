import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { cn } from "~/lib/utils";

interface DroppableColumnProps {
    id: string;
    title: string | React.ReactNode;
    children: React.ReactNode;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
    id,
    title,
    children,
}) => {
    const { setNodeRef, isOver, active } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-4 rounded-lg transition-all min-w-[200px] w-full",
                isOver && active && "border-primary/50 bg-muted"
            )}
        >
            <h3 className="text-sm font-medium">{title}</h3>
            <div
                className={cn(
                    "flex flex-col gap-4 min-h-[100px] transition-all",
                    isOver && active && "scale-[1.02]"
                )}
            >
                {children}
            </div>
        </div>
    );
};
