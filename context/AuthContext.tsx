"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

interface User {
  id:    string
  name:  string
  email: string
  city:  string
  state: string
}

interface AuthContextValue {
  user:       User | null
  token:      string | null
  isLoggedIn: boolean
  isLoading:  boolean
  login:      (token: string, user: User) => void
  logout:     () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user,      setUser]      = useState<User | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Read from localStorage on mount ───────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser  = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("user",  JSON.stringify(newUser))
    document.cookie = `auth-token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    setToken(newToken)
    setUser(newUser)
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    document.cookie = "auth-token=; path=/; max-age=0"
    setToken(null)
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}