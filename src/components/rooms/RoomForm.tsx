import { useState, type ChangeEvent, type FormEvent } from "react";
import AppModal from "../AppModal";
import type { RoomRecord, RoomStatus, RoomType } from "../../data/hmsMockData";
import type { RoomPayload } from "../../services/roomService";
import {
  getCloudinaryConfigurationError,
  uploadImageToCloudinary,
} from "../../services/cloudinaryService";

type RoomFormMode = "create" | "edit";

type RoomFormProps = {
  isOpen: boolean;
  mode: RoomFormMode;
  initialRoom: RoomRecord | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: RoomPayload) => Promise<void> | void;
};

type RoomFormErrors = Partial<
  Record<"roomNumber" | "capacity" | "pricePerNight" | "description", string>
>;

const amenityOptions = [
  "WiFi",
  "Smart TV",
  "Air Conditioning",
  "Mini Bar",
  "Mini Fridge",
  "Balcony",
  "Bathtub",
  "Work Desk",
];

const roomTypeOptions: RoomType[] = ["Single", "Double", "Suite", "Deluxe"];
const roomStatusOptions: RoomStatus[] = [
  "available",
  "occupied",
  "maintenance",
];

const getStatusLabel = (status: RoomStatus) =>
  status === "available"
    ? "Available"
    : status === "occupied"
      ? "Occupied"
      : "Maintenance";


function RoomForm({
  isOpen,
  mode,
  initialRoom,
  isSubmitting,
  onClose,
  onSubmit,
}: RoomFormProps) {
  const cloudinaryConfigurationError = getCloudinaryConfigurationError();
  const [roomNumber, setRoomNumber] = useState(initialRoom?.roomNumber ?? "");
  const [roomType, setRoomType] = useState<RoomType>(
    initialRoom?.roomType ?? "Single",
  );
  const [capacity, setCapacity] = useState(initialRoom?.capacity ?? 1);
  const [pricePerNight, setPricePerNight] = useState(
    initialRoom?.pricePerNight ?? 1,
  );
  const [status, setStatus] = useState<RoomStatus>(
    initialRoom?.status ?? "available",
  );
  const [description, setDescription] = useState(
    initialRoom?.description ?? "",
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialRoom?.amenities ?? [],
  );
  const [images, setImages] = useState<string[]>(initialRoom?.images ?? []);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [errors, setErrors] = useState<RoomFormErrors>({});

  const validate = () => {
    const nextErrors: RoomFormErrors = {};

    if (!roomNumber.trim()) {
      nextErrors.roomNumber = "Room number is required.";
    }

    if (capacity < 1) {
      nextErrors.capacity = "Capacity must be at least 1.";
    }

    if (pricePerNight <= 0) {
      nextErrors.pricePerNight = "Price per night must be greater than 0.";
    }

    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((currentAmenities) =>
      currentAmenities.includes(amenity)
        ? currentAmenities.filter((item) => item !== amenity)
        : [...currentAmenities, amenity],
    );
  };

  const handleLocalImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.length) {
      return;
    }

    setImageUploadError(null);
    setIsUploadingImages(true);

    try {
      const uploadedUrls = await Promise.all(
        Array.from(selectedFiles).map((file) => uploadImageToCloudinary(file)),
      );

      setImages((currentImages) => {
        const uniqueImages = new Set(currentImages);
        uploadedUrls.forEach((url) => uniqueImages.add(url));
        return [...uniqueImages];
      });
    } catch (uploadError) {
      setImageUploadError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload image files.",
      );
    } finally {
      setIsUploadingImages(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (imagePath: string) => {
    setImages((currentImages) =>
      currentImages.filter((currentImage) => currentImage !== imagePath),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    await onSubmit({
      roomNumber: roomNumber.trim(),
      roomType,
      capacity,
      pricePerNight,
      status,
      description: description.trim(),
      amenities,
      images,
    });
  };

  return (
    <AppModal
      isOpen={isOpen}
      title={
        mode === "create"
          ? "Add New Room"
          : `Edit Room ${initialRoom?.roomNumber ?? ""}`
      }
      onClose={onClose}
    >
      <form className="hms-room-form" onSubmit={handleSubmit}>
        <div className="hms-form-grid">
          <label className="hms-field">
            Room Number
            <input
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
              placeholder="e.g. 101"
            />
            {errors.roomNumber ? (
              <span className="hms-field-error">{errors.roomNumber}</span>
            ) : null}
          </label>

          <label className="hms-field">
            Room Type
            <select
              value={roomType}
              onChange={(event) => setRoomType(event.target.value as RoomType)}
            >
              {roomTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="hms-field">
            Capacity
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value) || 1)}
            />
            {errors.capacity ? (
              <span className="hms-field-error">{errors.capacity}</span>
            ) : null}
          </label>

          <label className="hms-field">
            Price / Night (PHP)
            <input
              type="number"
              min={1}
              value={pricePerNight}
              onChange={(event) =>
                setPricePerNight(Number(event.target.value) || 1)
              }
            />
            {errors.pricePerNight ? (
              <span className="hms-field-error">{errors.pricePerNight}</span>
            ) : null}
          </label>

          <label className="hms-field">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as RoomStatus)}
            >
              {roomStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="hms-field">
          Description
          <textarea
            className="hms-textarea"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {errors.description ? (
            <span className="hms-field-error">{errors.description}</span>
          ) : null}
        </label>

        <div className="hms-field">
          <span className="hms-field-label">Amenities</span>
          <div className="hms-amenity-grid">
            {amenityOptions.map((amenity) => (
              <label key={amenity} className="hms-checkbox-field">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div className="hms-field">
          <span className="hms-field-label">Room Images</span>

          <label className="hms-field">
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleLocalImageUpload}
              disabled={isUploadingImages || Boolean(cloudinaryConfigurationError)}
            />
            {isUploadingImages ? (
              <span className="hms-empty-text">
                Uploading to Cloudinary...
              </span>
            ) : null}
            {cloudinaryConfigurationError ? (
              <span className="hms-field-error">
                {cloudinaryConfigurationError}
              </span>
            ) : null}
            {imageUploadError ? (
              <span className="hms-field-error">{imageUploadError}</span>
            ) : null}
          </label>

          <div className="hms-room-image-grid">
            {images.map((imagePath, index) => (
              <article
                key={`${imagePath}-${index}`}
                className="hms-room-image-card"
              >
                <img src={imagePath} alt="Room preview" />
                <button
                  type="button"
                  className="hms-ghost-button"
                  onClick={() => handleRemoveImage(imagePath)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="hms-button-row">
          <button
            type="submit"
            className="hms-primary-button"
            disabled={isSubmitting || isUploadingImages}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Room"
                : "Update Room"}
          </button>
          <button
            type="button"
            className="hms-ghost-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </AppModal>
  );
}

export default RoomForm;
