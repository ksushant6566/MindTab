import React from 'react'
import { CheckedState } from '@radix-ui/react-checkbox'
import { Trash2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { TableRow, TableCell } from '~/components/ui/table'
import { EditHabit } from './edit-habit'
import { InferSelectModel } from 'drizzle-orm'
import { ZInsertHabit } from './habit-table'
import { HabitCell } from './habit-cell'

type THabit = InferSelectModel<typeof import('~/server/db/schema').habits>
type THabitTracker = InferSelectModel<typeof import('~/server/db/schema').habitTracker>

type HabitRowProps = {
    habit: THabit
    weekIndex: number
    currentWeek: number
    currentDay: number
    isEditing: boolean
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onSaveEdit: (habit: z.infer<typeof ZInsertHabit>) => void
    isUpdating: boolean
    isDeleting: boolean
    deleteVariables: { id: string } | undefined
    habitTracker: THabitTracker[]
    onTrack: (habit: { habitId: string, date: string }) => void
    onUntrack: (habit: { habitId: string, date: string }) => void
    getDate: (week: number, day: number) => string
}

export const HabitRow: React.FC<HabitRowProps> = React.memo(({
    habit,
    weekIndex,
    currentWeek,
    currentDay,
    isEditing,
    onEdit,
    onDelete,
    onSaveEdit,
    isUpdating,
    isDeleting,
    deleteVariables,
    habitTracker,
    onTrack,
    onUntrack,
    getDate,
}) => {
    const onCheckedChange = (checked: CheckedState, date: string) => {
        if (checked) {
            onTrack({ habitId: habit.id, date })
        } else {
            onUntrack({ habitId: habit.id, date })
        }
    }

    return (
        <>
            {isEditing ? (
                <TableRow className="border-none hover:bg-transparent group">
                    <TableCell colSpan={8}>
                        {isUpdating ? (
                            <div className="flex gap-2 m-0 p-0">
                                <Skeleton className="h-11 w-[25%]" />
                                <Skeleton className="h-11 w-full" />
                            </div>
                        ) : (
                            <EditHabit
                                habit={habit}
                                onSave={onSaveEdit}
                                onCancel={() => onEdit('')}
                            />
                        )}
                    </TableCell>
                </TableRow>
            ) : (
                <TableRow className="border-none hover:bg-transparent group">
                    <TableCell className="font-medium overflow-hidden text-ellipsis text-nowrap">
                        {habit.title}
                    </TableCell>
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                        const date = getDate(weekIndex, dayIndex)
                        const isCurrentWeek = weekIndex === currentWeek
                        const isToday = dayIndex + 1 === currentDay
                        const isEditable = isCurrentWeek && isToday

                        const isChecked = habitTracker.some(
                            (tracker) =>
                                tracker.habitId === habit.id &&
                                tracker.status === 'completed' &&
                                tracker.date === date,
                        )

                        return (
                            <TableCell key={`${habit.id}-${dayIndex}`} className='text-center p-0 px-1 w-8 h-9'>
                                <HabitCell
                                    habit={habit}
                                    date={date}
                                    isEditable={isEditable}
                                    isChecked={isChecked}
                                    onCheckedChange={onCheckedChange}
                                />
                            </TableCell>
                        )
                    })}
                    <TableCell className="relative p-0" colSpan={1}>
                        <div className="flex absolute gap-0 group-hover:visible left-2 -top-4 group-hover:top-2 group-hover:opacity-100 invisible transition-all opacity-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                className=" hover:bg-red-900 active:bg-red-900"
                                onClick={() => onDelete(habit.id)}
                                disabled={isDeleting && deleteVariables?.id === habit.id}
                                loading={isDeleting && deleteVariables?.id === habit.id}
                                hideContentWhenLoading
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
})
