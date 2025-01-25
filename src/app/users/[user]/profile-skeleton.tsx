import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const ProfileSkeleton = () => {
    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-6">
                {/* Profile Header Skeleton */}
                <div className="flex flex-col items-center gap-6">
                    <Skeleton className="h-40 w-40 rounded-full" />
                    <div className="text-center space-y-2">
                        <Skeleton className="h-10 w-48 mx-auto" />
                        <Skeleton className="h-6 w-32 mx-auto" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Account Info Skeleton */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-5 w-5" />
                                <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32 mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Streak Skeleton */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Streak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics Skeleton */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Goals Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-32 mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Habit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Chart Skeleton */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[160px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}