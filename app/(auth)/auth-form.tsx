"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signInWithGoogle, signup, type AuthState } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    isSignup ? signup : login,
    {},
  );

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton />
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        {isSignup && (
          <Field label="Name" htmlFor="name">
            <input
              id="name"
              name="name"
              autoComplete="name"
              defaultValue={state.fields?.name}
              placeholder="Jordan Lee"
              className={inputClass}
              required
            />
          </Field>
        )}
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.fields?.email}
            placeholder="you@company.com"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? 8 : undefined}
            placeholder={isSignup ? "At least 8 characters" : "••••••••"}
            className={inputClass}
            required
          />
        </Field>
  
        <p
          aria-live="polite"
          className={`min-h-5 text-sm ${state.error ? "text-accent" : "text-emerald-700"}`}
        >
          {state.error ?? state.message}
        </p>
  
        <button
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "One moment…" : isSignup ? "Create account" : "Sign in"}
        </button>
  
        <p className="text-center text-sm text-muted">
          {isSignup ? "Already have an account? " : "New client? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-medium text-foreground hover:text-accent"
          >
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </div>
  );
}

function GoogleButton() {
  const [, formAction, pending] = useActionState(signInWithGoogle, undefined);

  return (
    <form action={formAction}>
      <button
        disabled={pending}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:border-foreground disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.77-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4.01-3.1z" />
          <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.1C6.23 6.88 8.87 4.77 12 4.77z" />
        </svg>
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
