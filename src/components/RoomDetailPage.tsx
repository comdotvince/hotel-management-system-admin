import { getRoomById, type RoomTypeId } from '../data/rooms'

type RoomDetailPageProps = {
  roomId: RoomTypeId
  onBackToRooms: () => void
}

function RoomDetailPage({ roomId, onBackToRooms }: RoomDetailPageProps) {
  const room = getRoomById(roomId)

  if (!room) {
    return (
      <section className="room-detail-panel">
        <h3>Room Not Found</h3>
        <p className="room-detail-description">
          The selected room type is not available.
        </p>
        <button type="button" className="room-back-button" onClick={onBackToRooms}>
          Back to Rooms
        </button>
      </section>
    )
  }

  const occupiedRooms = room.totalRooms - room.availableRooms

  return (
    <section className="room-detail-panel">
      <div className="room-detail-head">
        <div>
          <p className="room-detail-eyebrow">Room Type {room.code}</p>
          <h3>{room.type}</h3>
        </div>
        <button type="button" className="room-back-button" onClick={onBackToRooms}>
          Back to Rooms
        </button>
      </div>

      <div className="room-detail-grid">
        <img
          className="room-detail-image"
          src={room.image}
          alt={`${room.type} full detail`}
        />

        <div className="room-detail-body">
          <p className="room-detail-description">{room.description}</p>

          <div className="room-detail-stats">
            <article className="room-detail-stat">
              <span>Floors</span>
              <strong>{room.floorRange}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Rooms per floor</span>
              <strong>{room.roomsPerFloor}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Total rooms</span>
              <strong>{room.totalRooms}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Available</span>
              <strong>
                {room.availableRooms}/{room.totalRooms}
              </strong>
            </article>
            <article className="room-detail-stat">
              <span>Occupied</span>
              <strong>{occupiedRooms}</strong>
            </article>
          </div>

          <div className="room-floor-availability">
            <h4>Availability by floor</h4>
            <ul>
              {room.floorAvailability.map((floor) => (
                <li key={floor.floor}>
                  <span>Floor {floor.floor}</span>
                  <strong>
                    {floor.available}/{room.roomsPerFloor} available
                  </strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="room-amenities">
            <h4>Amenities</h4>
            <ul>
              {room.amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RoomDetailPage
