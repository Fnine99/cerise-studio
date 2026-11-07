import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-normal">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Access your projects, drafts and final deliveries.
      </p>
      <AuthForm mode="signup" />
    </>
  );
}
