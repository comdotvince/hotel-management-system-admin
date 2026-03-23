import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./authContextShared";

type BackendAdminUser = {
  adminid?: number | string | null;
  id?: number | string | null;
  admin?: string | null;
};

type BackendLoginResponse = {
  message: string;
  user?: BackendAdminUser;
};

const normalizeAdminIdentifier = (value: string) => value.trim().toLowerCase();

const toAuthUser = (user: BackendAdminUser | null | undefined): AuthUser | null => {
  const adminIdentifier =
    typeof user?.admin === "string" ? user.admin.trim() : "";

  if (!adminIdentifier) {
    return null;
  }

  const rawId = user?.adminid ?? user?.id;
  const parsedId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string" && rawId.trim()
        ? Number(rawId)
        : Number.NaN;

  return {
    id: Number.isFinite(parsedId) ? parsedId : 0,
    // The backend currently exposes a single "admin" identifier field,
    // so the admin UI uses that value for both display and login identity.
    fullName: adminIdentifier,
    email: adminIdentifier,
  };
};

const loginAdmin = async (admin: string, password: string) => {
  const response = await api.post<BackendLoginResponse>("/api/admin/login", {
    admin,
    password,
  });

  const nextUser = toAuthUser(response.user);
  if (!nextUser) {
    throw new Error("Login succeeded but no admin profile was returned.");
  }

  return nextUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const profile = await api.get<BackendAdminUser>("/api/admin/me");

        if (!isActive) {
          return;
        }

        setUser(toAuthUser(profile));
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    };

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async (email, password) => {
    const normalizedEmail = normalizeAdminIdentifier(email);

    if (!normalizedEmail || !password) {
      throw new Error("Email and password are required.");
    }

    setIsLoading(true);
    try {
      const nextUser = await loginAdmin(normalizedEmail, password);
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async (payload) => {
      const fullName = payload.fullName.trim();
      const normalizedEmail = normalizeAdminIdentifier(payload.email);
      const password = payload.password;
      const confirmPassword = payload.confirmPassword;

      if (!fullName) {
        throw new Error("Full name is required.");
      }

      if (!normalizedEmail) {
        throw new Error("Email is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      setIsLoading(true);
      try {
        await api.post<{ message: string }>("/api/admin/register", {
          admin: normalizedEmail,
          password,
        });

        const nextUser = await loginAdmin(normalizedEmail, password);
        setUser(nextUser);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    setIsLoading(true);
    try {
      await api.post<{ message: string }>("/api/admin/logout", {});
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isInitializing,
      login,
      register,
      logout,
    }),
    [isInitializing, isLoading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
