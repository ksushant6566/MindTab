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
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { ScrollArea } from '~/components/ui/scroll-area'
import { type goals } from '~/server/db/schema'
import { api } from '~/trpc/react'
import { Goal } from './goal'
import { SortableGoal } from './sortable-goal'

type TGoal = InferSelectModel<typeof goals>

interface ListGoalsProps {
  pendingGoals?: TGoal[]
  completedGoals?: TGoal[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, checked: CheckedState) => void
  isDeleting: boolean
  deleteVariables?: { id: string }
}

export const ListGoals: React.FC<ListGoalsProps> = ({
  pendingGoals = [],
  completedGoals = [],
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting,
  deleteVariables,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const apiUtils = api.useUtils()

  const { mutate: updatePositions } = api.goals.updatePositions.useMutation({
    async onMutate(variables) {
      await apiUtils.goals.getAll.cancel()
      const previousGoals = apiUtils.goals.getAll.getData()

      const updatedGoals =
        previousGoals?.map((goal) => {
          const update = variables.goals.find((g) => g.id === goal.id)
          if (update) {
            return {
              ...goal,
              position: update.position,
              status: update.status ?? goal.status,
            }
          }
          return goal
        }) ?? []

      updatedGoals.sort((a, b) => {
        if (a.status !== b.status) {
          const statusOrder = { pending: 0, completed: 1 }
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
        }
        return a.position - b.position
      })

      apiUtils.goals.getAll.setData(undefined, updatedGoals)

      return { previousGoals }
    },
    onError(error, variables, context) {
      apiUtils.goals.getAll.setData(undefined, context?.previousGoals ?? [])
    },
    onSettled() {
      apiUtils.goals.getAll.invalidate()
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

  const findContainer = (id: string) => {
    if (id === 'pending' || id === 'completed') {
      return id
    }

    const goal = [...pendingGoals, ...completedGoals].find((goal) => goal.id === id)
    return goal?.status
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeGoal = [...pendingGoals, ...completedGoals].find((goal) => goal.id === active.id)
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

    if (activeGoal.status === 'pending') sourceGoals = [...pendingGoals]
    else sourceGoals = [...completedGoals]

    if (overContainer === 'pending') destinationGoals = [...pendingGoals]
    else destinationGoals = [...completedGoals]

    const oldIndex = sourceGoals.findIndex((g) => g.id === active.id)
    const newIndex =
      over.id === overContainer ? destinationGoals.length : destinationGoals.findIndex((g) => g.id === over.id)

    const isSameContainer = activeGoal.status === overContainer
    const updates: { id: string; position: number; status?: 'pending' | 'completed' }[] = []

    if (isSameContainer) {
      // Reordering within the same container
      const reorderedGoals = arrayMove(sourceGoals, oldIndex, newIndex)
      reorderedGoals.forEach((goal, index) => {
        updates.push({ id: goal.id, position: index })
      })
    } else {
      // Moving to a different container
      sourceGoals.splice(oldIndex, 1)
      destinationGoals.splice(newIndex, 0, { ...activeGoal, status: overContainer as any })

      // Update positions for source container
      sourceGoals.forEach((goal, index) => {
        updates.push({ id: goal.id, position: index })
      })

      // Update positions for destination container
      destinationGoals.forEach((goal, index) => {
        updates.push({
          id: goal.id,
          position: index,
          status: goal.id === activeGoal.id ? (overContainer as any) : undefined,
        })
      })
    }

    updatePositions({ goals: updates })
    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeGoal = React.useMemo(
    () => [...pendingGoals, ...completedGoals].find((goal) => goal.id === activeId),
    [activeId, pendingGoals, completedGoals],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <ScrollArea className="h-[calc(100vh-18rem)] overflow-y-auto relative">
        <div className="flex flex-col gap-0 pr-4 pb-12">
          <Accordion type="single" collapsible defaultValue="pending">
            <AccordionItem value="pending">
              <AccordionTrigger className="text-sm font-medium pt-0">Pending</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <SortableContext items={pendingGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                  {pendingGoals.map((goal) => (
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Accordion type="single" collapsible defaultValue={pendingGoals.length ? undefined : 'completed'}>
            <AccordionItem value="completed">
              <AccordionTrigger className="text-sm font-medium">Completed</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <SortableContext items={completedGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                  {completedGoals.map((goal) => (
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
