// app/(Pages)/admin/page.tsx
import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { SearchUsers } from "./SearchUsers";
import { clerkClient } from "@clerk/nextjs/server";
import { AdminUserList } from "./AdminUserList";

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) {
    redirect("/");
  }

  const query = (await params.searchParams).search;
  const client = await clerkClient();
  const usersData = query
    ? (await client.users.getUserList({ query })).data
    : [];

  // Transform Clerk user objects to plain serializable objects with correct typing
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
      role: user.publicMetadata?.role as string | undefined, // Type assertion
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
}
