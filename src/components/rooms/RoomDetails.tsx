import AppModal from '../AppModal'
import StatusBadge from '../StatusBadge'
import type { RoomRecord } from '../../data/hmsMockData'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
})

type RoomDetailsProps = {
  room: RoomRecord | null
  onClose: () => void
  onEdit: (room: RoomRecord) => void
  onDelete: (room: RoomRecord) => void
}

function RoomDetails({ room, onClose, onEdit, onDelete }: RoomDetailsProps) {
  return (
    <AppModal
      isOpen={Boolean(room)}
      title={room ? `Room ${room.roomNumber} Details` : 'Room Details'}
      onClose={onClose}
    >
      {room ? (
        <div className="hms-room-details">
          <div className="hms-details-grid">
            <article>
              <span>Room ID</span>
              <strong>{room.id}</strong>
            </article>
            <article>
              <span>Room Number</span>
              <strong>{room.roomNumber}</strong>
            </article>
            <article>
              <span>Room Type</span>
              <strong>{room.roomType}</strong>
            </article>
            <article>
              <span>Capacity</span>
              <strong>{room.capacity} Guest(s)</strong>
            </article>
            <article>
              <span>Price / Night</span>
              <strong>{currencyFormatter.format(room.pricePerNight)}</strong>
            </article>
            <article>
              <span>Status</span>
              <strong>
                <StatusBadge status={room.status} />
              </strong>
            </article>
          </div>

          <section>
            <h4 className="hms-subheading">Description</h4>
            <p className="hms-empty-text">{room.description}</p>
          </section>

          <section>
            <h4 className="hms-subheading">Amenities</h4>
            <div className="hms-tag-list">
              {room.amenities.length ? (
                room.amenities.map((amenity) => (
                  <span key={amenity} className="hms-tag">
                    {amenity}
                  </span>
                ))
              ) : (
                <p className="hms-empty-text">No amenities listed.</p>
              )}
            </div>
          </section>

          <section>
            <h4 className="hms-subheading">Images</h4>
            <div className="hms-room-image-grid">
              {room.images.length ? (
                room.images.map((imagePath, index) => (
                  <article key={`${imagePath}-${index}`} className="hms-room-image-card">
                    <img src={imagePath} alt={`Room ${room.roomNumber} view ${index + 1}`} />
                  </article>
                ))
              ) : (
                <p className="hms-empty-text">No room images available.</p>
              )}
            </div>
          </section>

          <div className="hms-button-row">
            <button type="button" className="hms-primary-button" onClick={() => onEdit(room)}>
              Edit Room
            </button>
            <button type="button" className="hms-ghost-button" onClick={() => onDelete(room)}>
              Delete Room
            </button>
          </div>
        </div>
      ) : null}
    </AppModal>
  )
}

export default RoomDetails
