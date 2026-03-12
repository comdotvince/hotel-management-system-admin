import { type FormEvent, useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import { useAuth } from "./context/useAuth";
import {
  bookingsMock,
  guestsMock,
  type BookingStatus,
} from "./data/hmsMockData";
import useRooms from "./hooks/useRooms";
import AdminLayout from "./layout/AdminLayout";
import {
  getAdminRouteTitle,
  isAdminRoute,
  isAuthRoute,
  type AppRoute,
} from "./layout/adminRoutes";
import BookingManagementPage from "./pages/BookingManagementPage";
import DashboardOverviewPage from "./pages/DashboardOverviewPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import type { RoomPayload } from "./services/roomService";
import "./styles/tokens.css";
import "./components/Dashboard/Dashboard.css";
import "./components/Rooms/Rooms.css";
import "./components/Booking/Booking.css";
import "./styles/admin.css";

const resolveRoute = (pathname: string): AppRoute => {
  if (isAuthRoute(pathname)) return pathname;
  if (isAdminRoute(pathname)) return pathname;
  return "/login";
};

function App() {
  const { isAuthenticated, login, register, logout } = useAuth();
  const [route, setRoute] = useState<AppRoute>(() =>
    resolveRoute(window.location.pathname),
  );
  const [authError, setAuthError] = useState<string | null>(null);

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

  const navigate = (nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, "", nextRoute);
    }
    setRoute(nextRoute);
  };

  /* ── Compute effective route (redirect if auth state mismatches) ── */
  let effectiveRoute: AppRoute = route;
  if (isAuthenticated && isAuthRoute(route)) {
    effectiveRoute = "/dashboard";
  } else if (!isAuthenticated && isAdminRoute(route)) {
    effectiveRoute = "/login";
  }

  /* ── Keep URL bar in sync when redirecting ── */
  useEffect(() => {
    if (window.location.pathname !== effectiveRoute) {
      window.history.replaceState({}, "", effectiveRoute);
    }
  }, [effectiveRoute]);

  /* ── Browser back / forward ── */
  useEffect(() => {
    const handlePopState = () => {
      const next = resolveRoute(window.location.pathname);

      if (isAuthenticated && isAuthRoute(next)) {
        window.history.replaceState({}, "", "/dashboard");
        setRoute("/dashboard");
        return;
      }
      if (!isAuthenticated && isAdminRoute(next)) {
        window.history.replaceState({}, "", "/login");
        setRoute("/login");
        return;
      }

      setRoute(next);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated]);

  /* ── Booking status update ── */
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

  /* ── Room CRUD ── */
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

  /* ── Auth handlers ── */
  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await login(email, password);
      setAuthError(null);
      event.currentTarget.reset();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to log in.",
      );
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await register({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });
      setAuthError(null);
      event.currentTarget.reset();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to register admin.",
      );
    }
  };

  const handleSwitchToRegister = () => {
    setAuthError(null);
    navigate("/register");
  };

  const handleSwitchToLogin = () => {
    setAuthError(null);
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    setAuthError(null);
    navigate("/login");
  };

  /* ── Auth screens (unauthenticated) ── */
  if (!isAuthenticated) {
    if (effectiveRoute === "/register") {
      return (
        <RegisterPage
          onSubmit={handleRegisterSubmit}
          onGoToLogin={handleSwitchToLogin}
          errorMessage={authError}
        />
      );
    }

    return (
      <LoginPage
        onSubmit={handleLoginSubmit}
        onGoToRegister={handleSwitchToRegister}
        errorMessage={authError}
      />
    );
  }

  /* ── Authenticated admin pages ── */
  const adminRoute = isAdminRoute(effectiveRoute) ? effectiveRoute : "/dashboard";

  const pageContent =
    adminRoute === "/dashboard" ? (
      <DashboardOverviewPage
        rooms={rooms}
        bookings={bookings}
        guests={guests}
        serviceCharges={[]}
      />
    ) : adminRoute === "/rooms" ? (
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
    ) : adminRoute === "/bookings" ? (
      <BookingManagementPage
        bookings={bookings}
        guests={guests}
        onUpdateBookingStatus={handleUpdateBookingStatus}
      />
    ) : null;

  return (
    <AdminLayout
      currentRoute={adminRoute}
      pageTitle={getAdminRouteTitle(adminRoute)}
      onNavigate={(r) => navigate(r)}
      onLogout={handleLogout}
    >
      {pageContent}
    </AdminLayout>
  );
}

export default App;
