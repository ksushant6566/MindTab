import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { habitTracker } from '~/server/db/schema'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type THabitTracker = typeof habitTracker.$inferSelect

export const getStreak = (habitTracker: THabitTracker[]) => {
  if (!habitTracker) {
    return 0
  }

  const groupedByDate = new Map<string, boolean>()

  for (let i = habitTracker.length - 1; i >= 0; i--) {
    const habit = habitTracker[i]!
    if (habit.status === 'completed') {
      const date = habit.date

      groupedByDate.set(date, true)
    }
  }

  let streakCount = 0
  const today = new Date()

  // start from yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const currentDate = yesterday

  while (true) {
    const dateString = currentDate.toLocaleDateString().split('/').reverse().join('-')
    if (!groupedByDate.has(dateString)) {
      break
    }
    streakCount++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  if (groupedByDate.has(today.toLocaleDateString().split('/').reverse().join('-'))) {
    streakCount++
  }

  return streakCount
}