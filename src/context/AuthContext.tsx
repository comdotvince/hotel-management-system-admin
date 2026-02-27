import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./authContextShared";

type StoredAdminAccount = AuthUser & {
  password: string;
  createdAt: string;
};

const ADMIN_ACCOUNTS_STORAGE_KEY = "hms_admin_accounts";
const AUTH_SESSION_STORAGE_KEY = "hms_admin_auth_session";

const readStoredAccounts = (): StoredAdminAccount[] => {
  try {
    const rawData = window.localStorage.getItem(ADMIN_ACCOUNTS_STORAGE_KEY);
    if (!rawData) {
      return [];
    }
    const parsedData = JSON.parse(rawData);
    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(
      (item): item is StoredAdminAccount =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.fullName === "string" &&
        typeof item.email === "string" &&
        typeof item.password === "string" &&
        typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
};

const writeStoredAccounts = (accounts: StoredAdminAccount[]) => {
  window.localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

const readSessionUser = (): AuthUser | null => {
  try {
    const rawData = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!rawData) {
      return null;
    }
    const parsedData = JSON.parse(rawData);
    if (
      typeof parsedData === "object" &&
      parsedData !== null &&
      typeof parsedData.id === "number" &&
      typeof parsedData.fullName === "string" &&
      typeof parsedData.email === "string"
    ) {
      return {
        id: parsedData.id,
        fullName: parsedData.fullName,
        email: parsedData.email,
      };
    }
    return null;
  } catch {
    return null;
  }
};

const writeSessionUser = (user: AuthUser | null) => {
  if (!user) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readSessionUser);

  const login: AuthContextValue["login"] = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error("Email and password are required.");
    }

    const accounts = readStoredAccounts();
    const account = accounts.find(
      (admin) =>
        admin.email.trim().toLowerCase() === normalizedEmail &&
        admin.password === password,
    );

    if (!account) {
      throw new Error("Invalid admin credentials.");
    }

    const nextUser: AuthUser = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
    };

    setUser(nextUser);
    writeSessionUser(nextUser);
  };

  const register: AuthContextValue["register"] = async (payload) => {
    const fullName = payload.fullName.trim();
    const normalizedEmail = payload.email.trim().toLowerCase();
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

    const accounts = readStoredAccounts();
    const emailTaken = accounts.some(
      (admin) => admin.email.trim().toLowerCase() === normalizedEmail,
    );

    if (emailTaken) {
      throw new Error("An admin account with this email already exists.");
    }

    const newAccount: StoredAdminAccount = {
      id: Date.now(),
      fullName,
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    const nextAccounts = [newAccount, ...accounts];
    writeStoredAccounts(nextAccounts);

    const nextUser: AuthUser = {
      id: newAccount.id,
      fullName: newAccount.fullName,
      email: newAccount.email,
    };

    setUser(nextUser);
    writeSessionUser(nextUser);
  };

  const logout = () => {
    setUser(null);
    writeSessionUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
