import type { Route } from "./+types/app.settings";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { useAuth } from "../contexts/auth";
import { getFirebaseFirestore } from "../firebase/client";

type Camera = {
  id: string;
  label: string;
  serial: string;
  lens: string;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

type AccountProfile = {
  name: string;
  email: string;
  timezone: string;
};

const defaultTeam: TeamMember[] = [
  { id: "crew-primary", name: "Jordan Rivers", role: "Photographer" },
  { id: "crew-second", name: "Sasha Lin", role: "Junior shooter" },
  { id: "crew-producer", name: "Alex Gomez", role: "Producer" },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · Account settings" },
    {
      name: "description",
      content:
        "Manage your FieldSync account, cameras, and crew directory while assignment stays on the roadmap.",
    },
  ];
}

export default function AccountSettingsRoute() {
  return <AccountSettings />;
}

function AccountSettings() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<AccountProfile>({
    name: "",
    email: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
  });
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [form, setForm] = useState({ label: "", serial: "", lens: "" });
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile({
        name: "",
        email: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
      });
      setProfileLoaded(false);
      return;
    }

    const firestore = getFirebaseFirestore();
    const userDocRef = doc(firestore, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      const data = snapshot.data() as DocumentData | undefined;
      setProfile({
        name: typeof data?.name === "string" ? data.name : user.displayName ?? "",
        email: typeof data?.email === "string" ? data.email : user.email ?? "",
        timezone:
          typeof data?.timezone === "string"
            ? data.timezone
            : Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
      });
      setProfileLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

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
      const docs = snapshot.docs.map((doc) => mapCamera(doc));
      setCameras(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const totalCameras = cameras.length;

  async function handleProfileChange(field: keyof AccountProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (!user) return;
    try {
      await setDoc(
        doc(getFirebaseFirestore(), "users", user.uid),
        { [field]: value },
        { merge: true },
      );
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  }

  async function handleAddCamera(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!form.label.trim()) return;

    const payload = {
      label: form.label.trim(),
      serial: form.serial.trim() || "—",
      lens: form.lens.trim() || "—",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(getFirebaseFirestore(), "users", user.uid, "cameras"), payload);
      setForm({ label: "", serial: "", lens: "" });
    } catch (error) {
      console.error("Failed to add camera", error);
    }
  }

  if (loading || !profileLoaded) {
    return <LoadingScreen message="Loading your settings…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account settings
            </p>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight">
              Manage your workspace
            </h1>
            <p className="text-sm text-slate-500">
              Update your profile and register every body ID. Camera assignment is on the roadmap for FieldSync.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            ← Back to workspace
          </Link>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ProfileCard profile={profile} onChange={handleProfileChange} />
          <CameraStats total={totalCameras} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <CameraManager cameras={cameras} form={form} onFormChange={setForm} onAddCamera={handleAddCamera} />
          <TeamDirectory team={defaultTeam} />
        </section>
      </div>
    </main>
  );
}

function mapCamera(docSnapshot: QueryDocumentSnapshot<DocumentData>): Camera {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    label:
      typeof data.label === "string" && data.label.trim().length > 0
        ? data.label
        : "Untitled camera",
    serial:
      typeof data.serial === "string" && data.serial.trim().length > 0
        ? data.serial
        : "—",
    lens:
      typeof data.lens === "string" && data.lens.trim().length > 0
        ? data.lens
        : "—",
  };
}

function ProfileCard({
  profile,
  onChange,
}: {
  profile: AccountProfile;
  onChange: (field: keyof AccountProfile, value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
      <p className="mt-1 text-sm text-slate-500">
        These details appear on exports and upcoming team features.
      </p>
      <div className="mt-6 space-y-4">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Name
          <input
            type="text"
            value={profile.name}
            onChange={(event) => onChange("name", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Email
          <input
            type="email"
            value={profile.email}
            onChange={(event) => onChange("email", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Timezone
          <input
            type="text"
            value={profile.timezone}
            onChange={(event) => onChange("timezone", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
      </div>
    </div>
  );
}

function CameraStats({ total }: { total: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Camera overview</h2>
      <p className="mt-1 text-sm text-slate-500">
        Register each camera so FieldSync can match files to the right location logs.
      </p>
      <div className="mt-6 space-y-4">
        <StatsRow label="Total registered" value={total.toString()} accent="bg-sky-100" />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
          Camera assignment is coming soon. For now, log every body ID so the algorithm can
          link photo numbers with your phone locations.
        </div>
      </div>
    </div>
  );
}

function StatsRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold text-slate-700 ${accent}`}>
          •
        </span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function CameraManager({
  cameras,
  form,
  onFormChange,
  onAddCamera,
}: {
  cameras: Camera[];
  form: { label: string; serial: string; lens: string };
  onFormChange: (form: { label: string; serial: string; lens: string }) => void;
  onAddCamera: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Registered cameras</h2>
        <p className="text-sm text-slate-500">
          Log each body so FieldSync can match file numbers to the phone locations you saved.
        </p>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4" onSubmit={onAddCamera}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Camera label
            <input
              type="text"
              value={form.label}
              onChange={(event) => onFormChange({ ...form, label: event.target.value })}
              placeholder="e.g. Canon R5 · Studio"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Serial / ID
            <input
              type="text"
              value={form.serial}
              onChange={(event) => onFormChange({ ...form, serial: event.target.value })}
              placeholder="Optional"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Lens
            <input
              type="text"
              value={form.lens}
              onChange={(event) => onFormChange({ ...form, lens: event.target.value })}
              placeholder="Optional"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-500"
          >
            Add camera
            <span aria-hidden>＋</span>
          </button>
        </div>
      </form>

      <ul className="mt-6 space-y-3">
        {cameras.map((camera) => (
          <li
            key={camera.id}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm"
          >
            <p className="font-semibold text-slate-900">{camera.label}</p>
            <p className="text-xs text-slate-500">
              Serial {camera.serial} · {camera.lens}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Saved as <span className="font-semibold text-slate-900">{camera.id}</span> — FieldSync uses this ID when matching files.
            </p>
          </li>
        ))}
        {cameras.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            No cameras registered yet. Add them here so FieldSync can map camera IDs to your logs.
          </li>
        )}
      </ul>
    </div>
  );
}

function TeamDirectory({ team }: { team: TeamMember[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Team directory</h2>
        <p className="text-sm text-slate-500">
          Keep your crew listed here so future camera assignment and exports know who is who.
        </p>
      </div>
      <ul className="space-y-3">
        {team.map((member) => (
          <li
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm"
          >
            <p className="font-semibold text-slate-900">{member.name}</p>
            <p className="text-xs text-slate-500">{member.role}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        Shared workspace members are coming soon. For now, this list keeps your contact names ready for the matching algorithm.
      </p>
    </div>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      <p className="text-sm">{message}</p>
    </main>
  );
}
