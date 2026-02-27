import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useState,
} from "react";
import {
  getRoomById,
  rooms,
  type RoomAvailabilityStatus,
  type RoomInventoryId,
  type RoomInventoryItem,
  type RoomTypeId,
} from "../data/rooms";

type RoomMutationInput = Omit<RoomInventoryItem, "id">;

type RoomDetailPageProps = {
  roomInventory: RoomInventoryItem[];
  roomId: RoomInventoryId;
  onUpdateRoom: (roomId: RoomInventoryId, roomInput: RoomMutationInput) => void;
  onDeleteRoom: (roomId: RoomInventoryId) => void;
  onBackToRooms: () => void;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (typeof fileReader.result === "string") {
        resolve(fileReader.result);
        return;
      }

      reject(new Error("Failed to read file as data URL"));
    };
    fileReader.onerror = () =>
      reject(new Error(`Failed to read "${file.name}"`));
    fileReader.readAsDataURL(file);
  });

const readFilesAsDataUrls = async (files: File[]) =>
  Promise.all(files.map(readFileAsDataUrl));

function RoomDetailPage({
  roomInventory,
  roomId,
  onUpdateRoom,
  onDeleteRoom,
  onBackToRooms,
}: RoomDetailPageProps) {
  const room = roomInventory.find((roomItem) => roomItem.id === roomId);
  const [isEditing, setIsEditing] = useState(false);
  const [draftRoomNumber, setDraftRoomNumber] = useState("");
  const [draftFloor, setDraftFloor] = useState("");
  const [draftTypeId, setDraftTypeId] = useState<RoomTypeId>("standard-room");
  const [draftStatus, setDraftStatus] =
    useState<RoomAvailabilityStatus>("available");
  const [draftImageUrlInput, setDraftImageUrlInput] = useState("");
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [editError, setEditError] = useState("");

  if (!room) {
    return (
      <section className="room-detail-panel">
        <h3>Room Not Found</h3>
        <p className="room-detail-description">
          The selected room is not available.
        </p>
        <button
          type="button"
          className="room-back-button"
          onClick={onBackToRooms}
        >
          Back to Rooms
        </button>
      </section>
    );
  }

  const roomType = getRoomById(room.typeId);

  if (!roomType) {
    return (
      <section className="room-detail-panel">
        <h3>Room Not Found</h3>
        <p className="room-detail-description">
          The selected room details are unavailable.
        </p>
        <button
          type="button"
          className="room-back-button"
          onClick={onBackToRooms}
        >
          Back to Rooms
        </button>
      </section>
    );
  }

  const roomStatusLabel =
    room.status === "available" ? "Available" : "Occupied";
  const roomImages = room.images?.length ? room.images : [roomType.image];
  const activeRoomImage =
    roomImages[activeImageIndex] ?? roomImages[0] ?? roomType.image;

  const handleUpdateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const roomNumber = draftRoomNumber.trim();
    const floor = Number(draftFloor);

    if (!roomNumber) {
      setEditError("Room number is required.");
      return;
    }

    if (!Number.isInteger(floor) || floor < 1) {
      setEditError("Floor must be a valid positive number.");
      return;
    }

    const roomNumberAlreadyExists = roomInventory.some(
      (roomItem) =>
        roomItem.id !== room.id &&
        roomItem.roomNumber.toLowerCase() === roomNumber.toLowerCase(),
    );

    if (roomNumberAlreadyExists) {
      setEditError("Room number already exists.");
      return;
    }

    onUpdateRoom(room.id, {
      roomNumber,
      floor,
      typeId: draftTypeId,
      status: draftStatus,
      images: draftImages,
    });

    setEditError("");
    setIsEditing(false);
  };

  const handleEditImageUrlAdd = () => {
    const nextImageUrl = draftImageUrlInput.trim();
    if (!nextImageUrl) {
      return;
    }

    if (draftImages.includes(nextImageUrl)) {
      setEditError("Image already added.");
      return;
    }

    setDraftImages((currentImages) => [...currentImages, nextImageUrl]);
    setDraftImageUrlInput("");
    setEditError("");
  };

  const handleEditImageUrlKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    handleEditImageUrlAdd();
  };

  const handleEditImageRemove = (imageIndex: number) => {
    setDraftImages((currentImages) =>
      currentImages.filter((_, index) => index !== imageIndex),
    );
  };

  const handleEditImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const uploadedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!uploadedFiles.length) {
      return;
    }

    try {
      const uploadedImages = await readFilesAsDataUrls(uploadedFiles);
      setDraftImages((currentImages) => {
        const nextImages = [...currentImages];
        uploadedImages.forEach((imageUrl) => {
          if (!nextImages.includes(imageUrl)) {
            nextImages.push(imageUrl);
          }
        });
        return nextImages;
      });
      setEditError("");
    } catch {
      setEditError("Failed to upload image.");
    }
  };

  const handleDeleteRoom = () => {
    const shouldDeleteRoom = window.confirm(
      `Delete room ${room.roomNumber}? This action cannot be undone.`,
    );

    if (!shouldDeleteRoom) {
      return;
    }

    onDeleteRoom(room.id);
    onBackToRooms();
  };

  return (
    <section className="room-detail-panel">
      <div className="room-detail-head">
        <div>
          <p className="room-detail-eyebrow">Room {room.roomNumber}</p>
          <h3>{roomType.type}</h3>
          <span className={`room-status-chip ${room.status}`}>
            {roomStatusLabel}
          </span>
        </div>
        <div className="room-detail-actions">
          <button
            type="button"
            className="room-back-button"
            onClick={onBackToRooms}
          >
            Back to Rooms
          </button>
          <button
            type="button"
            className="room-edit-button"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setEditError("");
                return;
              }

              setDraftRoomNumber(room.roomNumber);
              setDraftFloor(String(room.floor));
              setDraftTypeId(room.typeId);
              setDraftStatus(room.status);
              setDraftImages(room.images ? [...room.images] : []);
              setDraftImageUrlInput("");
              setActiveImageIndex(0);
              setIsEditing(true);
              setEditError("");
            }}
          >
            {isEditing ? "Cancel Edit" : "Edit Room"}
          </button>
          <button
            type="button"
            className="room-delete-button"
            onClick={handleDeleteRoom}
          >
            Delete Room
          </button>
        </div>
      </div>

      <div className="room-detail-grid">
        <img
          className="room-detail-image"
          src={activeRoomImage}
          alt={`Room ${room.roomNumber} full detail`}
        />

        <div className="room-detail-body">
          <p className="room-detail-description">{roomType.description}</p>

          <div className="room-detail-stats">
            <article className="room-detail-stat">
              <span>Room Number</span>
              <strong>{room.roomNumber}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Room ID</span>
              <strong>{room.id}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Floor</span>
              <strong>{room.floor}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Status</span>
              <strong>{roomStatusLabel}</strong>
            </article>
            <article className="room-detail-stat">
              <span>Room Type</span>
              <strong>
                {roomType.type} ({roomType.code})
              </strong>
            </article>
            <article className="room-detail-stat">
              <span>Images</span>
              <strong>{room.images?.length ?? 0}</strong>
            </article>
          </div>

          <div className="room-image-gallery-wrap">
            <h4>Room Photos</h4>
            <div className="room-image-gallery">
              {roomImages.map((imageUrl, imageIndex) => (
                <button
                  key={`${imageUrl}-${imageIndex}`}
                  type="button"
                  className={`room-image-thumb-button ${imageIndex === activeImageIndex ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(imageIndex)}
                  aria-label={`View room image ${imageIndex + 1}`}
                >
                  <img
                    className="room-image-thumb"
                    src={imageUrl}
                    alt={`Room ${room.roomNumber} image ${imageIndex + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {isEditing ? (
            <form className="room-edit-form" onSubmit={handleUpdateSubmit}>
              <h4></h4>

              <div className="room-edit-grid">
                <label className="room-edit-field">
                  Room Number
                  <input
                    value={draftRoomNumber}
                    onChange={(event) => setDraftRoomNumber(event.target.value)}
                  />
                </label>

                <label className="room-edit-field">
                  Floor
                  <input
                    type="number"
                    min={1}
                    value={draftFloor}
                    onChange={(event) => setDraftFloor(event.target.value)}
                  />
                </label>

                <label className="room-edit-field">
                  Room Type
                  <select
                    value={draftTypeId}
                    onChange={(event) =>
                      setDraftTypeId(event.target.value as RoomTypeId)
                    }
                  >
                    {rooms.map((roomTypeOption) => (
                      <option key={roomTypeOption.id} value={roomTypeOption.id}>
                        {roomTypeOption.type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="room-edit-field">
                  Status
                  <select
                    value={draftStatus}
                    onChange={(event) =>
                      setDraftStatus(
                        event.target.value as RoomAvailabilityStatus,
                      )
                    }
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </label>

                <label className="room-edit-field room-edit-field-full">
                  Image URL
                  <div className="room-image-url-row">
                    <input
                      value={draftImageUrlInput}
                      onChange={(event) =>
                        setDraftImageUrlInput(event.target.value)
                      }
                      onKeyDown={handleEditImageUrlKeyDown}
                      placeholder="https://example.com/room.jpg"
                    />
                    <button
                      type="button"
                      className="room-add-image"
                      onClick={handleEditImageUrlAdd}
                    >
                      Add Image
                    </button>
                  </div>
                </label>
              </div>

              <div className="room-image-actions">
                <label className="room-upload-label">
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageUpload}
                  />
                </label>
                <button
                  type="button"
                  className="room-clear-image"
                  onClick={() => setDraftImages([])}
                >
                  Remove All Images
                </button>
              </div>

              {draftImages.length ? (
                <div className="room-edit-image-list">
                  {draftImages.map((imageUrl, imageIndex) => (
                    <figure
                      key={`${imageUrl}-${imageIndex}`}
                      className="room-edit-image-item"
                    >
                      <img
                        className="room-edit-image-preview"
                        src={imageUrl}
                        alt={`Edited room preview ${imageIndex + 1}`}
                      />
                      <button
                        type="button"
                        className="room-remove-image"
                        onClick={() => handleEditImageRemove(imageIndex)}
                      >
                        Remove
                      </button>
                    </figure>
                  ))}
                </div>
              ) : null}

              <div className="room-edit-actions">
                <button type="submit" className="room-edit-save">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="room-edit-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setEditError("");
                    setDraftImageUrlInput("");
                    setDraftImages([]);
                    setActiveImageIndex(0);
                  }}
                >
                  Cancel
                </button>
              </div>

              {editError ? (
                <p className="room-form-error">{editError}</p>
              ) : null}
            </form>
          ) : null}

          <div className="room-amenities">
            <h4>Amenities</h4>
            <ul>
              {roomType.amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoomDetailPage;
