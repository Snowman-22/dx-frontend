import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "lg_auth_user";
const USERS_KEY = "lg_auth_users";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  phone: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  phone: string;
}

const DEMO_USER: StoredUser = {
  id: "demo-user",
  name: "테스트 사용자",
  email: "demo@lg.com",
  password: "Test1234!",
  gender: "male",
  birthDate: "1995-05-15",
  phone: "01012345678",
};

function readStoredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const users = readStoredUsers();
    if (users.some((storedUser) => storedUser.email === DEMO_USER.email)) {
      return;
    }

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, DEMO_USER]));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const getStoredUsers = (): StoredUser[] => {
    return readStoredUsers();
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser({
        id: found.id,
        name: found.name,
        email: found.email,
        gender: found.gender,
        birthDate: found.birthDate,
        phone: found.phone,
      });
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(
    async (data: SignupData): Promise<boolean> => {
      const users = getStoredUsers();
      if (users.some((u) => u.email === data.email)) {
        return false;
      }
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        birthDate: data.birthDate,
        phone: data.phone,
      };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      setUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
        birthDate: newUser.birthDate,
        phone: newUser.phone,
      });
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
