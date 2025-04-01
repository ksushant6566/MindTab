import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "~/server/auth";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// CORS headers configuration
const corsHeaders = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-api-key, x-session-token",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin":
        "chrome-extension://ioghanojfdpcgppjahfaekciojfiddbm",
};

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        let isAuthenticated = false;
        let userId = "";

        // Check for API key authentication (for external integrations)
        const sessionToken = req.headers.get("x-session-token");
        if (!isAuthenticated && sessionToken) {
            // get user id from session token
            const session = await db.query.sessions.findFirst({
                where: eq(sessions.sessionToken, sessionToken),
            });
            if (session) {
                isAuthenticated = true;
                userId = session.userId;
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

        // Create tRPC context and caller
        const trpcContext = await createTRPCContext({
            headers: req.headers,
        });
        const caller = createCaller(trpcContext);

        // Call the tRPC procedure
        const result = await caller.readingLists.sync({
            userId: userId,
            items: body.items,
            metadata: body.metadata,
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
