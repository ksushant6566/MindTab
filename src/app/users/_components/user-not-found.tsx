'use client';

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { UserX, Home } from "lucide-react";

export function UserNotFound({ email }: { email: string }) {
    return (
        <div className="container mx-auto py-16">
            <div className="flex flex-col items-center gap-8 text-center">
                <div className="rounded-full bg-muted p-8">
                    <UserX className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">User Not Found</h1>
                    <p className="text-xl text-muted-foreground">
                        We couldn't find a user with the email:
                    </p>
                    <p className="text-lg font-medium">{email}</p>
                </div>
                <Button asChild variant="outline" size="lg" className="mt-4 gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    );
} 