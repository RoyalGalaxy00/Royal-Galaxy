//AdminUserList.tsx
"use client";

import { useActionState } from "react";
import { setRole, removeRole } from "./_actions";
import Image from "next/image";

type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
  }>;
  primaryEmailAddressId: string | null;
  publicMetadata: {
    role?: string;
  };
  imageUrl: string;
};

type ActionState = {
  userId: string;
  success: boolean;
  message: string;
} | null;

function RoleBadge({ role }: { role?: string }) {
  const styles: Record<string, string> = {
    admin:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    moderator:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  };
  const label = role ?? "No role";
  const style =
    styles[role ?? ""] ??
    "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${style}`}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function StatusMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <div
      className={`mt-3 px-3 py-2 rounded-lg text-xs text-center font-medium ${
        state.success
          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      }`}
    >
      {state.success ? "✓" : "✕"} {state.message}
    </div>
  );
}

function UserCard({
  user,
  setRoleAction,
  removeRoleAction,
  setRoleState,
  removeRoleState,
}: {
  user: User;
  setRoleAction: (payload: FormData) => void;
  removeRoleAction: (payload: FormData) => void;
  setRoleState: ActionState;
  removeRoleState: ActionState;
}) {
  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  )?.emailAddress;

  // Only show feedback for this specific card
  const mySetState = setRoleState?.userId === user.id ? setRoleState : null;
  const myRemoveState =
    removeRoleState?.userId === user.id ? removeRoleState : null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 bg-white dark:bg-gray-800 flex flex-col w-72">
      {/* Avatar & Identity */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="relative w-16 h-16 mb-3">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`}
              fill
              className="rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-gray-100 dark:ring-gray-700">
              {user.firstName?.[0]?.toUpperCase() ?? "U"}
              {user.lastName?.[0]?.toUpperCase() ?? ""}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-base text-gray-900 dark:text-white leading-tight">
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 break-all max-w-[200px]">
          {primaryEmail}
        </p>

        <div className="mt-3">
          <RoleBadge role={user.publicMetadata?.role} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700 mb-4" />

      {/* Role Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <form action={setRoleAction}>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="role" value="admin" />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            Make Admin
          </button>
        </form>

        <form action={setRoleAction}>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="role" value="moderator" />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            Make Moderator
          </button>
        </form>

        <form action={removeRoleAction}>
          <input type="hidden" name="id" value={user.id} />
          <button
            type="submit"
            className="w-full bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] text-red-500 dark:text-red-400 text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Remove Role
          </button>
        </form>
      </div>

      {/* Per-card status messages */}
      <StatusMessage state={mySetState} />
      <StatusMessage state={myRemoveState} />
    </div>
  );
}

export function AdminUserList({ users }: { users: User[] }) {
  const [setRoleState, setRoleAction] = useActionState<ActionState, FormData>(
    setRole,
    null,
  );
  const [removeRoleState, removeRoleAction] = useActionState<
    ActionState,
    FormData
  >(removeRole, null);

  if (users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px] w-full">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          No users found. Try a different search.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 w-full">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          setRoleAction={setRoleAction}
          removeRoleAction={removeRoleAction}
          setRoleState={setRoleState}
          removeRoleState={removeRoleState}
        />
      ))}
    </div>
  );
}
