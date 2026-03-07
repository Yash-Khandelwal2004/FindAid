"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()

  const [email,     setEmail]     = useState("")
  const [password,  setPassword]  = useState("")
  const [showPass,  setShowPass]  = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [errors, setErrors] = useState<{
    email?:    string
    password?: string
  }>({})

  function validate() {
    const e: typeof errors = {}

    if (!email)
      e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address"

    if (!password)
      e.password = "Password is required"
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      })
      const json = await res.json()

      if (!json.success) {
        toast.error(json.error)
        return
      }

      localStorage.setItem("token", json.data.token)
      localStorage.setItem("user",  JSON.stringify(json.data.user))

      toast.success("Welcome back!")
      router.push("/dashboard")

    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in to your FindAid account
        </p>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                disabled={isLoading}
              />
              {/* Show/hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye    className="w-4 h-4" />
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">
              New to FindAid?
            </span>
          </div>
        </div>

        {/* Register link */}
        <Button asChild variant="outline" className="w-full">
          <Link href="/register">Create an account</Link>
        </Button>

      </div>
    </div>
  )
}