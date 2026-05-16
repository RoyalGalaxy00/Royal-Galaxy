// components/ui/alertAdmin.tsx
import { ShieldAlert, ShieldCheck } from "lucide-react";

export function AlertModerator() {
  return (
    <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/80 dark:bg-amber-950/30 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-200">
            Moderator Permissions
          </h3>
          <p className="text-sm text-amber-800/80 dark:text-amber-300/80 mt-1">
            Manages day‑to‑day operations: publish blogs, update galleries,
            handle bookings, review feedback.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AlertAdmin() {
  return (
    <div className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">
            Administrator Permissions
          </h3>
          <p className="text-sm text-indigo-800/80 dark:text-indigo-300/80 mt-1">
            Full control: assign roles, access system config, manage all users
            and security settings.
          </p>
        </div>
      </div>
    </div>
  );
}
