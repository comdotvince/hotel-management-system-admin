import type { ReactNode } from "react";
import { useAuth } from "../../context/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  fallback: ReactNode;
};

function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
