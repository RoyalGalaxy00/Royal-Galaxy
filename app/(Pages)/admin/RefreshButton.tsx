"use client";

export function RefreshButton({ label = "Retry" }: { label?: string }) {
  return (
    <button
      onClick={() => window.location.reload()}
      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
    >
      {label}
    </button>
  );
}
