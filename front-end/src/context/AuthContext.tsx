"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import TokenService, { User } from "@/services/api/Tokenservice";

interface AuthContextType {
  user: User | null;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (user: any) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = TokenService.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Failed to load user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const syncSessions = (event: StorageEvent) => {
      if (event.key === "user") {
        const updatedUser = TokenService.getUser();
        setUser(updatedUser);
      }
    };

    window.addEventListener("storage", syncSessions);
    return () => window.removeEventListener("storage", syncSessions);
  }, []);

  const login = useCallback((user: User, token: string) => {
    // FIX: Validate parameters to prevent silent failures
    if (!user || !token) {
      console.error("[AuthContext] login() called with invalid parameters");
      return;
    }

    TokenService.setUser(user, token);
    setUser(user);
  }, []);
  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prevUser: User | null) => {
      if (!prevUser) return null;

      const updatedUser = { ...prevUser, ...updatedData };
      // REFACTOR: Keep localStorage in sync with React state
      TokenService.updateUser(updatedUser);
      return updatedUser;
    });
  }, []);

  const logout = useCallback(() => {
    TokenService.removeUser();
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      isLoading,
      isAuthenticated: !!user,
    }),
    [user, isLoading, login, logout, updateUser],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
