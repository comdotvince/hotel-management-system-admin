export const adminNavigation = [
  {
    path: "/dashboard",
    label: "Dashboard",
    title: "Dashboard Overview",
  },
  {
    path: "/rooms",
    label: "Room Management",
    title: "Room Management",
  },
  {
    path: "/bookings",
    label: "Booking Management",
    title: "Booking Management",
  },
] as const;

export type AdminRoute = (typeof adminNavigation)[number]["path"];

const routeSet = new Set<string>(adminNavigation.map((item) => item.path));

export const isAdminRoute = (value: string): value is AdminRoute =>
  routeSet.has(value);

export const getAdminRouteTitle = (route: AdminRoute) =>
  adminNavigation.find((item) => item.path === route)?.title ?? "Admin";
