import { getRoomById, type RoomTypeId } from '../data/rooms'
import RoomDetailPage from './RoomDetailPage'
import RoomsPage from './RoomsPage'

type DashboardView = 'overview' | 'rooms' | 'room-details'

type DashboardPageProps = {
  view: DashboardView
  roomId?: RoomTypeId
  onLogout: () => void
  onNavigateOverview: () => void
  onNavigateRooms: () => void
  onOpenRoomDetails: (roomId: RoomTypeId) => void
  onBackToRooms: () => void
}

function DashboardPage({
  view,
  roomId,
  onLogout,
  onNavigateOverview,
  onNavigateRooms,
  onOpenRoomDetails,
  onBackToRooms,
}: DashboardPageProps) {
  const isOverview = view === 'overview'
  const isRoomsView = view !== 'overview'
  const selectedRoom = view === 'room-details' && roomId ? getRoomById(roomId) : null

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <p className="dashboard-brand">Hotel Admin</p>
        <p className="dashboard-section">Main</p>
        <div className="dashboard-nav">
          <button
            type="button"
            className={`dashboard-nav-item ${isOverview ? 'active' : ''}`}
            onClick={onNavigateOverview}
          >
            Overview
          </button>
          <button type="button" className="dashboard-nav-item">
            Reservations
          </button>
          <button type="button" className="dashboard-nav-item">
            Guests
          </button>
          <button
            type="button"
            className={`dashboard-nav-item ${isRoomsView ? 'active' : ''}`}
            onClick={onNavigateRooms}
          >
            Rooms
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              {isOverview ? 'Dashboard Home' : 'Rooms'}
            </p>
            <h1>
              {isOverview
                ? 'Property Overview'
                : selectedRoom
                  ? `${selectedRoom.type} Details`
                  : 'Rooms Management'}
            </h1>
          </div>

          <button type="button" className="dashboard-logout" onClick={onLogout}>
            Log out
          </button>
        </header>

        {isOverview ? (
          <>
            <section className="stats-grid">
              <article className="stat-card">
                <p>Current Occupancy</p>
                <h2>76%</h2>
                <span>+4% from yesterday</span>
              </article>

              <article className="stat-card">
                <p>Today Check-ins</p>
                <h2>12</h2>
                <span>3 arrivals in next 2 hours</span>
              </article>

              <article className="stat-card">
                <p>Available Rooms</p>
                <h2>28</h2>
                <span>Across all room types</span>
              </article>
            </section>

            <section className="dashboard-panel">
              <h3>Front Desk Notes</h3>
              <ul>
                <li>VIP guest arriving at 4:00 PM in Suite 504.</li>
                <li>Two late check-outs approved for today.</li>
                <li>Pool maintenance scheduled at 7:30 PM.</li>
              </ul>
            </section>
          </>
        ) : view === 'room-details' && roomId ? (
          <RoomDetailPage roomId={roomId} onBackToRooms={onBackToRooms} />
        ) : (
          <RoomsPage onOpenRoomDetails={onOpenRoomDetails} />
        )}
      </section>
    </main>
  )
}

export default DashboardPage
