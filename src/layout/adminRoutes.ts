export const adminNavigation = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    title: 'Dashboard Overview',
  },
  {
    path: '/rooms',
    label: 'Room Management',
    title: 'Room Management',
  },
  {
    path: '/bookings',
    label: 'Booking Management',
    title: 'Booking Management',
  },
  {
    path: '/guests',
    label: 'Guest Management',
    title: 'Guest Management',
  },
  {
    path: '/services',
    label: 'In-Stay Services',
    title: 'In-Stay Services',
  },
  {
    path: '/billing',
    label: 'Billing & Checkout',
    title: 'Billing & Checkout',
  },
  {
    path: '/reports',
    label: 'Reports',
    title: 'Reports',
  },
  {
    path: '/settings',
    label: 'Settings',
    title: 'Settings',
  },
] as const

export type AdminRoute = (typeof adminNavigation)[number]['path']

const routeSet = new Set<string>(adminNavigation.map((item) => item.path))

export const isAdminRoute = (value: string): value is AdminRoute =>
  routeSet.has(value)

export const getAdminRouteTitle = (route: AdminRoute) =>
  adminNavigation.find((item) => item.path === route)?.title ?? 'Admin'
