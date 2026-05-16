// app/admin/page.tsx
import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { SearchUsers } from "./SearchUsers";
import { clerkClient, User } from "@clerk/nextjs/server";
import { AdminUserList } from "./AdminUserList";
import { AlertAdmin, AlertModerator } from "@/components/ui/alertAdmin";
import { Users, ShieldCheck, UserCog } from "lucide-react";

// ─── Helper: Fetch ALL users with pagination ────────────────────────────────
async function fetchAllUsers(): Promise<User[]> {
  const client = await clerkClient();
  const allUsers: User[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await client.users.getUserList({ limit, offset });
    const users = response.data;
    if (users.length === 0) break;
    allUsers.push(...users);
    if (users.length < limit) break;
    offset += limit;
  }
  return allUsers;
}

// ─── Stats summary component ────────────────────────────────────────────────
async function getRoleStats() {
  const allUsers = await fetchAllUsers();
  const admins = allUsers.filter(
    (u) => (u.publicMetadata?.role as string) === "admin",
  ).length;
  const moderators = allUsers.filter(
    (u) => (u.publicMetadata?.role as string) === "moderator",
  ).length;
  const total = allUsers.length;
  return { admins, moderators, total };
}

// ─── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-5 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Page shell ─────────────────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-6xl mx-auto">{children}</div>
    </div>
  );
}

// ─── Page header ────────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
        <ShieldCheck className="w-4 h-4" />
        Admin Portal
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        Dashboard
      </h1>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
        Manage users, roles, and platform permissions
      </p>
    </div>
  );
}

// ─── Role info cards (side‑by‑side) ─────────────────────────────────────────
function RoleInfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <AlertAdmin />
      <AlertModerator />
    </div>
  );
}

// ─── Error card ─────────────────────────────────────────────────────────────
function ErrorCard({ title, message, details, showClerkLink }: any) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 dark:border-red-800/50 p-6 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
      {details && (
        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto mb-4">
          {details}
        </pre>
      )}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
        >
          Retry
        </button>
        {showClerkLink && (
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Open Clerk ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ isSearch }: { isSearch?: boolean }) {
  return (
    <div className="text-center py-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 max-w-md mx-auto">
      <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {isSearch ? "No matching users" : "No admins or moderators"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 px-6">
        {isSearch
          ? "Try a different name or email address."
          : "Assign roles from the Clerk dashboard."}
      </p>
    </div>
  );
}

// ─── Main page component ────────────────────────────────────────────────────
export default async function AdminDashboard(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) redirect("/");

  const query = (await props.searchParams).search;
  let usersToDisplay: User[] = [];
  let stats = { admins: 0, moderators: 0, total: 0 };

  try {
    const client = await clerkClient();
    if (query) {
      const result = await client.users.getUserList({ query });
      usersToDisplay = result.data;
    } else {
      const allUsers = await fetchAllUsers();
      usersToDisplay = allUsers.filter((user) => {
        const role = user.publicMetadata?.role as string;
        return role === "admin" || role === "moderator";
      });
      stats = await getRoleStats();
    }
  } catch (err: any) {
    return (
      <PageShell>
        <PageHeader />
        <ErrorCard
          title="Clerk API Error"
          message="Unable to fetch user data. Check your Clerk configuration."
          details={err?.message}
          showClerkLink
        />
        <div className="mt-6 flex justify-center">
          <SearchUsers />
        </div>
      </PageShell>
    );
  }

  // Transform users for AdminUserList
  const users = usersToDisplay.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map((e) => ({
      id: e.id,
      emailAddress: e.emailAddress,
    })),
    primaryEmailAddressId: user.primaryEmailAddressId,
    publicMetadata: { role: user.publicMetadata?.role as string | undefined },
    imageUrl: user.imageUrl,
  }));

  return (
    <PageShell>
      <PageHeader />

      {/* Role info cards */}
      <RoleInfoCards />

      {/* Search bar */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-md">
          <SearchUsers />
        </div>
      </div>

      {/* User list or empty state */}
      {users.length > 0 ? (
        <AdminUserList users={users} />
      ) : query ? (
        <EmptyState isSearch />
      ) : (
        <EmptyState isSearch={false} />
      )}
    </PageShell>
  );
}
