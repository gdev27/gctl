import React from "react";

export default function GctlMark({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="4" fill="hsl(var(--primary))" />
      <path d="M16 4 V10 M16 22 V28 M4 16 H10 M22 16 H28" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}