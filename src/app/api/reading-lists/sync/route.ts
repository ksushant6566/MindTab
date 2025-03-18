import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

// CORS headers configuration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // You might want to restrict this to specific domains in production
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        let isAuthenticated = false;
        let userId = "";

        // Check for session authentication (for web app users)
        const session = await getServerAuthSession();
        if (session && session.user) {
            isAuthenticated = true;
            userId = session.user.id;
        }

        // Check for API key authentication (for external integrations)
        const apiKey = req.headers.get("x-api-key");
        if (!isAuthenticated && apiKey) {
            // Simple API key validation - in a real app, you'd want to validate against stored keys
            if (
                env.READING_LIST_API_KEY &&
                apiKey === env.READING_LIST_API_KEY
            ) {
                isAuthenticated = true;
                // For API key auth, userId must be provided in the request body
            }
        }

        if (!isAuthenticated) {
            return NextResponse.json(
                { error: "Unauthorized. Please provide valid authentication." },
                { status: 401, headers: corsHeaders }
            );
        }

        // Parse the request body
        const body = await req.json();

        if (!body.userId || !Array.isArray(body.items)) {
            return NextResponse.json(
                {
                    error: "Invalid request format. Required fields: userId, items[]",
                },
                { status: 400, headers: corsHeaders }
            );
        }

        // Use the user ID from the session if available, otherwise use the one from the request
        const effectiveUserId = userId || body.userId;

        // Create tRPC context and caller
        const trpcContext = await createTRPCContext({
            headers: req.headers,
        });

        const caller = createCaller(trpcContext);

        // Call the tRPC procedure
        const result = await caller.readingLists.sync({
            userId: effectiveUserId,
            items: body.items,
        });

        // Return the result with CORS headers
        return NextResponse.json(result, { headers: corsHeaders });
    } catch (error) {
        console.error("Error in reading-lists sync API:", error);

        if (error instanceof TRPCError) {
            return NextResponse.json(
                { error: error.message, code: error.code },
                {
                    status: getStatusFromTRPCError(error.code),
                    headers: corsHeaders,
                }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Helper function to convert TRPC error codes to HTTP status codes
function getStatusFromTRPCError(code: string): number {
    switch (code) {
        case "BAD_REQUEST":
            return 400;
        case "UNAUTHORIZED":
            return 401;
        case "FORBIDDEN":
            return 403;
        case "NOT_FOUND":
            return 404;
        case "TIMEOUT":
            return 408;
        case "CONFLICT":
            return 409;
        case "PRECONDITION_FAILED":
            return 412;
        case "PAYLOAD_TOO_LARGE":
            return 413;
        case "METHOD_NOT_SUPPORTED":
            return 405;
        case "INTERNAL_SERVER_ERROR":
        default:
            return 500;
    }
}
