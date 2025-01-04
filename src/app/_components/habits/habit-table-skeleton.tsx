import React from 'react'
import { Skeleton } from '~/components/ui/skeleton'

export const HabitTableSkeleton = () => {
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