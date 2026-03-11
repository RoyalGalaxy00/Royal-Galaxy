import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import { SearchUsers } from "./SearchUsers";
import { clerkClient, User } from "@clerk/nextjs/server";
import { AdminUserList } from "./AdminUserList";

// ─── Reusable layout shell ────────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-5xl mx-auto">{children}</div>
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Admin Dashboard
      </h1>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Manage users and roles with administrative privileges
      </p>
    </div>
  );
}

// ─── Error card ───────────────────────────────────────────────────────────────
function ErrorCard({
  title,
  message,
  accentClass,
  details,
  showClerkLink,
}: {
  title: string;
  message: string;
  accentClass: string;
  details?: string;
  showClerkLink?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      <div
        className={`${accentClass} px-6 py-4 flex items-center justify-center gap-3`}
      >
        <svg
          className="w-5 h-5 text-white flex-shrink-0"
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
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <div className="p-6 space-y-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>

        {details && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {details}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <a
            href=""
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            Retry
          </a>
          {showClerkLink ? (
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Open Clerk Dashboard ↗
            </a>
          ) : (
            <a
              href="/"
              className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Go to Home
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex justify-center">
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-sm w-full">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          No users found
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 px-6">
          Try adjusting your search query.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) redirect("/");

  const query = (await params.searchParams).search;

  let usersData: User[] = [];

  if (query) {
    try {
      const client = await clerkClient();
      const result = await client.users.getUserList({ query });
      usersData = result.data;
    } catch (err: any) {
      return (
        <PageShell>
          <PageHeader />
          <ErrorCard
            title="Clerk API Error"
            message="Could not fetch users. This is usually a configuration or network issue."
            accentClass="bg-gradient-to-r from-red-500 to-red-600"
            details={err?.message}
            showClerkLink
          />
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-md">
              <SearchUsers />
            </div>
          </div>
        </PageShell>
      );
    }
  }

  const users = usersData.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses.map((e) => ({
      id: e.id,
      emailAddress: e.emailAddress,
    })),
    primaryEmailAddressId: user.primaryEmailAddressId,
    publicMetadata: {
      role: user.publicMetadata?.role as string | undefined,
    },
    imageUrl: user.imageUrl,
  }));

  return (
    <PageShell>
      <PageHeader />

      <div className="mb-8 flex justify-center">
        <div className="w-full max-w-md">
          <SearchUsers />
        </div>
      </div>

      {users.length > 0 ? (
        <AdminUserList users={users} />
      ) : query ? (
        <EmptyState />
      ) : null}
    </PageShell>
  );
}
