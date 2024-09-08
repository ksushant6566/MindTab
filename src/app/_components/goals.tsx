'use client'

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Flag,
  Loader2,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { goalTypeEnum } from '~/server/db/schema'
import { api } from '~/trpc/react'

import { CheckedState } from '@radix-ui/react-checkbox'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { goals } from '~/server/db/schema'
import { CreateGoal } from './create-goal'
import { EditGoal } from './edit-goal'

const priorityColors = {
  priority_1: 'red',
  priority_2: 'yellow',
  priority_3: 'green',
  priority_4: 'white',
}

const ZInsertGoal = createInsertSchema(goals).omit({ userId: true })

export const Goals: React.FC = () => {
  const { data: goals, isLoading, refetch } = api.goals.getAll.useQuery()
  const { mutate: createGoal, isPending: isCreatingGoal } =
    api.goals.create.useMutation({
      onSuccess: () => {
        refetch()
      },
    })
  const {
    mutate: updateGoal,
    isPending: isUpdatingGoal,
    variables: updateGoalVariables,
  } = api.goals.update.useMutation({
    onSuccess: () => {
      refetch()
    },
  })
  const {
    mutate: deleteGoal,
    isPending: isDeletingGoal,
    variables: deleteGoalVariables,
  } = api.goals.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const [selectedGoalType, setSelectedGoalType] =
    useState<(typeof goalTypeEnum.enumValues)[number]>('daily')

  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [editGoalId, setEditGoalId] = useState<string | null>(null)

  const onCreateGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    createGoal(goal)
    setIsCreateGoalOpen(false)
  }

  const onCancelCreateGoal = () => {
    setIsCreateGoalOpen(false)
  }

  const toggleGoalStatus = (goalId: string, checked: CheckedState) => {
    updateGoal({
      id: goalId,
      status: checked ? 'completed' : 'pending',
    })
  }

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal({ id: goalId })
  }

  const onSaveEditGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    if (!editGoalId) return

    updateGoal({ ...goal, id: editGoalId })
    setEditGoalId(null)
  }

  const onCancelEditGoal = () => {
    setEditGoalId(null)
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-col space-y-4">
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

        <div className="flex flex-row-reverse justify-end gap-2">
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === 'yearly' ? 'default' : 'secondary'}
            onClick={() => setSelectedGoalType('yearly')}
          >
            Yearly
          </Button>
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === 'monthly' ? 'default' : 'secondary'}
            onClick={() => setSelectedGoalType('monthly')}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === 'weekly' ? 'default' : 'secondary'}
            onClick={() => setSelectedGoalType('weekly')}
          >
            Weekly
          </Button>
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === 'daily' ? 'default' : 'secondary'}
            onClick={() => setSelectedGoalType('daily')}
          >
            Daily
          </Button>
        </div>
      </div>
      <div className="">
        {isLoading ? (
          <div className="flex items-center justify-start">
            <Loader2 className="mb-4 ml-8 h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 pr-4">
            {isCreateGoalOpen ? (
              <CreateGoal
                onSave={onCreateGoal}
                onCancel={onCancelCreateGoal}
                // defaultValues={}
              />
            ) : (
              <div className="-mb-2 -ml-2 flex justify-start">
                <Button
                  onClick={() => setIsCreateGoalOpen(true)}
                  disabled={isCreatingGoal}
                  variant="ghost"
                  size={'sm'}
                  className="flex items-center gap-2 text-sm font-normal"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </Button>
              </div>
            )}
            {goals?.map((goal, i) =>
              editGoalId === goal.id ? (
                <EditGoal
                  key={goal.id}
                  goal={goal}
                  onSave={onSaveEditGoal}
                  onCancel={onCancelEditGoal}
                />
              ) : (
                <div
                  key={goal.id}
                  className="group flex justify-between gap-2 py-3"
                >
                  <div className="flex items-start gap-3">
                    {isUpdatingGoal && goal.id === updateGoalVariables?.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Checkbox
                        id={goal.id}
                        className="h-4 w-4 rounded-full"
                        checked={goal.status === 'completed'}
                        onCheckedChange={(checked) =>
                          toggleGoalStatus(goal.id, checked)
                        }
                      />
                    )}
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={goal.id}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${goal.status === 'completed' ? 'line-through' : ''}`}
                      >
                        {goal.title}
                      </label>
                      {goal.description && (
                        <p
                          className={`text-sm text-muted-foreground ${
                            goal.status === 'completed' ? 'line-through' : ''
                          } `}
                        >
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
                          <Zap
                            className="mr-1 h-3 w-3"
                            color={'gold'}
                            fill={'gold'}
                          />
                          {goal.impact}
                        </span>
                        <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-green-300">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex -translate-y-6 gap-0 opacity-0 transition-all group-hover:-translate-y-1 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditGoalId(goal.id)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-red-900 active:bg-red-900"
                      onClick={() => handleDeleteGoal(goal.id)}
                      disabled={
                        isDeletingGoal && deleteGoalVariables?.id === goal.id
                      }
                      loading={
                        isDeletingGoal && deleteGoalVariables?.id === goal.id
                      }
                      hideContentWhenLoading
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 flex h-16 w-full flex-col gap-2 backdrop-blur-sm backdrop-brightness-75" />
    </div>
  )
}
