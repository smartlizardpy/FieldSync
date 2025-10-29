import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import type { Route } from "./+types/signup.camera";
import { useAuth } from "../contexts/auth";
import { getFirebaseFirestore } from "../firebase/client";
import { BrandMark, BrandWordmark } from "../components/brand";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · Add your first camera" },
    {
      name: "description",
      content:
        "Finish FieldSync onboarding by adding the camera prefix you use in the field before jumping into the workspace.",
    },
  ];
}

type Camera = {
  id: string;
  label: string;
  prefix: string;
};

export default function SignupCameraRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ label: "", prefix: "DSC_" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const canContinue = cameras.length > 0;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signup", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) {
      setCameras([]);
      return;
    }
    const firestore = getFirebaseFirestore();
    const camerasRef = query(
      collection(firestore, "users", user.uid, "cameras"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(camerasRef, (snapshot) => {
      const docs = snapshot.docs.map(mapCamera);
      setCameras(docs);
    });
    return () => unsubscribe();
  }, [user]);

  if (!loading && !user) {
    return <Navigate to="/signup" replace />;
  }

  async function handleCreateCamera(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!user) {
      setError("Sign in with Google before saving your camera.");
      return;
    }

    if (!form.label.trim()) {
      setError("Give your camera a name so you can recognise it later.");
      return;
    }

    const payload = {
      label: form.label.trim(),
      prefix: (form.prefix.trim() || "DSC_").toUpperCase(),
      serial: "—",
      lens: "—",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(getFirebaseFirestore(), "users", user.uid, "cameras"), payload);
      setMessage(`Saved ${payload.label} with prefix ${payload.prefix}.`);
      setForm({ label: "", prefix: payload.prefix });
    } catch (err) {
      console.error(err);
      setError("We couldn’t save that camera. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4 text-center">
          <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
            <BrandMark size="lg" />
            <BrandWordmark />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Step 2 of 2</p>
          <h1 className="text-3xl font-semibold tracking-tight">Add your first camera</h1>
          <p className="text-sm text-slate-500 sm:text-base">
            FieldSync relies on your camera’s filename prefix to map photos to anchors. Add at least one body now— you can manage more in settings later.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreateCamera}>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Camera label
              <input
                type="text"
                value={form.label}
                onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="e.g. Nikon Z7 II · Body A"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filename prefix
              <input
                type="text"
                value={form.prefix}
                onChange={(event) => setForm((prev) => ({ ...prev, prefix: event.target.value.toUpperCase() }))}
                placeholder="DSC_"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                required
              />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Save camera
                <span aria-hidden>＋</span>
              </button>
            </div>
          </form>
          {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
          {error && <p className="mt-4 text-sm text-amber-600">{error}</p>}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Cameras you’ve added</h2>
          {cameras.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No cameras yet—add your primary body to continue.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {cameras.map((camera) => (
                <li
                  key={camera.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{camera.label}</p>
                    <p className="text-xs text-slate-500">Prefix {camera.prefix}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm text-center">
          <h2 className="text-lg font-semibold text-slate-900">Ready to explore FieldSync?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your cameras sync to the desktop workspace and mobile capture tool automatically.
          </p>
          <Link
            to={canContinue ? "/app" : "#"}
            onClick={(event) => {
              if (!canContinue) event.preventDefault();
            }}
            aria-disabled={!canContinue}
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition ${
              canContinue
                ? "bg-slate-900 hover:-translate-y-0.5 hover:bg-slate-800"
                : "cursor-not-allowed bg-slate-400"
            }`}
          >
            Go to workspace
            <span aria-hidden>→</span>
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Need to invite teammates? You can add them in account settings later.
          </p>
        </section>
      </div>
    </main>
  );
}

function mapCamera(doc: QueryDocumentSnapshot<DocumentData>): Camera {
  const data = doc.data();
  return {
    id: doc.id,
    label:
      typeof data.label === "string" && data.label.trim().length > 0 ? data.label : "Untitled camera",
    prefix:
      typeof data.prefix === "string" && data.prefix.trim().length > 0 ? data.prefix : "DSC_",
  };
}
