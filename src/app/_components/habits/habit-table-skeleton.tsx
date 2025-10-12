import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

type ViewMode = "table" | "cards";

type HabitTableSkeletonProps = {
    viewMode?: ViewMode;
};

export const HabitTableSkeleton = ({
    viewMode = "table",
}: HabitTableSkeletonProps) => {
    if (viewMode === "cards") {
        return (
            <div className="flex flex-col gap-4 pr-4">
                {/* Add Habit Button Skeleton */}
                <div className="flex justify-end mb-4">
                    <Skeleton className="h-9 w-28" />
                </div>

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 auto-cols-fr gap-4 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-lg border p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-5 rounded-sm" />
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: 7 }).map((_, idx) => (
                                    <Skeleton
                                        key={idx}
                                        className="h-6 w-6 rounded-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Table view skeleton
    return (
        <div className="flex flex-col gap-16 w-full max-h-[80vh] overflow-y-hidden">
            {Array.from({ length: 2 }).map((_, index) => (
                <div className="flex flex-col gap-12 w-full py-3" key={index}>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-44 h-10" />
                        <Skeleton className="w-44 h-4" />
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex gap-6 justify-start items-center">
                                    <Skeleton className="w-28 h-11" />
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: 7 }).map(
                                            (_, index) => (
                                                <Skeleton
                                                    key={index}
                                                    className="w-14 h-12"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
 