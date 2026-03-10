import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { SearchUsers } from "./SearchUsers";
import { clerkClient, User } from "@clerk/nextjs/server"; // ✅ Import User type
import { AdminUserList } from "./AdminUserList";

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  // Check admin role first
  if (!checkRole("admin")) {
    redirect("/");
  }

  try {
    const query = (await params.searchParams).search;
    console.log("🔍 AdminDashboard - Search query:", query);

    const client = await clerkClient();
    console.log("✅ Clerk client initialized");

    // Fetch users with detailed error handling
    let usersData: User[] = []; // ✅ Add type annotation here

    if (query) {
      console.log("🔍 Attempting to search users with query:", query);

      try {
        // Log the exact API call being made
        console.log("📡 Calling clerkClient.users.getUserList with:", {
          query,
        });

        const result = await client.users.getUserList({ query });

        console.log("✅ Clerk API response received");
        console.log("📊 Number of users found:", result.data.length);

        usersData = result.data;
      } catch (clerkError: any) {
        // Detailed Clerk error logging
        console.error("❌ Clerk API Error Details:");
        console.error("Error name:", clerkError.name);
        console.error("Error message:", clerkError.message);
        console.error("Error status:", clerkError.status);
        console.error("Error code:", clerkError.code);
        console.error("Clerk error type:", clerkError.clerkError);

        // Log the full error object
        console.error(
          "Full error object:",
          JSON.stringify(clerkError, null, 2),
        );

        // Check if it's a specific Clerk error
        if (clerkError.errors && clerkError.errors.length > 0) {
          console.error("First error detail:", clerkError.errors[0]);
        }

        // Return user-friendly error page
        return (
          <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
              <h2 className="text-xl font-bold text-red-700 mb-4">
                Clerk API Error
              </h2>
              <p className="text-red-600 mb-2">
                Failed to fetch users from Clerk
              </p>
              <p className="text-gray-700 mb-4">
                Error: {clerkError.message || "Unknown error"}
              </p>

              {clerkError.status && (
                <p className="text-gray-600 mb-2">
                  Status: {clerkError.status}
                </p>
              )}

              <div className="bg-white p-4 rounded mt-4">
                <p className="font-semibold mb-2">Troubleshooting steps:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Check if your Clerk secret key is valid</li>
                  <li>Verify the user exists in Clerk dashboard</li>
                  <li>Check Clerk API rate limits</li>
                  <li>Ensure your Clerk instance is active</li>
                </ul>
              </div>
            </div>

            <SearchUsers />
          </div>
        );
      }
    }

    // Transform Clerk user objects to plain serializable objects
    const users = usersData.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses.map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
      })),
      primaryEmailAddressId: user.primaryEmailAddressId,
      publicMetadata: {
        role: user.publicMetadata?.role as string | undefined,
      },
      imageUrl: user.imageUrl,
    }));

    return (
      <>
        <p className="mb-4">
          This is the protected admin dashboard restricted to users with the
          `admin` Role.
        </p>

        <SearchUsers />

        <AdminUserList users={users} />
      </>
    );
  } catch (error: any) {
    console.error("💥 Admin dashboard unexpected error:", error);
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Unexpected Error
        </h2>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <pre className="text-left bg-gray-100 p-4 rounded overflow-auto max-w-2xl mx-auto">
          {error?.message || String(error)}
        </pre>
      </div>
    );
  }
}
