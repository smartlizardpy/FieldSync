import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/png", href: "/logo.png" },
  { rel: "apple-touch-icon", href: "/logo.png" },
  { rel: "canonical", href: "https://fieldsync.pages.dev" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function meta() {
  return [
    { title: "FieldSync · Camera IDs meet accurate locations" },
    {
      name: "description",
      content:
        "FieldSync keeps your camera filenames aligned with phone GPS logs so every photo has the right location.",
    },
    {
      name: "keywords",
      content: "FieldSync, photography, GPS, EXIF, geotagging, camera workflow",
    },
    {
      name: "google-site-verification",
      content: "M69fBEA9XreSstqUQn8L3x17bwfSPg_-Cy0w0CmP0po",
    },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "FieldSync · Camera IDs meet accurate locations" },
    {
      property: "og:description",
      content:
        "Log file suffixes on the go, sync anchors automatically, and review sessions with precise maps.",
    },
    { property: "og:image", content: "/card.png" },
    { property: "og:url", content: "https://fieldsync.pages.dev" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "FieldSync · Camera IDs meet accurate locations" },
    {
      name: "twitter:description",
      content:
        "Log file suffixes on the go, sync anchors automatically, and review sessions with precise maps.",
    },
    { name: "twitter:image", content: "/card.png" },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5N39MX2K');`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SWSEV3L1P6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','G-SWSEV3L1P6');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5N39MX2K"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="gtm"
          />
        </noscript>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
