import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token:
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isLoading: false });
    window.location.href = "/login";
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const data = await api.get<{ user: User }>("/auth/me");
      set({ user: data.user, token, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const data = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token, isLoading: false });
  },

  signup: async (email, password, name) => {
    const data = await api.post<{ token: string; user: User }>(
      "/auth/signup",
      { email, password, name }
    );
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token, isLoading: false });
  },
}));
