import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("app", "routes/app.tsx"),
  route("app/otg", "routes/app.otg.tsx"),
  route("app/settings", "routes/app.settings.tsx"),
] satisfies RouteConfig;
