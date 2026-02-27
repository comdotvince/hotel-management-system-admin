import { useEffect, useMemo, useState } from "react";
import BillingCheckoutPage from "./pages/BillingCheckoutPage";
import BookingManagementPage from "./pages/BookingManagementPage";
import DashboardOverviewPage from "./pages/DashboardOverviewPage";
import InStayServicesPage from "./pages/InStayServicesPage";
import ReportsPage from "./pages/ReportsPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import SettingsPage from "./pages/SettingsPage";
import AdminLayout from "./layout/AdminLayout";
import useRooms from "./hooks/useRooms";
import {
  getAdminRouteTitle,
  isAdminRoute,
  type AdminRoute,
} from "./layout/adminRoutes";
import {
  bookingsMock,
  guestsMock,
  serviceCatalogMock,
  serviceChargesMock,
  toLocalIsoDate,
  type BookingStatus,
} from "./data/hmsMockData";
import type { RoomPayload } from "./services/roomService";
import "./styles/admin.css";

const getInitialRoute = (): AdminRoute => {
  const { pathname } = window.location;
  if (isAdminRoute(pathname)) {
    return pathname;
  }

  window.history.replaceState({}, "", "/dashboard");
  return "/dashboard";
};

const getRouteFromPath = (): AdminRoute => {
  const { pathname } = window.location;
  return isAdminRoute(pathname) ? pathname : "/dashboard";
};

function App() {
  const [route, setRoute] = useState<AdminRoute>(getInitialRoute);
  const {
    rooms,
    isLoading: isRoomsLoading,
    mutationType: roomMutationType,
    error: roomError,
    createRoom,
    updateRoom,
    deleteRoom,
    bulkDeleteRooms,
  } = useRooms();
  const [guests] = useState(guestsMock);
  const [bookings, setBookings] = useState(bookingsMock);
  const [serviceCharges, setServiceCharges] = useState(serviceChargesMock);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath());

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextRoute: AdminRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, "", nextRoute);
    }

    setRoute(nextRoute);
  };

  const serviceById = useMemo(
    () =>
      new Map(
        serviceCatalogMock.map((service) => [service.id, service] as const),
      ),
    [],
  );

  const handleUpdateBookingStatus = (
    bookingId: number,
    nextStatus: BookingStatus,
  ) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: nextStatus } : booking,
      ),
    );
  };

  const handleAddServiceCharge = (payload: {
    bookingId: number;
    serviceId: number;
    quantity: number;
  }) => {
    const service = serviceById.get(payload.serviceId);
    if (!service) {
      return;
    }

    setServiceCharges((currentCharges) => [
      ...currentCharges,
      {
        id: currentCharges.length
          ? Math.max(...currentCharges.map((charge) => charge.id)) + 1
          : 1,
        bookingId: payload.bookingId,
        serviceId: payload.serviceId,
        quantity: payload.quantity,
        amount: service.unitPrice * payload.quantity,
        chargedAt: toLocalIsoDate(new Date()),
      },
    ]);
  };

  const handleCreateRoom = async (payload: RoomPayload) => {
    await createRoom(payload);
  };

  const handleUpdateRoom = async (roomId: number, payload: RoomPayload) => {
    await updateRoom(roomId, payload);
  };

  const handleDeleteRoom = async (roomId: number) => {
    await deleteRoom(roomId);
  };

  const handleBulkDeleteRooms = async (roomIds: number[]) => {
    await bulkDeleteRooms(roomIds);
  };

  const pageContent =
    route === "/dashboard" ? (
      <DashboardOverviewPage
        rooms={rooms}
        bookings={bookings}
        guests={guests}
        serviceCharges={serviceCharges}
      />
    ) : route === "/rooms" ? (
      <RoomManagementPage
        rooms={rooms}
        isLoading={isRoomsLoading}
        mutationType={roomMutationType}
        error={roomError}
        onCreateRoom={handleCreateRoom}
        onUpdateRoom={handleUpdateRoom}
        onDeleteRoom={handleDeleteRoom}
        onBulkDeleteRooms={handleBulkDeleteRooms}
      />
    ) : route === "/bookings" ? (
      <BookingManagementPage
        bookings={bookings}
        guests={guests}
        onUpdateBookingStatus={handleUpdateBookingStatus}
      />
    ) : route === "/services" ? (
      <InStayServicesPage
        bookings={bookings}
        guests={guests}
        serviceCatalog={serviceCatalogMock}
        serviceCharges={serviceCharges}
        onAddServiceCharge={handleAddServiceCharge}
      />
    ) : route === "/billing" ? (
      <BillingCheckoutPage
        bookings={bookings}
        guests={guests}
        serviceCatalog={serviceCatalogMock}
        serviceCharges={serviceCharges}
        onUpdateBookingStatus={handleUpdateBookingStatus}
      />
    ) : route === "/reports" ? (
      <ReportsPage
        rooms={rooms}
        bookings={bookings}
        serviceCharges={serviceCharges}
      />
    ) : (
      <SettingsPage />
    );

  return (
    <AdminLayout
      currentRoute={route}
      pageTitle={getAdminRouteTitle(route)}
      onNavigate={navigate}
    >
      {pageContent}
    </AdminLayout>
  );
}

export default App;
