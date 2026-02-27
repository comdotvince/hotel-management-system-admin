import type { ReactNode } from "react";
import RealTimeClock from "./RealTimeClock";

type AdminLayoutSection = "overview" | "bookings" | "rooms";

type AdminLayoutProps = {
  section: AdminLayoutSection;
  eyebrow: string;
  title: string;
  onLogout: () => void;
  onNavigateOverview: () => void;
  onNavigateBookings: () => void;
  onNavigateRooms: () => void;
  children: ReactNode;
};

function AdminLayout({
  section,
  eyebrow,
  title,
  onNavigateOverview,
  onNavigateBookings,
  onNavigateRooms,
  children,
}: AdminLayoutProps) {
  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <p className="dashboard-brand">Hotel Admin</p>
        <p className="dashboard-section">Main</p>
        <div className="dashboard-nav">
          <button
            type="button"
            className={`dashboard-nav-item ${section === "overview" ? "active" : ""}`}
            onClick={onNavigateOverview}
          >
            Overview
          </button>
          <button
            type="button"
            className={`dashboard-nav-item ${section === "bookings" ? "active" : ""}`}
            onClick={onNavigateBookings}
          >
            Bookings
          </button>
          <button
            type="button"
            className={`dashboard-nav-item ${section === "rooms" ? "active" : ""}`}
            onClick={onNavigateRooms}
          >
            Rooms
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-clock-sticky">
          <RealTimeClock />
        </div>

        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}

export default AdminLayout;
