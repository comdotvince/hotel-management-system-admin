import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useMemo,
  useState,
} from 'react'
import {
  rooms,
  type RoomAvailabilityStatus,
  type RoomInventoryId,
  type RoomInventoryItem,
  type RoomTypeId,
} from '../data/rooms'

type RoomMutationInput = Omit<RoomInventoryItem, 'id'>

type RoomsPageProps = {
  roomInventory: RoomInventoryItem[]
  onOpenRoomDetails: (roomId: RoomInventoryId) => void
  onCreateRoom: (roomInput: RoomMutationInput) => void
}

const availabilityOptions: Array<{
  value: 'all' | RoomAvailabilityStatus
  label: string
}> = [
  { value: 'all', label: 'All statuses' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
]

const getAvailabilityLabel = (status: RoomAvailabilityStatus) =>
  status === 'available' ? 'Available' : 'Occupied'

const getDefaultRoomTypeId = (): RoomTypeId => rooms[0]?.id ?? 'standard-room'

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        resolve(fileReader.result)
        return
      }

      reject(new Error('Failed to read file as data URL'))
    }
    fileReader.onerror = () =>
      reject(new Error(`Failed to read "${file.name}"`))
    fileReader.readAsDataURL(file)
  })

const readFilesAsDataUrls = async (files: File[]) =>
  Promise.all(files.map(readFileAsDataUrl))

function RoomsPage({
  roomInventory,
  onOpenRoomDetails,
  onCreateRoom,
}: RoomsPageProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState<'all' | number>('all')
  const [selectedType, setSelectedType] = useState<'all' | RoomTypeId>('all')
  const [selectedAvailability, setSelectedAvailability] = useState<
    'all' | RoomAvailabilityStatus
  >('all')
  const [createRoomNumber, setCreateRoomNumber] = useState('')
  const [createFloor, setCreateFloor] = useState('')
  const [createTypeId, setCreateTypeId] = useState<RoomTypeId>(
    getDefaultRoomTypeId
  )
  const [createStatus, setCreateStatus] =
    useState<RoomAvailabilityStatus>('available')
  const [createImageUrlInput, setCreateImageUrlInput] = useState('')
  const [createImages, setCreateImages] = useState<string[]>([])
  const [createError, setCreateError] = useState('')

  const floors = useMemo(
    () =>
      Array.from(new Set(roomInventory.map((room) => room.floor))).sort(
        (a, b) => a - b
      ),
    [roomInventory]
  )

  const filteredRooms = useMemo(
    () => {
      const matchingRooms = roomInventory.filter((room) => {
        const floorMatches =
          selectedFloor === 'all' || room.floor === selectedFloor
        const typeMatches = selectedType === 'all' || room.typeId === selectedType
        const availabilityMatches =
          selectedAvailability === 'all' || room.status === selectedAvailability

        return floorMatches && typeMatches && availabilityMatches
      })

      return matchingRooms.sort(
        (firstRoom, secondRoom) =>
          firstRoom.floor - secondRoom.floor ||
          firstRoom.roomNumber.localeCompare(secondRoom.roomNumber)
      )
    },
    [roomInventory, selectedAvailability, selectedFloor, selectedType]
  )

  const availableVisibleRooms = filteredRooms.filter(
    (room) => room.status === 'available'
  ).length

  const activeFilterCount =
    Number(selectedFloor !== 'all') +
    Number(selectedType !== 'all') +
    Number(selectedAvailability !== 'all')

  const resetFilters = () => {
    setSelectedFloor('all')
    setSelectedType('all')
    setSelectedAvailability('all')
  }

  const handleCreateRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const roomNumber = createRoomNumber.trim()
    const floor = Number(createFloor)

    if (!roomNumber) {
      setCreateError('Room number is required.')
      return
    }

    if (!Number.isInteger(floor) || floor < 1) {
      setCreateError('Floor must be a valid positive number.')
      return
    }

    const roomNumberAlreadyExists = roomInventory.some(
      (room) => room.roomNumber.toLowerCase() === roomNumber.toLowerCase()
    )

    if (roomNumberAlreadyExists) {
      setCreateError('Room number already exists.')
      return
    }

    onCreateRoom({
      roomNumber,
      floor,
      typeId: createTypeId,
      status: createStatus,
      images: createImages,
    })

    setCreateRoomNumber('')
    setCreateFloor('')
    setCreateStatus('available')
    setCreateTypeId(getDefaultRoomTypeId())
    setCreateImageUrlInput('')
    setCreateImages([])
    setCreateError('')
    setIsCreateOpen(false)
  }

  const handleCreateImageUrlAdd = () => {
    const nextImageUrl = createImageUrlInput.trim()
    if (!nextImageUrl) {
      return
    }

    if (createImages.includes(nextImageUrl)) {
      setCreateError('Image already added.')
      return
    }

    setCreateImages((currentImages) => [...currentImages, nextImageUrl])
    setCreateImageUrlInput('')
    setCreateError('')
  }

  const handleCreateImageUrlKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    handleCreateImageUrlAdd()
  }

  const handleCreateImageRemove = (imageIndex: number) => {
    setCreateImages((currentImages) =>
      currentImages.filter((_, index) => index !== imageIndex)
    )
  }

  const handleCreateImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!uploadedFiles.length) {
      return
    }

    try {
      const uploadedImages = await readFilesAsDataUrls(uploadedFiles)
      setCreateImages((currentImages) => {
        const nextImages = [...currentImages]
        uploadedImages.forEach((imageUrl) => {
          if (!nextImages.includes(imageUrl)) {
            nextImages.push(imageUrl)
          }
        })
        return nextImages
      })
      setCreateError('')
    } catch {
      setCreateError('Failed to upload image.')
    }
  }

  return (
    <section className="rooms-panel">
      <div className="rooms-head">
        <div>
          <h3>Room Inventory</h3>
          <p className="rooms-subtitle">
            {filteredRooms.length} rooms shown • {availableVisibleRooms} available
          </p>
        </div>

        <div className="rooms-actions">
          <button
            type="button"
            className={`rooms-add-button ${isCreateOpen ? 'active' : ''}`}
            onClick={() => {
              setIsCreateOpen((currentState) => !currentState)
              setCreateError('')
            }}
          >
            {isCreateOpen ? 'Close Form' : 'Add Room'}
          </button>

          <div className="rooms-filter-wrap">
            <button
              type="button"
              className={`rooms-filter-button ${isFilterOpen ? 'active' : ''}`}
              onClick={() => setIsFilterOpen((currentState) => !currentState)}
              aria-expanded={isFilterOpen}
              aria-controls="rooms-filter-menu"
            >
              Filter
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>

            {isFilterOpen ? (
              <div className="rooms-filter-menu" id="rooms-filter-menu">
                <label className="rooms-filter-field">
                  Floor
                  <select
                    value={selectedFloor === 'all' ? 'all' : String(selectedFloor)}
                    onChange={(event) => {
                      const nextFloor = event.target.value
                      setSelectedFloor(
                        nextFloor === 'all' ? 'all' : Number(nextFloor)
                      )
                    }}
                  >
                    <option value="all">All floors</option>
                    {floors.map((floor) => (
                      <option key={floor} value={floor}>
                        Floor {floor}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rooms-filter-field">
                  Room type
                  <select
                    value={selectedType}
                    onChange={(event) => {
                      const nextType = event.target.value
                      setSelectedType(
                        nextType === 'all' ? 'all' : (nextType as RoomTypeId)
                      )
                    }}
                  >
                    <option value="all">All room types</option>
                    {rooms.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rooms-filter-field">
                  Availability
                  <select
                    value={selectedAvailability}
                    onChange={(event) => {
                      const nextAvailability = event.target.value
                      setSelectedAvailability(
                        nextAvailability === 'all'
                          ? 'all'
                          : (nextAvailability as RoomAvailabilityStatus)
                      )
                    }}
                  >
                    {availabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className="rooms-filter-reset"
                  onClick={resetFilters}
                >
                  Reset filters
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <form className="rooms-create-form" onSubmit={handleCreateRoom}>
          <label className="rooms-filter-field">
            Room number
            <input
              value={createRoomNumber}
              onChange={(event) => setCreateRoomNumber(event.target.value)}
              placeholder="e.g. 410"
            />
          </label>

          <label className="rooms-filter-field">
            Floor
            <input
              type="number"
              min={1}
              value={createFloor}
              onChange={(event) => setCreateFloor(event.target.value)}
              placeholder="e.g. 4"
            />
          </label>

          <label className="rooms-filter-field">
            Room type
            <select
              value={createTypeId}
              onChange={(event) => setCreateTypeId(event.target.value as RoomTypeId)}
            >
              {rooms.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.type}
                </option>
              ))}
            </select>
          </label>

          <label className="rooms-filter-field">
            Status
            <select
              value={createStatus}
              onChange={(event) =>
                setCreateStatus(event.target.value as RoomAvailabilityStatus)
              }
            >
              {availabilityOptions
                .filter((option) => option.value !== 'all')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </label>

          <div className="rooms-create-actions">
            <button type="submit" className="rooms-create-submit">
              Create Room
            </button>
            <button
              type="button"
              className="rooms-create-cancel"
              onClick={() => {
                setIsCreateOpen(false)
                setCreateImageUrlInput('')
                setCreateImages([])
                setCreateError('')
              }}
            >
              Cancel
            </button>
          </div>

          <label className="rooms-filter-field">
            Image URL
            <div className="rooms-image-url-row">
              <input
                value={createImageUrlInput}
                onChange={(event) => setCreateImageUrlInput(event.target.value)}
                onKeyDown={handleCreateImageUrlKeyDown}
                placeholder="https://example.com/room.jpg"
              />
              <button
                type="button"
                className="rooms-add-image"
                onClick={handleCreateImageUrlAdd}
              >
                Add Image
              </button>
            </div>
          </label>

          <div className="rooms-image-actions">
            <label className="rooms-upload-label">
              Upload Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCreateImageUpload}
              />
            </label>
            <button
              type="button"
              className="rooms-clear-image"
              onClick={() => setCreateImages([])}
            >
              Remove All Images
            </button>
          </div>

          {createImages.length ? (
            <div className="rooms-image-list">
              {createImages.map((imageUrl, imageIndex) => (
                <figure key={`${imageUrl}-${imageIndex}`} className="rooms-image-item">
                  <img
                    className="rooms-image-preview"
                    src={imageUrl}
                    alt={`New room preview ${imageIndex + 1}`}
                  />
                  <button
                    type="button"
                    className="rooms-remove-image"
                    onClick={() => handleCreateImageRemove(imageIndex)}
                  >
                    Remove
                  </button>
                </figure>
              ))}
            </div>
          ) : null}

          {createError ? <p className="rooms-form-error">{createError}</p> : null}
        </form>
      ) : null}

      {filteredRooms.length ? (
        <div className="rooms-grid">
          {filteredRooms.map((room) => {
            const roomType = rooms.find((item) => item.id === room.typeId)
            if (!roomType) {
              return null
            }

            return (
              <button
                key={room.id}
                type="button"
                className="room-card room-card-button"
                onClick={() => onOpenRoomDetails(room.id)}
              >
                <div className="room-card-head">
                  <p>Room {room.roomNumber}</p>
                  <span className={`room-status-chip ${room.status}`}>
                    {getAvailabilityLabel(room.status)}
                  </span>
                </div>
                <img
                  className="room-preview"
                  src={room.images?.[0] ?? roomType.image}
                  alt={`${roomType.type} preview`}
                  loading="lazy"
                />
                <h4>{roomType.type}</h4>
                <small>
                  Floor {room.floor} • Type {roomType.code}
                </small>
                <span className="room-detail-link">View full details</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="rooms-empty-state">
          No rooms match the selected filters.
        </p>
      )}
    </section>
  )
}

export default RoomsPage
