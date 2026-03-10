import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const testQuery = searchParams.get('query') || '';

        console.log("🧪 Testing Clerk connection...");
        console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);
        console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists:", !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

        const client = await clerkClient();

        // Test 1: Get user count
        console.log("📊 Fetching user list...");
        const allUsers = await client.users.getUserList({ limit: 1 });
        console.log("✅ User list fetched, total count:", allUsers.totalCount);

        // Test 2: Search if query provided
        let searchResult = null;
        if (testQuery) {
            console.log("🔍 Testing search with query:", testQuery);
            searchResult = await client.users.getUserList({ query: testQuery });
            console.log("✅ Search completed, found:", searchResult.data.length);
        }

        return NextResponse.json({
            success: true,
            message: 'Clerk connection successful',
            diagnostics: {
                hasSecretKey: !!process.env.CLERK_SECRET_KEY,
                hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
                totalUsers: allUsers.totalCount,
                searchQuery: testQuery,
                searchResults: searchResult?.data.length || 0,
            }
        });

    } catch (error: any) {
        console.error("❌ Clerk test failed:", error);

        return NextResponse.json({
            success: false,
            error: {
                name: error.name,
                message: error.message,
                status: error.status,
                code: error.code,
                clerkError: error.clerkError,
                errors: error.errors,
            }
        }, { status: 500 });
    }
}