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
  ];
}

export default function Home() {
  return <Welcome />;
}
