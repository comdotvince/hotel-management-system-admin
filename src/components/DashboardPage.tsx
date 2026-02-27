import AdminLayout from "./AdminLayout";
import {
  getRoomById,
  type RoomInventoryId,
  type RoomInventoryItem,
} from "../data/rooms";
import BookingView from "./BookingView";
import DashboardOverview from "./DashboardOverview";
import RoomDetailPage from "./RoomDetailPage";
import RoomsPage from "../../RoomsPage";

type DashboardView = "overview" | "bookings" | "rooms" | "room-details";
type RoomMutationInput = Omit<RoomInventoryItem, "id">;

type DashboardPageProps = {
  roomInventory: RoomInventoryItem[];
  view: DashboardView;
  roomId?: RoomInventoryId;
  onLogout: () => void;
  onNavigateOverview: () => void;
  onNavigateBookings: () => void;
  onNavigateRooms: () => void;
  onOpenRoomDetails: (roomId: RoomInventoryId) => void;
  onCreateRoom: (roomInput: RoomMutationInput) => void;
  onUpdateRoom: (roomId: RoomInventoryId, roomInput: RoomMutationInput) => void;
  onDeleteRoom: (roomId: RoomInventoryId) => void;
  onBackToRooms: () => void;
};

function DashboardPage({
  roomInventory,
  view,
  roomId,
  onLogout,
  onNavigateOverview,
  onNavigateBookings,
  onNavigateRooms,
  onOpenRoomDetails,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  onBackToRooms,
}: DashboardPageProps) {
  const isOverview = view === "overview";
  const isBookingsView = view === "bookings";
  const selectedRoom =
    view === "room-details" && roomId
      ? (roomInventory.find((room) => room.id === roomId) ?? null)
      : null;
  const selectedRoomType = selectedRoom
    ? getRoomById(selectedRoom.typeId)
    : null;

  const section = isOverview
    ? "overview"
    : isBookingsView
      ? "bookings"
      : "rooms";
  const eyebrow = isOverview
    ? "Dashboard Home"
    : isBookingsView
      ? "Bookings"
      : "Rooms";
  const title = isOverview
    ? "Property Overview"
    : isBookingsView
      ? "Booking Management"
      : selectedRoom && selectedRoomType
        ? `Room ${selectedRoom.roomNumber} Details`
        : "Rooms Management";

  return (
    <AdminLayout
      section={section}
      eyebrow={eyebrow}
      title={title}
      onLogout={onLogout}
      onNavigateOverview={onNavigateOverview}
      onNavigateBookings={onNavigateBookings}
      onNavigateRooms={onNavigateRooms}
    >
      {isOverview ? (
        <DashboardOverview />
      ) : isBookingsView ? (
        <BookingView />
      ) : view === "room-details" && roomId ? (
        <RoomDetailPage
          roomInventory={roomInventory}
          roomId={roomId}
          onUpdateRoom={onUpdateRoom}
          onDeleteRoom={onDeleteRoom}
          onBackToRooms={onBackToRooms}
        />
      ) : (
        <RoomsPage
          roomInventory={roomInventory}
          onOpenRoomDetails={onOpenRoomDetails}
          onCreateRoom={onCreateRoom}
        />
      )}
    </AdminLayout>
  );
}

export default DashboardPage;
