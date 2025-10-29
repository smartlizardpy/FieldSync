import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import type { Route } from "./+types/login";
import { signInWithGoogle } from "../firebase/client";
import { useAuth } from "../contexts/auth";
import { BrandMark, BrandWordmark } from "../components/brand";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · Sign in" },
    {
      name: "description",
      content: "Sign in to FieldSync with Google to manage your sessions and location logs.",
    },
  ];
}

export default function LoginRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true });
    }
  }, [loading, user, navigate]);

  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  async function handleSignIn() {
    try {
      setError(null);
      setAuthenticating(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("Could not sign in. Please try again.");
      setAuthenticating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
            <BrandMark size="lg" />
            <BrandWordmark />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back to FieldSync</h1>
          <p className="text-sm text-slate-500">
            Sign in to access your session workspace, location logs, and registered cameras.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={authenticating}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.86-6.86C35.9 2.38 30.3 0 24 0 14.62 0 6.44 5.38 2.54 13.16l7.98 6.2C12.68 14.02 17.88 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24.5c0-1.57-.15-3.09-.43-4.56H24v9.02h12.7c-.55 2.83-2.2 5.23-4.7 6.85l7.46 5.8C43.71 37.35 46.5 31.38 46.5 24.5z"
              />
              <path
                fill="#4A90E2"
                d="M9.52 28.96c-.45-1.34-.7-2.77-.7-4.27s.25-2.93.7-4.27l-7.98-6.2C.57 17.56 0 20.71 0 24c0 3.29.57 6.44 1.54 9.52l7.98-7.56z"
              />
              <path
                fill="#FBBC05"
                d="M24 48c6.3 0 11.6-2.08 15.47-5.63l-7.46-5.8c-2.08 1.39-4.75 2.2-8.01 2.2-6.12 0-11.32-4.52-13.48-10.66l-7.98 7.56C6.44 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            {authenticating ? "Signing in..." : "Sign in with Google"}
          </button>
          {error && <p className="mt-4 text-sm text-amber-600">{error}</p>}
        </div>
        <p className="text-center text-xs text-slate-400">
          Need FieldSync access? <Link className="text-sky-600 transition hover:text-sky-800" to="/">Learn more</Link>
        </p>
      </div>
    </main>
  );
}
