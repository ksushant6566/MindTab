"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function TestReadingSync() {
    const [userId, setUserId] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const syncMutation = api.readingLists.sync.useMutation({
        onSuccess: (data) => {
            setResponse(JSON.stringify(data, null, 2));
            setIsLoading(false);
        },
        onError: (error) => {
            setResponse(`Error: ${error.message}`);
            setIsLoading(false);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResponse(null);

        // Sample reading list items
        const sampleItems = [
            {
                title: "The Future of Web Development",
                url: "https://example.com/articles/future-web-dev",
                source: "Example Blog",
                description:
                    "An article about emerging trends in web development",
                tags: ["web", "development", "tech"],
                dateAdded: new Date().toISOString(),
            },
            {
                title: "Understanding TypeScript Generics",
                url: "https://example.com/tutorials/typescript-generics",
                source: "TypeScript Docs",
                tags: ["typescript", "programming"],
                dateAdded: new Date().toISOString(),
            },
        ];

        syncMutation.mutate({
            userId,
            items: sampleItems,
        });
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-6 text-2xl font-bold">
                Test Reading List Sync API
            </h1>

            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-4">
                    <label htmlFor="userId" className="mb-2 block font-medium">
                        User ID:
                    </label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Enter user ID"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
                >
                    {isLoading ? "Syncing..." : "Test Sync"}
                </button>
            </form>

            {response && (
                <div className="rounded-md bg-gray-100 p-4">
                    <h2 className="mb-2 text-lg font-semibold">Response:</h2>
                    <pre className="whitespace-pre-wrap text-sm">
                        {response}
                    </pre>
                </div>
            )}
        </div>
    );
}
