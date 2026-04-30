import React from "react";

/**
 * Lightweight shimmering skeleton block. Use for loading placeholders.
 */
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`rounded bg-accent/40 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <Skeleton className="h-4 w-1/3 mb-3" />
      <SkeletonText lines={2} />
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-3 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}