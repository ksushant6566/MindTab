import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { type CheckedState } from '@radix-ui/react-checkbox'
import { type InferSelectModel } from 'drizzle-orm'
import React, { useEffect, useRef } from 'react'
import { ScrollArea } from '~/components/ui/scroll-area'
import { type goals, type goalStatusEnum } from '~/server/db/schema'
import { api } from '~/trpc/react'
import { DroppableColumn } from './droppable-column'
import { Goal } from './goal'
import { SortableGoal } from './sortable-goal'

type TGoal = InferSelectModel<typeof goals>
type GoalStatus = typeof goalStatusEnum.enumValues[number]

interface KanbanGoalsProps {
    pendingGoals?: TGoal[]
    inProgressGoals?: TGoal[]
    completedGoals?: TGoal[]
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string, checked: CheckedState) => void
    isDeleting: boolean
    deleteVariables?: { id: string }
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
    const [activeId, setActiveId] = React.useState<string | null>(null)
    const [localPendingGoals, setLocalPendingGoals] = React.useState<TGoal[]>([])
    const [localInProgressGoals, setLocalInProgressGoals] = React.useState<TGoal[]>([])
    const [localCompletedGoals, setLocalCompletedGoals] = React.useState<TGoal[]>([])
    const sequenceRef = useRef(0)
    const apiUtils = api.useUtils()

    useEffect(() => {
        setLocalPendingGoals(pendingGoals)
        setLocalInProgressGoals(inProgressGoals)
        setLocalCompletedGoals(completedGoals)
    }, [pendingGoals, inProgressGoals, completedGoals])

    const { mutate: updatePositions } = api.goals.updatePositions.useMutation({
        onError(error, variables, context) {
            // revert local state
            if (variables?.sequence === sequenceRef.current) {
                setLocalPendingGoals(pendingGoals)
                setLocalInProgressGoals(inProgressGoals)
                setLocalCompletedGoals(completedGoals)
            }
        },
        onSettled(data, error, variables, context) {
            if (data?.sequence === sequenceRef.current) {
                apiUtils.goals.getAll.invalidate()
            }
        },
    })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor),
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const findContainer = (id: string): GoalStatus | undefined => {
        if (id === 'pending' || id === 'in_progress' || id === 'completed') {
            return id
        }

        const goal = [...localPendingGoals, ...localInProgressGoals, ...localCompletedGoals].find((goal) => goal.id === id)
        return goal?.status
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            return
        }

        const activeGoal = [...localPendingGoals, ...localInProgressGoals, ...localCompletedGoals].find(
            (goal) => goal.id === active.id,
        )
        if (!activeGoal) {
            setActiveId(null)
            return
        }

        const overContainer = findContainer(over.id as string)
        if (!overContainer) {
            setActiveId(null)
            return
        }

        let sourceGoals: TGoal[]
        let destinationGoals: TGoal[]

        if (activeGoal.status === 'pending') sourceGoals = [...localPendingGoals]
        else if (activeGoal.status === 'in_progress') sourceGoals = [...localInProgressGoals]
        else sourceGoals = [...localCompletedGoals]

        if (overContainer === 'pending') destinationGoals = [...localPendingGoals]
        else if (overContainer === 'in_progress') destinationGoals = [...localInProgressGoals]
        else destinationGoals = [...localCompletedGoals]

        const oldIndex = sourceGoals.findIndex((g) => g.id === active.id)
        const newIndex =
            over.id === overContainer ? destinationGoals.length : destinationGoals.findIndex((g) => g.id === over.id)

        const isSameContainer = activeGoal.status === overContainer
        const updates: { id: string; position: number; status?: GoalStatus }[] = []

        if (isSameContainer) {
            // Reordering within the same container
            const reorderedGoals = arrayMove(sourceGoals, oldIndex, newIndex)
            reorderedGoals.forEach((goal, index) => {
                updates.push({ id: goal.id, position: index })
            })

            // Update local state
            if (overContainer === 'pending') setLocalPendingGoals(reorderedGoals)
            else if (overContainer === 'in_progress') setLocalInProgressGoals(reorderedGoals)
            else setLocalCompletedGoals(reorderedGoals)
        } else {
            // Moving to a different container
            sourceGoals.splice(oldIndex, 1)
            const updatedGoal = { ...activeGoal, status: overContainer }
            destinationGoals.splice(newIndex, 0, updatedGoal)

            // Update positions for source container
            sourceGoals.forEach((goal, index) => {
                updates.push({ id: goal.id, position: index })
            })

            // Update positions for destination container
            destinationGoals.forEach((goal, index) => {
                updates.push({
                    id: goal.id,
                    position: index,
                    status: goal.id === activeGoal.id ? overContainer : undefined,
                })
            })

            // Update local state
            if (activeGoal.status === 'pending') setLocalPendingGoals(sourceGoals)
            else if (activeGoal.status === 'in_progress') setLocalInProgressGoals(sourceGoals)
            else setLocalCompletedGoals(sourceGoals)

            if (overContainer === 'pending') setLocalPendingGoals(destinationGoals)
            else if (overContainer === 'in_progress') setLocalInProgressGoals(destinationGoals)
            else setLocalCompletedGoals(destinationGoals)
        }

        const sequence = ++sequenceRef.current
        updatePositions({ goals: updates, sequence })
        setActiveId(null)
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    const activeGoal = React.useMemo(
        () => [...localPendingGoals, ...localInProgressGoals, ...localCompletedGoals].find((goal) => goal.id === activeId),
        [activeId, localPendingGoals, localInProgressGoals, localCompletedGoals],
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <ScrollArea className="h-[calc(100vh-14rem)] overflow-y-auto relative">
                <div className="grid grid-cols-3 gap-2 pr-4 pb-12">
                    <DroppableColumn id="pending" title="Pending">
                        <SortableContext items={localPendingGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
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

                    <DroppableColumn id="in_progress" title="In Progress">
                        <SortableContext items={localInProgressGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
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

                    <DroppableColumn id="completed" title="Completed">
                        <SortableContext items={localCompletedGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
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
    )
}
