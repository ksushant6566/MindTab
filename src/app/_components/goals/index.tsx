import { type CheckedState } from '@radix-ui/react-checkbox'
import { createInsertSchema } from 'drizzle-zod'
import { LayoutGrid, List, Plus } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { goals } from '~/server/db/schema'
import { api } from '~/trpc/react'
import { Clock } from '../clock'
import { CreateGoalDialog } from './create-goal-dialog'
import { EditGoalDialog } from './edit-goal-dialog'
import { GoalSkeleton } from './goal-skeleton'
import { KanbanGoals } from './kanban-goals'
import { ListGoals } from './list-goals'

const ZInsertGoal = createInsertSchema(goals).omit({ userId: true })

type ViewMode = 'list' | 'kanban'

export const Goals: React.FC = () => {
  const apiUtils = api.useUtils()

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [editGoalId, setEditGoalId] = useState<string | null>(null)

  useEffect(() => {
    const savedViewMode = localStorage.getItem('goalsViewMode') as ViewMode
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('goalsViewMode', mode)
  }

  const { data: goals, isLoading, refetch } = api.goals.getAll.useQuery(undefined, {})

  const { mutate: createGoal, isPending: isCreatingGoal } = api.goals.create.useMutation({
    onSuccess: () => refetch(),
  })

  const { mutate: updateGoal } = api.goals.update.useMutation({
    async onMutate(variables) {
      await apiUtils.goals.getAll.cancel()
      const previousGoals = apiUtils.goals.getAll.getData()

      const updatedGoals = previousGoals?.map((goal) =>
        goal.id === variables.id
          ? {
            ...goal,
            ...variables,
          }
          : goal,
      ) as any

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

  const {
    mutate: deleteGoal,
    isPending: isDeletingGoal,
    variables: deleteGoalVariables,
  } = api.goals.delete.useMutation({
    async onMutate(variables) {
      await apiUtils.goals.getAll.cancel()
      const previousGoals = apiUtils.goals.getAll.getData() ?? []

      apiUtils.goals.getAll.setData(
        undefined,
        previousGoals.filter((goal) => goal.id !== variables.id),
      )
      return { previousGoals }
    },
    onError(error, variables, context) {
      apiUtils.goals.getAll.setData(undefined, context?.previousGoals ?? [])
    },
  })

  const onCreateGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    createGoal(goal)
    setIsCreateGoalOpen(false)
  }

  const onCancelCreateGoal = () => setIsCreateGoalOpen(false)

  const toggleGoalStatus = (goalId: string, checked: CheckedState) => {
    const goal = goals?.find((g) => g.id === goalId)
    if (!goal) return

    let newStatus: 'pending' | 'in_progress' | 'completed'
    if (goal.status === 'pending') {
      newStatus = 'in_progress'
    } else if (goal.status === 'in_progress') {
      newStatus = 'completed'
    } else {
      newStatus = 'pending'
    }

    updateGoal({
      id: goalId,
      status: newStatus,
    })
  }

  const handleDeleteGoal = (goalId: string) => deleteGoal({ id: goalId })

  const onSaveEditGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    if (!editGoalId) return
    updateGoal({ ...goal, id: editGoalId })
    setEditGoalId(null)
  }

  const onCancelEditGoal = () => setEditGoalId(null)

  const priorityNumberMap = {
    priority_1: 1,
    priority_2: 2,
    priority_3: 3,
    priority_4: 4,
  }

  const getSortedPendingGoals = () => {
    return goals?.filter((goal) => goal.status === 'pending')
    // .sort((a, b) => priorityNumberMap[a.priority] - priorityNumberMap[b.priority])
  }

  const getSortedInProgressGoals = () => {
    return goals?.filter((goal) => goal.status === 'in_progress')
    // .sort((a, b) => priorityNumberMap[a.priority] - priorityNumberMap[b.priority])
  }

  const getSortedCompletedGoals = () => {
    return goals?.filter((goal) => goal.status === 'completed')
    // .sort((a, b) => new Date(b.updatedAt ?? '').getTime() - new Date(a.updatedAt ?? '').getTime())
  }

  const sortedPendingGoals = useMemo(() => {
    return getSortedPendingGoals()
  }, [goals])

  const sortedInProgressGoals = useMemo(() => {
    return getSortedInProgressGoals()
  }, [goals])

  const sortedCompletedGoals = useMemo(() => {
    return getSortedCompletedGoals()
  }, [goals])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Clock />
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div>
        {isLoading ? (
          <GoalSkeleton />
        ) : (
          <div className="flex flex-col gap-4 pr-4">
            {isCreateGoalOpen ? (
              <CreateGoalDialog
                open={isCreateGoalOpen}
                onOpenChange={setIsCreateGoalOpen}
                onSave={onCreateGoal}
                onCancel={onCancelCreateGoal}
                defaultValues={{ type: 'daily' }}
              />
            ) : (
              <div className="-mb-2 -ml-2 flex justify-start">
                <Button
                  onClick={() => setIsCreateGoalOpen(true)}
                  disabled={isCreatingGoal}
                  loading={isCreatingGoal}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-sm font-normal"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </Button>
              </div>
            )}

            {editGoalId && goals?.find((g) => g.id === editGoalId) && (
              <EditGoalDialog
                open={!!editGoalId}
                onOpenChange={(open: boolean) => {
                  if (!open) {
                    setEditGoalId(null)
                  }
                }}
                goal={goals.find((g) => g.id === editGoalId)!}
                onSave={onSaveEditGoal}
                onCancel={onCancelEditGoal}
              />
            )}

            {viewMode === 'list' ? (
              <ListGoals
                pendingGoals={sortedPendingGoals}
                inProgressGoals={sortedInProgressGoals}
                completedGoals={sortedCompletedGoals}
                onEdit={setEditGoalId}
                onDelete={handleDeleteGoal}
                onToggleStatus={toggleGoalStatus}
                isDeleting={isDeletingGoal}
                deleteVariables={deleteGoalVariables}
              />
            ) : (
              <KanbanGoals
                pendingGoals={sortedPendingGoals}
                inProgressGoals={sortedInProgressGoals}
                completedGoals={sortedCompletedGoals}
                onEdit={setEditGoalId}
                onDelete={handleDeleteGoal}
                onToggleStatus={toggleGoalStatus}
                isDeleting={isDeletingGoal}
                deleteVariables={deleteGoalVariables}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
