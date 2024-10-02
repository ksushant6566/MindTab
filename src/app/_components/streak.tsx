'use client'

import { useCallback, useMemo } from 'react'
import { api } from "~/trpc/react"

export default function Streak() {
    const { data: habitTracker } = api.habitTracker.getAll.useQuery(undefined, {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })

    const getStreak = useCallback(() => {
        if (!habitTracker) return 0

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
    }, [habitTracker])

    const streak = useMemo(() => {
        return getStreak()
    }, [habitTracker])

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium">{streak} days streak</p>
            </div>
        </div>
    )
}
