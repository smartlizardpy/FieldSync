import { Link } from "react-router";

export function Welcome() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-48 -z-10 transform-gpu blur-3xl">
          <div className="mx-auto h-[32rem] w-[64rem] bg-gradient-to-r from-sky-300/40 via-emerald-300/30 to-rose-300/40 opacity-60 dark:from-sky-500/20 dark:via-emerald-500/20 dark:to-rose-500/20" />
        </div>
        <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 text-white shadow-lg shadow-sky-500/30 dark:shadow-none">
                <span className="text-lg font-semibold">PH</span>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">FieldSync</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  GPS tagging for photographers
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link
                className="transition hover:text-slate-900 dark:hover:text-white"
                to="/app"
              >
                App
              </Link>
              <a className="transition hover:text-slate-900 dark:hover:text-white" href="#capture">
                Capture
              </a>
              <a className="transition hover:text-slate-900 dark:hover:text-white" href="#features">
                Features
              </a>
              <a className="transition hover:text-slate-900 dark:hover:text-white" href="#workflow">
                Workflow
              </a>
              <a className="transition hover:text-slate-900 dark:hover:text-white" href="#preview">
                Preview
              </a>
            </nav>
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-50 shadow-lg shadow-slate-900/20 transition hover:shadow-xl hover:shadow-slate-900/25 dark:bg-slate-50 dark:text-slate-900">
              Join the beta
              <span aria-hidden>→</span>
            </button>
          </div>
        </header>

        <section className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:flex-row lg:items-center lg:pt-24">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
              Built for photographers
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Geo-mark every shot without slowing down your post-shoot flow.
            </h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
              FieldSync pairs your camera&apos;s file numbers with live GPS from your phone.
              Lock an anchor on the go, drag in a folder later, and export with coordinates
              embedded in seconds.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-400/50"
              >
                Upload a shoot
                <span aria-hidden>⇪</span>
              </Link>
              <a
                href="#preview"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
              >
                Watch demo
                <span aria-hidden>▶</span>
              </a>
            </div>
            <dl className="grid gap-6 pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Photos synced
                </dt>
                <dd className="text-2xl font-semibold text-slate-900 dark:text-white">
                  120k+
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Average match time
                </dt>
                <dd className="text-2xl font-semibold text-slate-900 dark:text-white">
                  14s
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Supports RAW formats
                </dt>
                <dd className="text-2xl font-semibold text-slate-900 dark:text-white">
                  20+
                </dd>
              </div>
            </dl>
          </div>
          <div id="preview" className="flex-1">
            <HeroPreview />
          </div>
        </section>
      </div>

      <section
        id="capture"
        className="mx-auto max-w-6xl px-6 pb-20 lg:pb-28"
      >
        <div className="mb-10 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Capture setup
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Tell FieldSync where the session starts and which camera is shooting.
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-slate-500 dark:text-slate-400 lg:block">
            Every anchor links an image sequence with a precise starting location. We keep
            the coordinates alongside the camera ID so later adjustments stay audit-ready.
          </p>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            to="/app/otg"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:bg-sky-400"
          >
            Open phone capture
            <span aria-hidden>◎</span>
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Bookmark it on your phone to save anchors on location.
          </span>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <CaptureSetup />
          <AnchorHistory />
        </div>
      </section>

      <section
        id="features"
        className="border-t border-slate-200/70 bg-white/90 py-20 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Why FieldSync
            </p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to trust your location data.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              We built FieldSync around the gear you already have—a phone and your camera.
              Log the frame number right after the shot, and let FieldSync handle the GPS
              match when you get back to your desk.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition group-hover:bg-slate-800 dark:bg-slate-700 dark:shadow-none">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:flex-row lg:items-center"
      >
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Workflow
          </p>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            From camera to map without leaving your desk.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Designed for solo creators and studio teams alike, FieldSync keeps every
            shoot organized, searchable, and ready to share.
          </p>
          <ul className="space-y-6">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-slate-700">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="flex-1 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-lg shadow-slate-500/10 dark:border-slate-800 dark:bg-slate-900/70">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Seamless handoff to your editor
          </h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Export metadata-rich files ready for Lightroom, Capture One, or your cloud
            delivery platform. Include JSON manifests for teams that need even more control.
          </p>
          <div className="mt-6 space-y-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Coming next:</p>
            <ul className="space-y-2">
              <li>• Lightroom Classic sync panel</li>
              <li>• Shared project spaces with comments</li>
              <li>• Mobile capture app for on-the-go tagging</li>
            </ul>
          </div>
        </aside>
      </section>

      <footer className="border-t border-slate-200/70 bg-white/80 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>© {new Date().getFullYear()} FieldSync. Crafted for photographers.</p>
          <div className="flex items-center gap-4">
            <a className="transition hover:text-slate-800 dark:hover:text-white" href="#">
              Privacy
            </a>
            <a className="transition hover:text-slate-800 dark:hover:text-white" href="#">
              Terms
            </a>
            <a className="transition hover:text-slate-800 dark:hover:text-white" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-xl rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/80 p-6 text-slate-100 shadow-2xl shadow-slate-900/40 ring-1 ring-white/5 dark:border-slate-800 dark:shadow-none">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[30px]">
        <div className="absolute -top-32 left-12 h-64 w-64 rounded-full bg-sky-500/40 blur-3xl" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Session</p>
          <p className="text-lg font-semibold tracking-tight">Joshua Tree</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
          Synced
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4 rounded-2xl bg-white/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Selected photo</p>
            <p className="mt-1 text-base font-semibold">DSC_9231.NEF</p>
          </div>
          <div className="rounded-xl bg-black/20 p-3 text-xs text-slate-200">
            <p>Captured: Apr 21, 2024 · 18:42</p>
            <p>Camera: Nikon Z7 II</p>
            <p>Lens: 24-70mm · f/2.8</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 p-3 text-xs">
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 font-medium text-emerald-200">
              37.0972° N
            </span>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 font-medium text-emerald-200">
              115.2605° W
            </span>
            <span className="rounded-full bg-sky-400/20 px-3 py-1 font-medium text-sky-200">
              Elev. 1,271 m
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-400">Map preview</p>
            <span className="rounded-full bg-slate-900/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-200">
              Auto match
            </span>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <MapPreview />
            <div className="absolute bottom-3 right-3 rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
              Perfect alignment
            </div>
          </div>
          <div className="rounded-xl bg-black/20 p-3 text-xs text-slate-200">
            <p>Matched to: Track log · iPhone 15 Pro</p>
            <p>Confidence score: 97%</p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300 md:grid-cols-3">
        <div>
          <p className="uppercase tracking-wide text-slate-400">Batch progress</p>
          <p className="mt-1 font-semibold text-white">58 / 72</p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-slate-400">Pending review</p>
          <p className="mt-1 font-semibold text-white">8 photos</p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-slate-400">Export profile</p>
          <p className="mt-1 font-semibold text-white">Lightroom Classic</p>
        </div>
      </div>
    </div>
  );
}

function CaptureSetup() {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Quick capture setup
        </p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Anchor a shot to its starting location
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose the camera taking the shot, then log the first location. FieldSync keeps
          the anchor so every frame after inherits accurate coordinates.
        </p>
      </div>

      <form className="space-y-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Camera body
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-sky-500 dark:focus:ring-slate-700"
            defaultValue={cameraOptions[0]?.id}
          >
            {cameraOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Starting location name
          <input
            type="text"
            placeholder="e.g. Canyon Overlook · Trailhead"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-slate-700"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Latitude
            <input
              type="text"
              placeholder="37.0972° N"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-slate-700"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Longitude
            <input
              type="text"
              placeholder="115.2605° W"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-slate-700"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Reference frame
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            >
              <span aria-hidden>＋</span>
              Attach preview
            </button>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
              Optional: drop in the first image or a reference shot for quick verification.
            </p>
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
          <span className="flex items-center gap-2 font-medium">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Auto-sync to incoming captures
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Enabled</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white dark:bg-slate-700">
              i
            </span>
            FieldSync stores the camera ID, location, and timestamp as a starting anchor.
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-900/25 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            Save anchor
            <span aria-hidden>⤵</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function AnchorHistory() {
  return (
    <aside className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-inner shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Recent anchors
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Track every location you lock in. Timestamps and cameras help you cross-check in
          the field or back at the studio.
        </p>
      </div>
      <ul className="space-y-4">
        {recentAnchors.map((anchor) => {
          const statusStyle =
            anchor.status === "Anchored"
              ? "bg-emerald-400/15 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-200"
              : anchor.status === "Pending"
                ? "bg-amber-400/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-200"
                : "bg-slate-400/15 text-slate-500 dark:bg-slate-500/20 dark:text-slate-200";

          return (
            <li
              key={`${anchor.location}-${anchor.time}`}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {anchor.location}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{anchor.camera}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle}`}>
                  {anchor.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800/80">
                  <span aria-hidden>🕒</span>
                  {anchor.time}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800/80">
                  <span aria-hidden>📍</span>
                  {anchor.coordinates}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Tip: shooting a second location with the same camera? Drop a new anchor so each
        segment of the session stays perfectly geo-referenced.
      </div>
    </aside>
  );
}

function MapPreview() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="h-full w-full text-slate-400 [filter:drop-shadow(0_20px_40px_rgba(15,23,42,0.35))]"
    >
      <defs>
        <linearGradient id="gridGradient" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(14,165,233,0.35)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.15)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="160" fill="url(#gridGradient)" opacity="0.6" />
      <g stroke="rgba(148,163,184,0.2)" strokeWidth="1">
        {[...Array(11)].map((_, i) => (
          <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="160" />
        ))}
        {[...Array(9)].map((_, i) => (
          <line key={`h-${i}`} y1={i * 20} x1="0" y2={i * 20} x2="200" />
        ))}
      </g>
      <path
        d="M40 120C55 90 75 88 86 72C98 56 118 62 132 48C144 36 160 40 170 24"
        fill="none"
        stroke="rgba(16,185,129,0.6)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M30 130C50 110 74 108 88 90C102 72 124 68 142 54C158 42 175 36 188 20"
        fill="none"
        stroke="rgba(14,165,233,0.5)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="134"
        cy="50"
        r="12"
        fill="rgba(56,189,248,0.5)"
        stroke="rgba(96,165,250,0.8)"
        strokeWidth="5"
      />
      <circle cx="134" cy="50" r="4" fill="rgba(15,23,42,0.9)" />
    </svg>
  );
}

const cameraOptions = [
  { id: "nikon-z7ii-a", label: "Nikon Z7 II · Body A" },
  { id: "sony-a7rv", label: "Sony A7R V · Travel kit" },
  { id: "fujifilm-gfx", label: "Fujifilm GFX 100S · Studio" },
];

const recentAnchors = [
  {
    location: "Canyon Overlook",
    camera: "Nikon Z7 II · Body A",
    time: "08:14 · Today",
    coordinates: "37.0972° N · 115.2605° W",
    status: "Anchored",
  },
  {
    location: "Desert Ridge · Camp",
    camera: "Sony A7R V · Travel kit",
    time: "06:48 · Today",
    coordinates: "36.9981° N · 115.2877° W",
    status: "Anchored",
  },
  {
    location: "City Rooftop Sequence",
    camera: "Fujifilm GFX 100S · Studio",
    time: "19:05 · Yesterday",
    coordinates: "34.1019° N · 118.3295° W",
    status: "Pending",
  },
];

const features = [
  {
    title: "Phone GPS anchors",
    description:
      "Bookmark the on-the-go capture page, tap once, and we log the current coordinates with the frame number you just shot.",
    icon: function Icon() {
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full p-2">
          <path
            d="M20 6c-6.08 0-11 4.81-11 10.75 0 8.05 9.38 15.99 9.78 16.31.36.29.81.44 1.26.44s.9-.15 1.26-.44c.41-.32 9.78-8.26 9.78-16.31C31 10.81 26.08 6 20 6Zm0 14.75c-2.45 0-4.43-1.87-4.43-4.17S17.55 12.4 20 12.4s4.43 1.87 4.43 4.18-1.98 4.17-4.43 4.17Z"
            fill="currentColor"
          />
        </svg>
      );
    },
  },
  {
    title: "Quick photo number capture",
    description:
      "Enter the trailing digits your camera writes to the card—FieldSync keeps each entry tied to an anchor until you match the files on desktop.",
    icon: function Icon() {
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full p-2">
          <path
            d="M9 12c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H11c-1.1 0-2-.9-2-2V12Zm4 0v16h14V12H13Zm11.5 8L16 26v-8l8.5 4Z"
            fill="currentColor"
          />
        </svg>
      );
    },
  },
  {
    title: "Desk-side matching",
    description:
      "When you import, FieldSync lines up each filename with the GPS pins you saved in the field so you can export fresh EXIF data in one pass.",
    icon: function Icon() {
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full p-2">
          <path
            d="M12 28V12c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v16h-2v-4H14v4h-2Zm4-14h8v-2h-8v2Zm0 4h8v-2h-8v2Zm0 4h4v-2h-4v2Zm-2 8h12v2H14v-2Z"
            fill="currentColor"
          />
        </svg>
      );
    },
  },
];

const workflowSteps = [
  {
    title: "Drop in your shoot",
    description:
      "Import RAW, JPEG, or video stills directly from your card or editing catalog. We keep your folder structure intact.",
  },
  {
    title: "Sync with location sources",
    description:
      "Connect a GPS track, select a reference image, or pin spots on the map. FieldSync predicts the best match instantly.",
  },
  {
    title: "Review & export confidently",
    description:
      "Approve high-confidence matches, adjust any outliers with drag-and-drop, then export files with embedded coordinates.",
  },
];
