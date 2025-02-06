import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
    CollisionDetection,
    rectIntersection,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { type InferSelectModel } from "drizzle-orm";
import React, { useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { type goals, type goalStatusEnum } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { DroppableColumn } from "./droppable-column";
import { Goal } from "./goal";
import { SortableGoal } from "./sortable-goal";

type TGoal = InferSelectModel<typeof goals>;
type GoalStatus = (typeof goalStatusEnum.enumValues)[number];

interface KanbanGoalsProps {
    pendingGoals?: TGoal[];
    inProgressGoals?: TGoal[];
    completedGoals?: TGoal[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, checked: CheckedState) => void;
    isDeleting: boolean;
    deleteVariables?: { id: string };
}

export const KanbanGoals: React.FC<KanbanGoalsProps> = ({
    pendingGoals = [],
    inProgressGoals = [],
    completedGoals = [],
    onEdit,
    onDelete,
    onToggleStatus,
    isDeleting,
    deleteVariables,
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [localPendingGoals, setLocalPendingGoals] = React.useState<TGoal[]>(
        []
    );
    const [localInProgressGoals, setLocalInProgressGoals] = React.useState<
        TGoal[]
    >([]);
    const [localCompletedGoals, setLocalCompletedGoals] = React.useState<
        TGoal[]
    >([]);
    const sequenceRef = useRef(0);
    const apiUtils = api.useUtils();

    useEffect(() => {
        setLocalPendingGoals(pendingGoals);
        setLocalInProgressGoals(inProgressGoals);
        setLocalCompletedGoals(completedGoals);
    }, [pendingGoals, inProgressGoals, completedGoals]);

    const { mutate: updatePositions } = api.goals.updatePositions.useMutation({
        async onMutate(variables) {
            await apiUtils.goals.getAll.cancel();
            const previousGoals = apiUtils.goals.getAll.getData();

            const updatedGoals =
                previousGoals?.map((goal) => {
                    const update = variables.goals.find(
                        (g) => g.id === goal.id
                    );
                    if (update) {
                        return {
                            ...goal,
                            position: update.position,
                            status: update.status ?? goal.status,
                        };
                    }
                    return goal;
                }) ?? [];

            updatedGoals.sort((a, b) => {
                if (a.status !== b.status) {
                    const statusOrder = {
                        pending: 0,
                        in_progress: 1,
                        completed: 2,
                    };
                    return (
                        statusOrder[a.status as keyof typeof statusOrder] -
                        statusOrder[b.status as keyof typeof statusOrder]
                    );
                }
                return a.position - b.position;
            });

            apiUtils.goals.getAll.setData(undefined, updatedGoals);

            return { previousGoals, sequence: variables.sequence };
        },
        onError(error, variables, context) {
            if (context?.sequence === sequenceRef.current) {
                setLocalPendingGoals(pendingGoals);
                setLocalInProgressGoals(inProgressGoals);
                setLocalCompletedGoals(completedGoals);
                apiUtils.goals.getAll.setData(
                    undefined,
                    context.previousGoals ?? []
                );
            }
        },
        onSettled(data, error, variables, context) {
            if (data?.sequence === sequenceRef.current) {
                apiUtils.goals.getAll.invalidate();
            }
        },
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const findContainer = (id: string): GoalStatus | undefined => {
        if (id === "pending" || id === "in_progress" || id === "completed") {
            return id;
        }

        const goal = [
            ...localPendingGoals,
            ...localInProgressGoals,
            ...localCompletedGoals,
        ].find((goal) => goal.id === id);
        return goal?.status;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeGoal = [
            ...localPendingGoals,
            ...localInProgressGoals,
            ...localCompletedGoals,
        ].find((goal) => goal.id === active.id);
        if (!activeGoal) {
            setActiveId(null);
            return;
        }

        const overContainer = findContainer(over.id as string);

        if (!overContainer) {
            setActiveId(null);
            return;
        }

        let sourceGoals: TGoal[];
        let destinationGoals: TGoal[];

        if (activeGoal.status === "pending")
            sourceGoals = [...localPendingGoals];
        else if (activeGoal.status === "in_progress")
            sourceGoals = [...localInProgressGoals];
        else sourceGoals = [...localCompletedGoals];

        if (overContainer === "pending")
            destinationGoals = [...localPendingGoals];
        else if (overContainer === "in_progress")
            destinationGoals = [...localInProgressGoals];
        else destinationGoals = [...localCompletedGoals];

        const oldIndex = sourceGoals.findIndex((g) => g.id === active.id);
        let newIndex: number;

        // Handle dropping into empty columns or onto other goals
        if (over.id === overContainer) {
            // Dropping into an empty column
            newIndex = destinationGoals.length;
        } else {
            // Dropping onto another goal
            newIndex = destinationGoals.findIndex((g) => g.id === over.id);
            if (newIndex === -1) newIndex = destinationGoals.length;
        }

        const isSameContainer = activeGoal.status === overContainer;

        const updates: { id: string; position: number; status: GoalStatus }[] =
            [];

        if (isSameContainer) {
            // Reordering within the same container
            const reorderedGoals = arrayMove(sourceGoals, oldIndex, newIndex);
            reorderedGoals.forEach((goal, index) => {
                updates.push({ id: goal.id, position: index, status: goal.status });
            });

            // Update local state
            if (overContainer === "pending")
                setLocalPendingGoals(reorderedGoals);
            else if (overContainer === "in_progress")
                setLocalInProgressGoals(reorderedGoals);
            else setLocalCompletedGoals(reorderedGoals);
        } else {
            // Moving to a different container
            sourceGoals.splice(oldIndex, 1);
            const updatedGoal = { ...activeGoal, status: overContainer };
            destinationGoals.splice(newIndex, 0, updatedGoal);

            // Update positions for source container
            sourceGoals.forEach((goal, index) => {
                updates.push({ id: goal.id, position: index, status: goal.status });
            });

            // Update positions for destination container
            destinationGoals.forEach((goal, index) => {
                updates.push({
                    id: goal.id,
                    position: index,
                    status: goal.id === activeGoal.id ? overContainer : goal.status,
                });
            });

            // Update local state
            if (activeGoal.status === "pending")
                setLocalPendingGoals(sourceGoals);
            else if (activeGoal.status === "in_progress")
                setLocalInProgressGoals(sourceGoals);
            else setLocalCompletedGoals(sourceGoals);

            if (overContainer === "pending")
                setLocalPendingGoals(destinationGoals);
            else if (overContainer === "in_progress")
                setLocalInProgressGoals(destinationGoals);
            else setLocalCompletedGoals(destinationGoals);
        }

        const sequence = ++sequenceRef.current;
        updatePositions({ goals: updates, sequence });
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const activeGoal = React.useMemo(
        () =>
            [
                ...localPendingGoals,
                ...localInProgressGoals,
                ...localCompletedGoals,
            ].find((goal) => goal.id === activeId),
        [activeId, localPendingGoals, localInProgressGoals, localCompletedGoals]
    );

    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            // First, check for intersections with other draggable items
            const rectIntersectionCollisions = rectIntersection(args);

            if (rectIntersectionCollisions.length > 0) {
                return rectIntersectionCollisions;
            }

            // If no direct intersections, check for container collisions
            const containerCollisions = pointerWithin(args);

            if (containerCollisions.length > 0) {
                const columnIds = ["pending", "in_progress", "completed"];
                const columnCollision = containerCollisions.find((collision) =>
                    columnIds.includes(collision.id as string)
                );

                if (columnCollision) {
                    return [columnCollision];
                }
            }

            return [];
        },
        []
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <ScrollArea className="h-[calc(100vh-14rem)] overflow-y-auto relative">
                <div className="grid grid-cols-3 gap-4 pb-12 pr-4">
                    <DroppableColumn
                        id="pending"
                        title={
                            <span>
                                Pending
                                {localPendingGoals.length > 0 && (
                                    <span className="text-xs text-primary ml-2 border border-muted px-2 py-0.5 rounded-sm bg-muted">
                                        {localPendingGoals.length}
                                    </span>
                                )}
                            </span>
                        }
                    >
                        <SortableContext
                            items={localPendingGoals.map((g) => g.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {localPendingGoals.map((goal) => (
                                <SortableGoal
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    isDeleting={isDeleting}
                                    deleteVariables={deleteVariables}
                                />
                            ))}
                        </SortableContext>
                    </DroppableColumn>

                    <DroppableColumn
                        id="in_progress"
                        title={
                            <span>
                                In Progress
                                <span className="text-xs text-primary ml-2 border border-muted px-2 py-0.5 rounded-sm bg-muted">
                                    {localInProgressGoals.length}
                                </span>
                            </span>
                        }
                    >
                        <SortableContext
                            items={localInProgressGoals.map((g) => g.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {localInProgressGoals.map((goal) => (
                                <SortableGoal
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    isDeleting={isDeleting}
                                    deleteVariables={deleteVariables}
                                />
                            ))}
                        </SortableContext>
                    </DroppableColumn>

                    <DroppableColumn
                        id="completed"
                        title={
                            <span>
                                Completed
                                <span className="text-xs text-primary ml-2 border border-muted px-2 py-0.5 rounded-sm bg-muted">
                                    {localCompletedGoals.length}
                                </span>
                            </span>
                        }
                    >
                        <SortableContext
                            items={localCompletedGoals.map((g) => g.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {localCompletedGoals.map((goal) => (
                                <SortableGoal
                                    key={goal.id}
                                    goal={goal}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggleStatus={onToggleStatus}
                                    isDeleting={isDeleting}
                                    deleteVariables={deleteVariables}
                                />
                            ))}
                        </SortableContext>
                    </DroppableColumn>
                </div>
            </ScrollArea>

            <DragOverlay>
                {activeGoal ? (
                    <div className="rounded-lg border bg-card p-4">
                        <Goal
                            goal={activeGoal}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleStatus={onToggleStatus}
                            isDeleting={isDeleting}
                            deleteVariables={deleteVariables}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
