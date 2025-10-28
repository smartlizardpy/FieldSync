import type { Route } from "./+types/app.otg";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { useAuth } from "../contexts/auth";
import { getFirebaseFirestore } from "../firebase/client";

type CaptureEntry = {
  id: string;
  filename: string;
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  accuracy?: number;
  notes?: string;
  cameraId?: string;
};

type CaptureState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "success" }
  | { status: "error"; message: string };

const STORAGE_PREFIX_KEY = "fieldsync-otg-prefix";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · On-the-go anchor capture" },
    {
      name: "description",
      content:
        "Log photo numbers with live GPS from your phone so you can sync locations later.",
    },
  ];
}

export default function OtgRoute() {
  return <OnTheGoCapture />;
}

function OnTheGoCapture() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<CaptureEntry[]>([]);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [formDigits, setFormDigits] = useState("");
  const [prefix, setPrefix] = useState("DSC_");
  const [note, setNote] = useState("");
  const [cameraId, setCameraId] = useState<string>("");
  const [captureState, setCaptureState] = useState<CaptureState>({ status: "idle" });
  const [hydratedPrefix, setHydratedPrefix] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPrefix = window.localStorage.getItem(STORAGE_PREFIX_KEY);
    if (storedPrefix) {
      setPrefix(storedPrefix);
    }
    setHydratedPrefix(true);
  }, []);

  useEffect(() => {
    if (!hydratedPrefix || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_PREFIX_KEY, prefix);
  }, [prefix, hydratedPrefix]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    const firestore = getFirebaseFirestore();
    const anchorsRef = query(
      collection(firestore, "users", user.uid, "anchors"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(anchorsRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => mapEntry(doc));
      setEntries(docs);
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
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          label:
            typeof data.label === "string" && data.label.trim().length > 0
              ? data.label
              : "Untitled camera",
        };
      });
      setCameras(docs);
      if (docs.length > 0 && !cameraId) {
        setCameraId(docs[0]!.id);
      }
    });

    return () => unsubscribe();
  }, [user, cameraId]);

  const latestAnchor = entries[0] ?? null;

  const composedFilename = useMemo(() => {
    const trimmed = formDigits.trim();
    if (!trimmed) return prefix;
    return `${prefix}${trimmed}`;
  }, [formDigits, prefix]);

  const canSaveWithoutLocation =
    captureState.status === "error" && formDigits.trim().length > 0;

  if (loading) {
    return <LoadingScreen message="Preparing the capture tool…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!formDigits.trim()) {
      setCaptureState({
        status: "error",
        message: "Enter the trailing digits from your camera file name.",
      });
      return;
    }

    setCaptureState({ status: "locating" });

    const uid = user.uid;
    const trimmedNote = note.trim();

    try {
      const position = await acquirePosition();

      if (position) {
        await persistAnchor(uid, {
          filename: composedFilename,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          notes: trimmedNote,
          cameraId,
        });
      } else if (
        latestAnchor &&
        latestAnchor.latitude !== null &&
        latestAnchor.longitude !== null
      ) {
        await persistAnchor(uid, {
          filename: composedFilename,
          latitude: latestAnchor.latitude,
          longitude: latestAnchor.longitude,
          accuracy: latestAnchor.accuracy,
          notes:
            trimmedNote.length > 0
              ? `${trimmedNote} (reused previous location)`
              : "Reused previous location",
          cameraId,
        });
      } else {
        setCaptureState({
          status: "error",
          message:
            "Could not get your location. Try again or tap \"Save without GPS\" to keep the frame.",
        });
        return;
      }

      setCaptureState({ status: "success" });
      setFormDigits("");
      setNote("");
    } catch (error) {
      console.error("Failed to save anchor", error);
      setCaptureState({
        status: "error",
        message: "Could not save this anchor. Please try again.",
      });
    }
  }

  async function handleSaveWithoutLocation() {
    if (!user || !formDigits.trim()) return;
    const uid = user.uid;
    try {
      setCaptureState({ status: "locating" });
      await persistAnchor(uid, {
        filename: composedFilename,
        latitude: null,
        longitude: null,
        accuracy: undefined,
        notes: note,
        cameraId,
      });
      setCaptureState({ status: "success" });
      setFormDigits("");
      setNote("");
    } catch (error) {
      console.error("Failed to save anchor", error);
      setCaptureState({
        status: "error",
        message: "Could not save this anchor. Please try again.",
      });
    }
  }

  async function handleClearEntries() {
    if (!user) return;
    const shouldClear = window.confirm(
      "Delete all saved anchors for this account? This cannot be undone.",
    );
    if (!shouldClear) return;

    const firestore = getFirebaseFirestore();
    const uid = user.uid;
    const anchorsRef = collection(firestore, "users", uid, "anchors");
    const snapshot = await getDocs(anchorsRef);
    await Promise.all(snapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref)));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                On-the-go capture
              </p>
              <h1 className="text-2xl font-semibold leading-tight tracking-tight">
                Log a frame as soon as you take it.
              </h1>
              <p className="text-sm text-slate-500">
                Enter the trailing digits from your camera file name. FieldSync saves the
                number, timestamp, and your current GPS fix so the desktop app can attach
                coordinates later.
              </p>
            </div>
            <Link
              to="/app"
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:inline-flex"
            >
              Open desktop view
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                File prefix
                <input
                  type="text"
                  value={prefix}
                  onChange={(event) => setPrefix(event.target.value)}
                  placeholder="DSC_"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  inputMode="text"
                  autoComplete="off"
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last digits from camera filename
                <input
                  type="text"
                  value={formDigits}
                  onChange={(event) =>
                    setFormDigits(event.target.value.replace(/\s+/g, "").toUpperCase())
                  }
                  placeholder="9231"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-2xl font-semibold tracking-[0.35em] text-slate-900 shadow transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Camera used
                <select
                  value={cameraId}
                  onChange={(event) => setCameraId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label}
                    </option>
                  ))}
                  <option value="">Unspecified</option>
                </select>
              </label>

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes (optional)
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  placeholder="People, direction, or anything you want to remember."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                {captureState.status === "locating" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-slate-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
                    Capturing GPS fix…
                  </span>
                )}
                {captureState.status === "success" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Saved. You can shoot the next location.
                  </span>
                )}
                {captureState.status === "error" && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-3 py-1 text-amber-600">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {captureState.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={captureState.status === "locating"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save anchor now
                  <span aria-hidden>◎</span>
                </button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {canSaveWithoutLocation && (
                    <button
                      type="button"
                      onClick={handleSaveWithoutLocation}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      Save without GPS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearEntries}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              For the most accurate coordinates, keep location services on and wait a moment
              for your phone to lock onto the current spot before saving.
            </p>
          </form>

          <StatusBanner latestAnchor={latestAnchor} />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Saved anchors</h2>
            <p className="text-xs text-slate-500">Stored in FieldSync · {entries.length} saved</p>
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing yet. After you shoot a frame, type the ending digits and tap “Save anchor now.”
            </p>
          ) : (
            <ul className="space-y-4">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{entry.filename}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      Anchor
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {entry.latitude !== null && entry.longitude !== null ? (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
                          {formatCoordinate(entry.latitude, "lat")}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
                          {formatCoordinate(entry.longitude, "lon")}
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-2 py-1 text-amber-600">
                        Location unavailable
                      </span>
                    )}
                    {entry.accuracy !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
                        ±{Math.round(entry.accuracy)} m
                      </span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {entry.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mb-6 rounded-3xl border border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 shadow-sm">
          <p>
            Tip: add this page to your home screen for one-tap logging. Anchors stay synced to your
            FieldSync account until you clear them.
          </p>
        </footer>
      </div>
    </main>
  );
}

function mapEntry(docSnapshot: QueryDocumentSnapshot<DocumentData>): CaptureEntry {
  const data = docSnapshot.data();
  const createdAt = toIsoString(data.createdAt);
  return {
    id: docSnapshot.id,
    filename: typeof data.filename === "string" ? data.filename : "Untitled file",
    latitude:
      typeof data.latitude === "number" || data.latitude === null ? data.latitude : null,
    longitude:
      typeof data.longitude === "number" || data.longitude === null ? data.longitude : null,
    accuracy: typeof data.accuracy === "number" ? data.accuracy : undefined,
    notes: typeof data.notes === "string" ? data.notes : undefined,
    cameraId: typeof data.cameraId === "string" ? data.cameraId : undefined,
    createdAt,
  };
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  })} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function formatCoordinate(value: number, type: "lat" | "lon") {
  if (!Number.isFinite(value)) return "—";
  const suffix = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(5)}° ${suffix}`;
}

function StatusBanner({ latestAnchor }: { latestAnchor: CaptureEntry | null }) {
  if (!latestAnchor) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-5 text-sm text-slate-500">
        Each anchor applies to every photo you capture until you log the next one. Use it
        whenever you change locations or want a fresh reference point.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
        Current anchor
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="text-base font-semibold text-slate-900">{latestAnchor.filename}</p>
        <span className="text-xs text-slate-500">
          logged {formatRelative(latestAnchor.createdAt)}
        </span>
      </div>
      {latestAnchor.latitude !== null && latestAnchor.longitude !== null ? (
        <p className="mt-2 text-xs text-slate-500">
          {formatCoordinate(latestAnchor.latitude, "lat")} · {formatCoordinate(latestAnchor.longitude, "lon")}
        </p>
      ) : (
        <p className="mt-2 text-xs text-amber-600">
          Location was missing—double-check before leaving this spot.
        </p>
      )}
    </div>
  );
}

function formatRelative(iso: string) {
  const now = Date.now();
  const then = new Date(iso).valueOf();
  const diffMinutes = Math.round((now - then) / 60000);
  if (Number.isNaN(diffMinutes)) return "Unknown";
  if (diffMinutes < 1) return "just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      <p className="text-sm">{message}</p>
    </main>
  );
}

async function acquirePosition(): Promise<GeolocationPosition | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  try {
    return await getPosition({
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 5000,
    });
  } catch (error) {
    const geoError = error as GeolocationPositionError;
    if (geoError?.code !== geoError?.TIMEOUT && geoError?.code !== geoError?.POSITION_UNAVAILABLE) {
      return null;
    }
  }

  try {
    return await getPosition({
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 600000,
    });
  } catch {
    return null;
  }
}

function getPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function persistAnchor(
  uid: string,
  data: {
    filename: string;
    latitude: number | null;
    longitude: number | null;
    accuracy?: number;
    notes?: string;
    cameraId?: string;
  },
) {
  const firestore = getFirebaseFirestore();
  await addDoc(collection(firestore, "users", uid, "anchors"), {
    filename: data.filename,
    createdAt: serverTimestamp(),
    latitude: data.latitude,
    longitude: data.longitude,
    accuracy: data.accuracy ?? null,
    notes: data.notes?.trim() || null,
    cameraId: data.cameraId || null,
  });
}
