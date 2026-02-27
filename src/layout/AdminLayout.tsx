import type { ReactNode } from "react";
import RealTimeClock from "./RealTimeClock";
import { adminNavigation, type AdminRoute } from "./adminRoutes";

type AdminLayoutProps = {
  currentRoute: AdminRoute;
  pageTitle: string;
  onNavigate: (route: AdminRoute) => void;
  onLogout?: () => void;
  children: ReactNode;
};

function AdminLayout({
  currentRoute,
  pageTitle,
  onNavigate,
  onLogout,
  children,
}: AdminLayoutProps) {
  return (
    <main className="hms-shell">
      <aside className="hms-sidebar">
        <h1 className="hms-brand">Hotel Management</h1>
        <p className="hms-sidebar-label">Modules</p>
        <nav className="hms-nav" aria-label="Admin modules">
          {adminNavigation.map((navigationItem) => (
            <button
              key={navigationItem.path}
              type="button"
              className={`hms-nav-item ${currentRoute === navigationItem.path ? "active" : ""}`}
              onClick={() => onNavigate(navigationItem.path)}
            >
              {navigationItem.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="hms-main">
        <header className="hms-header">
          <div>
            <p className="hms-header-eyebrow">HMS Admin Dashboard</p>
            <h2>{pageTitle}</h2>
          </div>
          <div className="hms-header-actions">
            {onLogout ? (
              <button type="button" className="hms-logout" onClick={onLogout}>
                Log out
              </button>
            ) : null}
            <RealTimeClock />
          </div>
        </header>

        <section className="hms-content">{children}</section>
      </section>
    </main>
  );
}

export default AdminLayout;
