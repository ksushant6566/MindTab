import Image from "next/image";
import { api } from "~/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import { UserNotFound } from "../_components/user-not-found";
import { CalendarDays, Mail, Clock } from "lucide-react";
import { format } from "date-fns";
import { ActivityChart } from "../_components/activity-chart";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export default async function ProfilePage({
    params,
}: {
    params: { user: string };
}) {
    // Decode the email from URL
    const decodedEmail = decodeURIComponent(params.user);

    // Get user data
    const users = await api.users.getByEmail({ email: decodedEmail });
    const user = users[0];

    if (!user) {
        return <UserNotFound email={decodedEmail} />;
    }

    // Get habits data
    const habitTracker = await api.habitTracker.getAll();
    const habits = await api.habits.getAll();

    // Get goals data
    const goals = await api.goals.getAll();
    const completedGoals = goals.filter((goal: RouterOutputs["goals"]["getAll"][number]) => goal.status === "completed");

    // Calculate habit statistics
    const habitCounts = habitTracker.reduce((acc: Record<string, number>, track: RouterOutputs["habitTracker"]["getAll"][number]) => {
        acc[track.habitId] = (acc[track.habitId] || 0) + 1;
        return acc;
    }, {});

    const [topHabitEntry] = Object.entries(habitCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
    const topHabitId = topHabitEntry?.[0];
    const topHabit = habits.find((h: RouterOutputs["habits"]["getAll"][number]) => h.id === topHabitId);

    // Get activity data
    const activities = await api.activity.getUserActivity({ userId: user.id });

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col gap-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative h-40 w-40 overflow-hidden rounded-full ring-2 ring-primary/20">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name ?? "Profile picture"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted text-5xl font-bold text-muted-foreground">
                                {user.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                        )}
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold">{user.name ?? "Anonymous User"}</h1>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Member Since</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        {user.emailVerified && (
                            <div className="flex items-center gap-4">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email Verified</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(user.emailVerified), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Goals Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{completedGoals.length}</p>
                            <p className="text-sm text-muted-foreground">
                                Out of {goals.length} total goals
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Habit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-medium">{topHabit?.title ?? "No habits yet"}</p>
                            {topHabit && (
                                <p className="text-sm text-muted-foreground">
                                    Completed {habitCounts[topHabit.id]} times
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Chart */}
                    <ActivityChart activities={activities} />
            </div>
        </div>
    );
}
