"use client";

import { useSearchParams } from "next/navigation";

export function OAuthError() {
  if (useSearchParams().get("error") !== "oauth") return null;
  return (
    <p className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent-hover">
      Sign-in didn&apos;t complete. Please try again.
    </p>
  );
}
