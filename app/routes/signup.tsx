import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import type { Route } from "./+types/signup";
import { signInWithGoogle } from "../firebase/client";
import { useAuth } from "../contexts/auth";
import { BrandMark, BrandWordmark } from "../components/brand";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · Join the beta" },
    {
      name: "description",
      content:
        "Create a FieldSync account with Google and learn how phone anchors sync with your session dashboard.",
    },
  ];
}

export default function SignupRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  useEffect(() => {
    if (!loading && user) {
      navigate("/signup/2", { replace: true });
    }
  }, [loading, user, navigate]);

  if (!loading && user) {
    return <Navigate to="/signup/2" replace />;
  }

  async function handleSignIn() {
    try {
      setAuthenticating(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError("We couldn’t complete Google sign-in. Please try again.");
      setAuthenticating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4 text-center">
          <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
            <BrandMark size="lg" />
            <BrandWordmark />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Join the FieldSync beta
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-500 sm:text-base">
            FieldSync keeps your camera files and phone GPS logs in sync. Sign in with Google, learn the basics below, and you’ll be ready to log anchors on location in seconds.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {ONBOARDING_POINTS.map((point) => (
            <article
              key={point.title}
              className="rounded-3xl border border-slate-200 bg-white/95 p-6 text-left shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {point.icon}
              </div>
              <h2 className="text-base font-semibold text-slate-900">{point.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{point.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500">
              We use Google to keep your FieldSync anchors and workspace secure. You can revoke access anytime.
            </p>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={authenticating}
              className="mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleGlyph />
              {authenticating ? "Signing in…" : "Continue with Google"}
            </button>
            {error && <p className="text-sm text-amber-600">{error}</p>}
            <p className="text-xs text-slate-400">
              Already joined? <Link to="/login" className="text-sky-600 hover:text-sky-800">Back to login</Link>
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What happens after sign-up?</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-600">
                1
              </span>
              <span>
                We set up your FieldSync workspace and keep a private Firestore record with your display name, email, and timezone.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-600">
                2
              </span>
              <span>
                Add your first camera on the next screen so the algorithm can match filename suffixes to the correct gear.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-600">
                3
              </span>
              <span>
                Bookmark <Link to="/app/otg" className="font-semibold text-slate-700 underline">/app/otg</Link> on your phone to log anchors after each shot—FieldSync syncs them automatically to the desktop dashboard.
              </span>
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}

const ONBOARDING_POINTS = [
  {
    title: "Capture on location",
    description:
      "Use the on-the-go logger to pair the latest filename digits with your phone’s GPS in seconds.",
    icon: "①",
  },
  {
    title: "Review in the workspace",
    description:
      "See every anchor, camera, and photo on the FieldSync dashboard without hunting through folders.",
    icon: "②",
  },
  {
    title: "Deliver with confidence",
    description:
      "Export images with precise coordinates and notes, ready for clients or your own archive.",
    icon: "③",
  },
];

function GoogleGlyph() {
  return (
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
  );
}
