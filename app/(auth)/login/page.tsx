import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { OAuthError } from "../oauth-error";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-normal">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Sign in to review your latest cuts.
      </p>
      <Suspense>
        <OAuthError />
      </Suspense>
      <AuthForm mode="login" />
    </>
  );
}
