import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { LoginResponse, RegisterResponse, ProfileResponse } from "@/types/api";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));

          const profile: ProfileResponse = await api.getProfile();
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data: LoginResponse = await api.login(email, password);

      localStorage.setItem("access_token", data.access_token);
      
      // Fetch user profile after successful login
      try {
        const profile: ProfileResponse = await api.getProfile();
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      } catch (error) {
        // If profile fetch fails, clear token and throw
        localStorage.removeItem("access_token");
        throw new Error("Failed to fetch user profile");
      }

      navigate("/");
    } catch (error: any) {
      // Extract error message from API response
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password. Please check and try again.");
      } else if (error.response?.status === 404) {
        throw new Error("Account not found. Please check your email.");
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error("Login failed. Please try again.");
      }
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const data: RegisterResponse = await api.register(email, password, displayName);

    localStorage.setItem("access_token", data.access_token);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    navigate("/");
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth");
  };

  const refreshProfile = async () => {
    try {
      const profile: ProfileResponse = await api.getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
