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
                const date = habit.createdAt.toISOString().split('T')[0]!
                groupedByDate.set(date, true)
            }
        }

        let streakCount = 0
        const today = new Date()
        const currentDate = today

        while (true) {
            const dateString = currentDate.toISOString().split('T')[0]!
            if (!groupedByDate.has(dateString)) {
                break
            }
            streakCount++
            currentDate.setDate(currentDate.getDate() - 1)
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
