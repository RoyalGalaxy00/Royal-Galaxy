"use client";

import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EmailLimitAlert() {
  return (
    <div className="flex justify-center w-full px-4 mt-2">
      <Alert className="max-w-md w-full border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50 flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-3 px-4 py-4 sm:px-5 sm:py-4 mx-auto">
        <AlertTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 sm:h-4 sm:w-4" />
        <div className="flex-1">
          <AlertTitle className="font-semibold mb-1">
            Daily Email Limit
          </AlertTitle>
          <AlertDescription className="text-sm">
            The daily limit for sending emails is 300.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
