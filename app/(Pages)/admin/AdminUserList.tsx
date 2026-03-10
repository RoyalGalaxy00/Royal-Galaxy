// app/(Pages)/admin/AdminUserList.tsx
"use client";

import { useActionState } from "react";
import { setRole, removeRole } from "./_actions";

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
};

export function AdminUserList({ users }: { users: User[] }) {
  const [setRoleState, setRoleAction] = useActionState(setRole, null);
  const [removeRoleState, removeRoleAction] = useActionState(removeRole, null);

  return (
    <div className="space-y-4 mt-4">
      {users.map((user) => {
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId,
        )?.emailAddress;

        return (
          <div key={user.id} className="border p-4 rounded shadow-sm">
            <div className="font-semibold">
              {user.firstName} {user.lastName}
            </div>

            <div className="text-gray-600 mb-2">{primaryEmail}</div>

            <div className="mb-3">
              Current Role:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {user.publicMetadata?.role || "No role"}
              </span>
            </div>

            <div className="flex gap-2">
              <form action={setRoleAction}>
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="admin" name="role" />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Make Admin
                </button>
              </form>

              <form action={setRoleAction}>
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="moderator" name="role" />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Make Moderator
                </button>
              </form>

              <form action={removeRoleAction}>
                <input type="hidden" value={user.id} name="id" />
                <button
                  type="submit"
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove Role
                </button>
              </form>
            </div>

            {/* Show action status messages */}
            {setRoleState && setRoleState.userId === user.id && (
              <div
                className={`mt-2 text-sm ${setRoleState.success ? "text-green-600" : "text-red-600"}`}
              >
                {setRoleState.message}
              </div>
            )}

            {removeRoleState && removeRoleState.userId === user.id && (
              <div
                className={`mt-2 text-sm ${removeRoleState.success ? "text-green-600" : "text-red-600"}`}
              >
                {removeRoleState.message}
              </div>
            )}
          </div>
        );
      })}

      {users.length === 0 && (
        <p className="text-gray-500">No users found. Try searching above.</p>
      )}
    </div>
  );
}
