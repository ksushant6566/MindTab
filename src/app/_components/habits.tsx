'use client'

import React from 'react'
import { api } from '~/trpc/react'
import { HabitTable } from './habit-table'

export const Habits: React.FC = () => {

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
    onSuccess: () => {
      refetchHabitTracker()
    },
  })

  const { mutate: untrackHabit } = api.habits.untrackHabit.useMutation({
    onSuccess: () => {
      refetchHabitTracker()
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
