'use client'

import React from 'react'
import { api } from '~/trpc/react'
import { HabitTable } from './habit-table'
import { Skeleton } from '~/components/ui/skeleton'

const HabitTableSkeleton = () => {
  return (
    <div className="flex flex-col gap-16 w-full max-h-[80vh] overflow-y-hidden">
      {
        Array.from({ length: 2 }).map((_, index) => (
          <div className="flex flex-col gap-12 w-full py-3" key={index}>
            <div className="flex flex-col gap-2">
              <Skeleton className="w-44 h-10" />
              <Skeleton className="w-44 h-4" />
            </div>
            <div className="flex flex-col gap-1.5 pl-2">
              {
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="flex gap-6 justify-start items-center">
                      <Skeleton className="w-28 h-11" />
                      <div className="flex gap-1.5">
                        {
                          Array.from({ length: 7 }).map((_, index) => (
                            <Skeleton key={index} className="w-14 h-12" />
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))
      }
    </div>
  )
}

export const Habits: React.FC = () => {

  const apiUtils = api.useUtils()

  const { data: habits, refetch: refetchHabits, isFetching: isFetchingHabits } = api.habits.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const {
    mutate: deleteHabit,
    isPending: isDeletingHabit,
    variables: deleteHabitVariables,
  } = api.habits.delete.useMutation({
    async onMutate(variables) {
      await apiUtils.habits.getAll.cancel()
      const previousHabits = apiUtils.habits.getAll.getData() ?? []

      apiUtils.habits.getAll.setData(undefined, previousHabits.filter(habit => habit.id !== variables.id))
      return { previousHabits }
    },
    onError(error, variables, context) {
      apiUtils.habits.getAll.setData(undefined, context?.previousHabits ?? [])
    },
    onSettled() {
      apiUtils.habits.getAll.invalidate()
    },
  })

  const { mutate: createHabit, isPending: isCreatingHabit } = api.habits.create.useMutation({
    async onMutate(variables) {
      await apiUtils.habits.getAll.cancel()
      const previousHabits = apiUtils.habits.getAll.getData() ?? []

      const newHabit = {
        ...variables,
        id: '1',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any

      apiUtils.habits.getAll.setData(undefined, [...previousHabits, newHabit])
      return { previousHabits }
    },
    onError(error, variables, context) {
      apiUtils.habits.getAll.setData(undefined, context?.previousHabits ?? [])
    },
    onSettled() {
      apiUtils.habits.getAll.invalidate()
    },
  })

  const { mutate: updateHabit, isPending: isUpdatingHabit } = api.habits.update.useMutation({
    onSettled() {
      apiUtils.habits.getAll.invalidate()
    },
  })

  const { data: habitTracker } = api.habitTracker.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

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
          date: variables.date,
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
        previousHabitTracker.filter(habit => !(habit.habitId === variables.habitId && habit.date === variables.date))
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
      {
        isFetchingHabits ? <HabitTableSkeleton /> :
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
      }
    </div>
  )
}