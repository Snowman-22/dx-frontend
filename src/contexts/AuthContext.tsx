import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import axios from "axios";

// ─── Types ───

export interface User {
  id: number;
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  phone: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
}

// ─── Storage Keys ───

const USER_KEY = "lg_auth_user";
const TOKEN_KEY = "lg_auth_token";
const REFRESH_KEY = "lg_auth_refresh";

// ─── API Client ───

const authApi = axios.create({
  baseURL: "/api/auth",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// ─── Context ───

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // user가 바뀔 때 localStorage 동기화
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  }, [user]);

  // ─── Login ───
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authApi.post<{
        user_id: number;
        access_token: string;
        refresh_token: string;
      }>("/login", { email, password });

      // 토큰 저장
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_KEY, data.refresh_token);

      // 유저 정보 설정 (서버에서 user_id만 내려옴, 나머지는 email로 표시)
      setUser({
        id: data.user_id,
        name: email.split("@")[0],
        email,
        gender: "",
        birthDate: "",
        phone: "",
      });

      return true;
    } catch {
      return false;
    }
  }, []);

  // ─── Signup ───
  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    try {
      // 회원가입 API 호출
      await authApi.post("/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender.toUpperCase(), // "male" → "MALE"
        birthDate: data.birthDate,
        phone: data.phone.replace(/\D/g, ""),
        terms_accepted: data.termsAccepted,
        privacy_accepted: data.privacyAccepted,
      });

      // 회원가입 성공 후 자동 로그인
      const loginSuccess = await login(data.email, data.password);
      return loginSuccess;
    } catch {
      return false;
    }
  }, [login]);

  // ─── Logout ───
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Helpers ───

/** 저장된 access_token 반환 (다른 API 호출 시 사용) */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
