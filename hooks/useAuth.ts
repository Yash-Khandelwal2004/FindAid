"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id:    string
  name:  string
  email: string
  city:  string
  state: string
}

interface UseAuthReturn {
  user:       User | null
  token:      string | null
  isLoggedIn: boolean
  isLoading:  boolean
  logout:     () => void
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()

  const [user,      setUser]      = useState<User | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Read from localStorage on mount
    const storedToken = localStorage.getItem("token")
    const storedUser  = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return {
    user,
    token,
    isLoggedIn: !!token,
    isLoading,
    logout,
  }
}