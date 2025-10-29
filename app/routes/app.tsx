import type { Route } from "./+types/app";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { useAuth } from "../contexts/auth";
import { getFirebaseFirestore } from "../firebase/client";
import { MobilePrompt } from "../welcome/welcome";

type Camera = {
  id: string;
  label: string;
  serial: string;
  lens: string;
  prefix: string;
};

type Anchor = {
  id: string;
  filename: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  notes?: string;
  cameraId?: string;
  accuracy?: number;
};

type Photo = {
  id: string;
  filename: string;
  capturedAt: string;
  cameraId?: string;
  anchorId: string;
  notes?: string;
};

type SessionStats = {
  totalPhotos: number;
  withLocations: number;
  anchors: number;
  cameras: number;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · Session workspace" },
    {
      name: "description",
      content:
        "Review imported photos, phone location logs, and camera gear from a single dashboard.",
    },
  ];
}

export default function AppRoute() {
  return <SessionWorkspace />;
}

function SessionWorkspace() {
  const { user, loading } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCameras([]);
      return;
    }

    const firestore = getFirebaseFirestore();
    const camerasRef = collection(firestore, "users", user.uid, "cameras");
    const unsubscribe = onSnapshot(camerasRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => mapCamera(doc));
      setCameras(docs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAnchors([]);
      return;
    }

    const firestore = getFirebaseFirestore();
    const anchorsRef = query(
      collection(firestore, "users", user.uid, "anchors"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(anchorsRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => mapAnchor(doc));
      setAnchors(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const photos = useMemo<Photo[]>(
    () =>
      anchors.map((anchor) => ({
        id: anchor.id,
        filename: anchor.filename,
        capturedAt: anchor.createdAt,
        cameraId: anchor.cameraId,
        anchorId: anchor.id,
        notes: anchor.notes,
      })),
    [anchors],
  );

  useEffect(() => {
    if (photos.length === 0) {
      setSelectedPhotoId(null);
      return;
    }

    if (!selectedPhotoId || !photos.some((photo) => photo.id === selectedPhotoId)) {
      setSelectedPhotoId(photos[0]!.id);
    }
  }, [photos, selectedPhotoId]);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? null,
    [photos, selectedPhotoId],
  );

  const selectedAnchor = useMemo(() => {
    if (!selectedPhoto?.anchorId) return null;
    return anchors.find((anchor) => anchor.id === selectedPhoto.anchorId) ?? null;
  }, [anchors, selectedPhoto?.anchorId]);

  const selectedCamera = useMemo(() => {
    if (!selectedPhoto?.cameraId) return null;
    return cameras.find((camera) => camera.id === selectedPhoto.cameraId) ?? null;
  }, [cameras, selectedPhoto?.cameraId]);

  const stats: SessionStats = useMemo(() => {
    return {
      totalPhotos: photos.length,
      withLocations: anchors.length,
      anchors: anchors.length,
      cameras: cameras.length,
    };
  }, [anchors.length, cameras.length, photos.length]);

  const cameraLookup = useMemo(() => {
    const lookup = new Map<string, Camera>();
    cameras.forEach((camera) => lookup.set(camera.id, camera));
    return lookup;
  }, [cameras]);

  const anchorUsage = useMemo(() => {
    const usage = new Map<string, number>();
    photos.forEach((photo) => {
      if (photo.anchorId) {
        usage.set(photo.anchorId, (usage.get(photo.anchorId) ?? 0) + 1);
      }
    });
    return usage;
  }, [photos]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <MobilePrompt />
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <WorkspaceHeader totalPhotos={stats.totalPhotos} withLocations={stats.withLocations} />

        <section className="mt-10">
          <SessionOverview stats={stats} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PhotoList
            photos={photos}
            anchors={anchors}
            cameras={cameraLookup}
            selectedPhotoId={selectedPhotoId}
            onSelect={setSelectedPhotoId}
          />
          <MapPanel photo={selectedPhoto} anchor={selectedAnchor} camera={selectedCamera} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <AnchorList anchors={anchors} usage={anchorUsage} cameraLookup={cameraLookup} />
          <CameraSummary cameras={cameras} />
        </section>
      </div>
    </main>
  );
}

function mapCamera(doc: QueryDocumentSnapshot<DocumentData>): Camera {
  const data = doc.data();
  return {
    id: doc.id,
    label: typeof data.label === "string" && data.label.trim().length > 0 ? data.label : "Untitled camera",
    serial: typeof data.serial === "string" && data.serial.trim().length > 0 ? data.serial : "—",
    lens: typeof data.lens === "string" && data.lens.trim().length > 0 ? data.lens : "—",
    prefix:
      typeof data.prefix === "string" && data.prefix.trim().length > 0 ? data.prefix : "DSC_",
  };
}

function mapAnchor(doc: QueryDocumentSnapshot<DocumentData>): Anchor {
  const data = doc.data();
  const createdAt = toIsoString(data.createdAt);
  return {
    id: doc.id,
    filename: typeof data.filename === "string" ? data.filename : "Untitled file",
    latitude: typeof data.latitude === "number" ? data.latitude : 0,
    longitude: typeof data.longitude === "number" ? data.longitude : 0,
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

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      <p className="text-sm">Preparing your workspace…</p>
    </main>
  );
}

function WorkspaceHeader({
  totalPhotos,
  withLocations,
}: {
  totalPhotos: number;
  withLocations: number;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white/90 px-6 py-6 shadow-sm backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 text-lg font-semibold text-white shadow">
          FS
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            FieldSync Workspace
          </p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            Session dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Imported files synced with the locations you logged on your phone.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Logged photos
          </p>
          <p className="text-3xl font-semibold text-slate-900">{totalPhotos}</p>
          <p className="text-xs text-slate-500">{withLocations} with phone location</p>
          <div className="mt-2">
            <Link
              to="/app/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-600 transition hover:text-sky-800"
            >
              Manage account →
            </Link>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
          You
        </div>
      </div>
    </header>
  );
}

function SessionOverview({ stats }: { stats: SessionStats }) {
  const cards = [
    {
      label: "Photos imported",
      value: stats.totalPhotos.toString(),
      accent: "from-sky-100 to-sky-200",
    },
    {
      label: "Phone locations",
      value: stats.withLocations.toString(),
      accent: "from-emerald-100 to-emerald-200",
    },
    {
      label: "Location logs",
      value: stats.anchors.toString(),
      accent: "from-slate-100 to-slate-200",
    },
    {
      label: "Cameras used",
      value: stats.cameras.toString(),
      accent: "from-slate-100 to-slate-200",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function PhotoList({
  photos,
  anchors,
  cameras,
  selectedPhotoId,
  onSelect,
}: {
  photos: Photo[];
  anchors: Anchor[];
  cameras: Map<string, Camera>;
  selectedPhotoId: string | null;
  onSelect: (id: string) => void;
}) {
  const anchorLookup = useMemo(() => {
    const lookup = new Map<string, Anchor>();
    anchors.forEach((anchor) => lookup.set(anchor.id, anchor));
    return lookup;
  }, [anchors]);

  if (photos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-500">
        Start logging frames on your phone to see them appear here.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Imported photos</h2>
          <p className="text-sm text-slate-500">
            Select a file to preview the location saved from the field.
          </p>
        </div>
        <span className="text-xs text-slate-500">{photos.length} files</span>
      </div>
      <ul className="space-y-3">
        {photos.map((photo) => {
          const anchor = anchorLookup.get(photo.anchorId);
          const camera = photo.cameraId ? cameras.get(photo.cameraId) : undefined;
          const isSelected = photo.id === selectedPhotoId;

          return (
            <li key={photo.id}>
              <button
                onClick={() => onSelect(photo.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-sky-400 bg-sky-50 shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{photo.filename}</span>
                  {anchor ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                      Location saved
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatDateTime(photo.capturedAt)}</span>
                  {camera && <span>· {camera.label}</span>}
                  <span>· ID {photo.anchorId}</span>
                </div>
                {photo.notes && (
                  <p className="mt-2 text-xs text-slate-500">Note: {photo.notes}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MapPanel({
  photo,
  anchor,
  camera,
}: {
  photo: Photo | null;
  anchor: Anchor | null;
  camera: Camera | null;
}) {
  if (!photo) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-500">
        Select a photo to see its logged location and capture details.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{photo.filename}</h2>
          <p className="text-sm text-slate-500">
            {formatDateTime(photo.capturedAt)} · {camera ? camera.label : "Unknown camera"}
          </p>
        </div>
        <Link
          to="/app/otg"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Open phone capture
          <span aria-hidden>◎</span>
        </Link>
      </div>

      {anchor ? (
        <>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100/60 p-4">
            <MiniMap latitude={anchor.latitude} longitude={anchor.longitude} />
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Location log" value={anchor.notes?.trim() || anchor.filename} />
            <InfoItem label="Camera" value={camera ? camera.label : "Unknown"} />
            <InfoItem
              label="Coordinates"
              value={`${formatCoordinate(anchor.latitude, "lat")} · ${formatCoordinate(anchor.longitude, "lon")}`}
            />
            <InfoItem label="Logged at" value={formatRelative(anchor.createdAt)} />
          </dl>
          {anchor.notes && (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              {anchor.notes}
            </p>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-6 text-sm text-slate-600">
          No new location was logged after this frame. FieldSync keeps using the previous
          GPS fix until you save another on your phone.
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MiniMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const hasValidCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!hasValidCoords) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
        No coordinates available for this anchor.
      </div>
    );
  }

  const url = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}&z=14&output=embed`;

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-slate-200">
      <iframe
        title="Anchor location"
        src={url}
        className="h-full w-full"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function AnchorList({
  anchors,
  usage,
  cameraLookup,
}: {
  anchors: Anchor[];
  usage: Map<string, number>;
  cameraLookup: Map<string, Camera>;
}) {
  if (anchors.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Phone location logs</h3>
        <p className="mt-2 text-sm text-slate-500">
          No anchors yet. Log a frame on your phone to seed the workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Phone location logs</h3>
        <span className="text-xs text-slate-500">{anchors.length} saved</span>
      </div>
      <ul className="space-y-4">
        {anchors.map((anchor) => {
          const camera = anchor.cameraId ? cameraLookup.get(anchor.cameraId) : undefined;
          const linked = usage.get(anchor.id) ?? 0;
          const photoLabel = linked === 1 ? "photo" : "photos";
          const displayName = anchor.notes?.trim() || anchor.filename;

          return (
            <li
              key={anchor.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">
                    {formatRelative(anchor.createdAt)} · {camera ? camera.label : "Unknown camera"}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  covers {linked} {photoLabel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                  {formatCoordinate(anchor.latitude, "lat")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                  {formatCoordinate(anchor.longitude, "lon")}
                </span>
                {typeof anchor.accuracy === "number" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    ±{Math.round(anchor.accuracy)} m
                  </span>
                )}
                {anchor.notes && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    {anchor.notes}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CameraSummary({ cameras }: { cameras: Camera[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Cameras in this session</h3>
        <p className="text-sm text-slate-500">
          FieldSync uses body IDs to map your photos to saved locations.
        </p>
      </div>
      <ul className="space-y-3">
        {cameras.map((camera) => (
          <li
            key={camera.id}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
          >
            <p className="font-semibold text-slate-900">{camera.label}</p>
            <p className="text-xs text-slate-500">
              Serial {camera.serial} · {camera.lens}
            </p>
            <p className="text-xs text-slate-500">Prefix {camera.prefix}</p>
          </li>
        ))}
        {cameras.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            No cameras registered yet. Add them in settings so FieldSync can keep everything aligned.
          </li>
        )}
      </ul>
    </div>
  );
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return `${date.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  })} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
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

function formatCoordinate(value: number, type: "lat" | "lon") {
  if (!Number.isFinite(value)) return "—";
  const suffix = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(4)}° ${suffix}`;
}
