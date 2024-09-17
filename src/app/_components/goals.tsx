'use client'

import { Edit3, Flag, Loader2, Plus, Trash2, Zap } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { goalTypeEnum, goals } from '~/server/db/schema'
import { api } from '~/trpc/react'

import { CheckedState } from '@radix-ui/react-checkbox'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { CreateGoal } from './create-goal'
import { EditGoal } from './edit-goal'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Label } from '~/components/ui/label'

import { InferSelectModel } from 'drizzle-orm'

const priorityColors = {
  priority_1: 'red',
  priority_2: 'yellow',
  priority_3: 'green',
  priority_4: 'white',
}

const ZInsertGoal = createInsertSchema(goals).omit({ userId: true })

type TGoal = InferSelectModel<typeof goals>

type TGoalProps = {
  goal: TGoal
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, checked: CheckedState) => void
  isUpdating: boolean
  isDeleting: boolean
  updateVariables?: { id: string }
  deleteVariables?: { id: string }
}

const Goal: React.FC<TGoalProps> = ({ 
  goal, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isUpdating, 
  isDeleting, 
  updateVariables, 
  deleteVariables 
}) => {
  return (
    <div className="group relative flex items-start gap-3">
      {isUpdating && goal.id === updateVariables?.id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Checkbox
          id={goal.id}
          className="h-4 w-4 rounded-full mt-0.5"
          checked={goal.status === 'completed'}
          onCheckedChange={(checked) => onToggleStatus(goal.id, checked)}
        />
      )}
      <div className="flex flex-col gap-1 max-w-full">
        <Label
          htmlFor={goal.id}
          className={`text-sm font-medium ${goal.status === 'completed' ? 'line-through' : ''}`}
        >
          {goal.title}
        </Label>
        {goal.description && (
          <p className={`text-sm text-muted-foreground ${goal.status === 'completed' ? 'line-through' : ''}`}>
            {goal.description}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-muted-foreground">
            <Flag
              className="h-3 w-3"
              color={priorityColors[goal.priority]}
              fill={priorityColors[goal.priority]}
            />
            P{goal.priority.split('_')[1]}
          </span>
          <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-muted-foreground text-yellow-300">
            <Zap className="mr-1 h-3 w-3" color={'gold'} fill={'gold'} />
            {goal.impact}
          </span>
          <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-green-300">
            {goal.category}
          </span>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 flex z-10 -translate-y-6 gap-0 opacity-0 transition-all group-hover:translate-y-1 group-hover:opacity-100">
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
  )
}

const Clock = () => {
  return (
    <div className="flex flex-col gap-1">
          <h1 className="text-6xl font-thin">
            {new Date().toLocaleTimeString('en-IN', {
              minute: 'numeric',
              hour: 'numeric',
              hour12: false,
            })}
          </h1>
          <h1 className="text-xl font-medium">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h1>
        </div>
  )
}

export const Goals: React.FC = () => {
  const { data: goals, isLoading, refetch } = api.goals.getAll.useQuery()
  const { mutate: createGoal, isPending: isCreatingGoal } = api.goals.create.useMutation({
    onSuccess: () => refetch()
  })
  const { mutate: updateGoal, isPending: isUpdatingGoal, variables: updateGoalVariables } = api.goals.update.useMutation({
    onSuccess: () => refetch()
  })
  const { mutate: deleteGoal, isPending: isDeletingGoal, variables: deleteGoalVariables } = api.goals.delete.useMutation({
    onSuccess: () => refetch()
  })

  const [selectedGoalType, setSelectedGoalType] = useState<(typeof goalTypeEnum.enumValues)[number]>('daily')
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [editGoalId, setEditGoalId] = useState<string | null>(null)

  const onCreateGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    createGoal(goal)
    setIsCreateGoalOpen(false)
  }

  const onCancelCreateGoal = () => setIsCreateGoalOpen(false)

  const toggleGoalStatus = (goalId: string, checked: CheckedState) => {
    updateGoal({
      id: goalId,
      status: checked ? 'completed' : 'pending',
    })
  }

  const handleDeleteGoal = (goalId: string) => deleteGoal({ id: goalId })

  const onSaveEditGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    if (!editGoalId) return
    updateGoal({ ...goal, id: editGoalId })
    setEditGoalId(null)
  }

  const onCancelEditGoal = () => setEditGoalId(null)

  return (
    <div className="space-y-4">
      <Clock />
      <div className="flex flex-col space-y-4">
        <div className="flex flex-row-reverse justify-end gap-2">
          {['yearly', 'monthly', 'weekly', 'daily'].map((type) => (
            <Button
              key={type}
              size="sm"
              className="w-16 text-xs h-8"
              variant={selectedGoalType === type ? 'default' : 'secondary'}
              onClick={() => setSelectedGoalType(type as typeof selectedGoalType)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="flex items-center justify-start">
            <Loader2 className="mb-4 ml-8 h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 pr-4">
            {isCreateGoalOpen ? (
              <CreateGoal onSave={onCreateGoal} onCancel={onCancelCreateGoal} />
            ) : (
              <div className="-mb-2 -ml-2 flex justify-start">
                <Button
                  onClick={() => setIsCreateGoalOpen(true)}
                  disabled={isCreatingGoal}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-sm font-normal"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </Button>
              </div>
            )}
            <ScrollArea className="h-[calc(100vh-20rem)] overflow-y-auto">
              <div className="flex flex-col gap-6 pr-4">
              {goals
                ?.filter((goal) => goal.type === selectedGoalType)
                .map((goal) => (
                  <div key={goal.id}>
                    {editGoalId === goal.id ? (
                      <EditGoal goal={goal} onSave={onSaveEditGoal} onCancel={onCancelEditGoal} />
                    ) : (
                      <Goal
                        goal={goal}
                        onEdit={setEditGoalId}
                        onDelete={handleDeleteGoal}
                        onToggleStatus={toggleGoalStatus}
                        isUpdating={isUpdatingGoal}
                        isDeleting={isDeletingGoal}
                        updateVariables={updateGoalVariables}
                        deleteVariables={deleteGoalVariables}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
