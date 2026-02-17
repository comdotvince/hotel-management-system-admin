import { rooms, type RoomTypeId } from '../data/rooms'

type RoomsPageProps = {
  onOpenRoomDetails: (roomId: RoomTypeId) => void
}

function RoomsPage({ onOpenRoomDetails }: RoomsPageProps) {
  return (
    <section className="rooms-panel">
      <h3>Room Inventory</h3>
      <p className="rooms-subtitle">3 room types across 9 floors</p>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className="room-card room-card-button"
            onClick={() => onOpenRoomDetails(room.id)}
          >
            <div className="room-card-head">
              <p>Room Type {room.code}</p>
              <span className="room-counter">
                {room.availableRooms}/{room.totalRooms}
              </span>
            </div>
            <img
              className="room-preview"
              src={room.image}
              alt={`${room.type} preview`}
              loading="lazy"
            />
            <h4>{room.type}</h4>
            <small>{room.floorRange}</small>
            <span className="room-detail-link">View full details</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default RoomsPage
