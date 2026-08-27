import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/constants/keys";
import { api } from "@/constants/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isSignedIn: false,
  sendMagicLink: async () => {},
  signInWithPassword: async () => {},
  register: async () => {},
  signInWithToken: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted session on startup
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          const res = await fetch(api.me, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (!res.ok) {
            // Session expired — clear it
            await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Ignore errors on startup
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = async (sessionToken: string, sessionUser: AuthUser) => {
    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, sessionToken),
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser)),
    ]);
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const sendMagicLink = useCallback(async (email: string) => {
    const res = await fetch(api.magicLink, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to send magic link");
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const res = await fetch(api.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Invalid email or password");
    await persistSession(data.token, data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await fetch(api.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    await persistSession(data.token, data.user);
  }, []);

  // Called when the magic link deep link resolves with a session token
  const signInWithToken = useCallback(async (sessionToken: string) => {
    const res = await fetch(api.me, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Invalid session token");
    await persistSession(sessionToken, data.user);
  }, []);

  const signOut = useCallback(async () => {
    if (token) {
      fetch(api.logout, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isSignedIn: !!user,
        sendMagicLink,
        signInWithPassword,
        register,
        signInWithToken,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
