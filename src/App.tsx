import { type FormEvent, useEffect, useState } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
  type AdminRoute,
} from "./layout/adminRoutes";
import BookingManagementPage from "./pages/BookingManagementPage";
import DashboardOverviewPage from "./pages/DashboardOverviewPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import type { RoomPayload } from "./services/roomService";
import "./App.css";
import "./styles/admin.css";

type AuthScreen = "login" | "register";

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
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, register, logout } = useAuth();

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
    setAuthScreen("register");
  };

  const handleSwitchToLogin = () => {
    setAuthError(null);
    setAuthScreen("login");
  };

  const handleLogout = () => {
    logout();
    setAuthError(null);
    setAuthScreen("login");
  };

  const authFallback =
    authScreen === "login" ? (
      <LoginPage
        onSubmit={handleLoginSubmit}
        onGoToRegister={handleSwitchToRegister}
        errorMessage={authError}
      />
    ) : (
      <RegisterPage
        onSubmit={handleRegisterSubmit}
        onGoToLogin={handleSwitchToLogin}
        errorMessage={authError}
      />
    );

  const pageContent =
    route === "/dashboard" ? (
      <DashboardOverviewPage
        rooms={rooms}
        bookings={bookings}
        guests={guests}
        serviceCharges={[]}
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
    ) : null;

  return (
    <ProtectedRoute fallback={authFallback}>
      <AdminLayout
        currentRoute={route}
        pageTitle={getAdminRouteTitle(route)}
        onNavigate={navigate}
        onLogout={handleLogout}
      >
        {pageContent}
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default App;
