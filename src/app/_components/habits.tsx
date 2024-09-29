'use client'

import React from 'react'
import { api } from '~/trpc/react'
import { HabitTable } from './habit-table'

export const Habits: React.FC = () => {

  const apiUtils = api.useUtils()

  const { data: habits, refetch: refetchHabits } = api.habits.getAll.useQuery()
  const {
    mutate: deleteHabit,
    isPending: isDeletingHabit,
    variables: deleteHabitVariables,
  } = api.habits.delete.useMutation({
    onSuccess: () => {
      refetchHabits()
    },
  })

  const { mutate: createHabit, isPending: isCreatingHabit } = api.habits.create.useMutation({
    onSuccess: () => {
      refetchHabits()
    },
  })

  const { mutate: updateHabit, isPending: isUpdatingHabit } = api.habits.update.useMutation({
    onSuccess: () => {
      refetchHabits()
    },
  })

  const { data: habitTracker, refetch: refetchHabitTracker } = api.habitTracker.getAll.useQuery()

  const { mutate: trackHabit } = api.habits.trackHabit.useMutation({
    async onMutate(variables) {
      // cancel any existing requests to avoid conflicts
      await apiUtils.habitTracker.getAll.cancel()

      // store the previous value of habitTracker
      const previousHabitTracker = apiUtils.habitTracker.getAll.getData() ?? []

      // set the new value of habitTracker
      apiUtils.habitTracker.getAll.setData(undefined, [
        ...previousHabitTracker,
        {
          habitId: variables.habitId,
          // return date in the format YYYY-MM-DD
          date: variables.date.toISOString().split('T')[0]!,
          status: "completed",
          id: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "1",
        }
      ])

      // return the previous value of habitTracker, this is used to revert the mutation in case of an error
      return { previousHabitTracker }
    },

    onError(error, variables, context) {
      apiUtils.habitTracker.getAll.setData(undefined, context?.previousHabitTracker ?? [])
    },

    onSettled() {
      apiUtils.habitTracker.getAll.invalidate()
    },
  })

  const { mutate: untrackHabit } = api.habits.untrackHabit.useMutation({
    async onMutate(variables) {
      // cancel any existing requests to avoid conflicts
      await apiUtils.habitTracker.getAll.cancel()

      // store the previous value of habitTracker
      const previousHabitTracker = apiUtils.habitTracker.getAll.getData() ?? []

      // set the new value of habitTracker
      apiUtils.habitTracker.getAll.setData(undefined,
        previousHabitTracker.filter(habit => !(habit.habitId === variables.habitId && habit.date === variables.date.toISOString().split('T')[0]!))
      )

      // return the previous value of habitTracker, this is used to revert the mutation in case of an error
      return { previousHabitTracker }
    },

    onError(error, variables, context) {
      apiUtils.habitTracker.getAll.setData(undefined, context?.previousHabitTracker ?? [])
    },

    onSettled() {
      apiUtils.habitTracker.getAll.invalidate()
    },
  })

  return (
    <div className="flex justify-center items-center relative">
      <HabitTable
        habits={habits ?? []}
        isCreatingHabit={isCreatingHabit}
        isUpdatingHabit={isUpdatingHabit}
        isDeletingHabit={isDeletingHabit}
        deleteHabitVariables={deleteHabitVariables}
        createHabit={createHabit}
        updateHabit={updateHabit}
        deleteHabit={deleteHabit}
        trackHabit={trackHabit}
        untrackHabit={untrackHabit}
        habitTracker={habitTracker ?? []}
      />
    </div>
  )
}
