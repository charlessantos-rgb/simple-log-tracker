import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Usuario, getSession, setSession, clearSession, verificarLogin } from "@/lib/rnc-types";

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (username: string, password: string, persist?: boolean) => boolean;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  function login(username: string, password: string, persist = false) {
    const u = verificarLogin(username, password);
    if (!u) return false;
    setSession(u, persist);
    setUser(u);
    return true;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  function refresh() {
    setUser(getSession());
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
