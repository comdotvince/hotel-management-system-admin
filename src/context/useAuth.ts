import { useContext } from "react";
import { AuthContext } from "./authContextShared";

export const useAuth = () => {
  const contextValue = useContext(AuthContext);
  if (!contextValue) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return contextValue;
};
