import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FieldSync · Camera IDs meet accurate locations" },
    {
      name: "description",
      content:
        "FieldSync keeps your camera filenames aligned with phone GPS logs so every photo has the right location.",
    },
    { name: "keywords", content: "FieldSync, photography, GPS, EXIF, geotagging, camera workflow" },
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
    {
      tagName: "link",
      rel: "canonical",
      href: "https://fieldsync.pages.dev",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
