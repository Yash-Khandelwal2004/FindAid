"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()

  // Form fields
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [phone,    setPhone]    = useState("")
  const [city,     setCity]     = useState("")
  const [state,    setState]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Field errors
  const [errors, setErrors] = useState<{
    name?:     string
    email?:    string
    phone?:    string
    city?:     string
    state?:    string
    password?: string
    confirm?:  string
  }>({})

  // ── Validate ──────────────────────────────────────────────────────
  function validate() {
    const e: typeof errors = {}

    if (!name.trim())
      e.name = "Name is required"

    if (!email)
      e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address"

    if (!password)
      e.password = "Password is required"
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters"

    if (!confirm)
      e.confirm = "Please confirm your password"
    else if (confirm !== password)
      e.confirm = "Passwords do not match"

    if (!city.trim())
      e.city = "City is required"

    if (!state.trim())
      e.state = "State is required"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     name.trim(),
          email,
          password,
          phone:    phone.trim(),
          city:     city.trim(),
          state:    state.trim(),
        }),
      })
      const json = await res.json()

      if (!json.success) {
        toast.error(json.error)
        return
      }

      toast.success("Account created! Please sign in.")

      // Redirect to login after successful registration
      router.push("/login")

    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Helper to clear a field error on change ───────────────────────
  function clearError(field: keyof typeof errors) {
    if (errors[field]) setErrors({ ...errors, [field]: undefined })
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
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Join FindAid and start sharing emergency aid
        </p>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError("name") }}
              className={errors.name ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email") }}
              className={errors.email ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email}</p>
            )}
          </div>

          {/* Phone — optional */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone
              <span className="text-muted-foreground text-xs ml-1">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* City + State — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Mumbai"
                value={city}
                onChange={(e) => { setCity(e.target.value); clearError("city") }}
                className={errors.city ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-destructive text-xs">{errors.city}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Maharashtra"
                value={state}
                onChange={(e) => { setState(e.target.value); clearError("state") }}
                className={errors.state ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.state && (
                <p className="text-destructive text-xs">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password") }}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
                disabled={isLoading}
              />
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

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type={showPass ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); clearError("confirm") }}
              className={errors.confirm ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.confirm && (
              <p className="text-destructive text-xs">{errors.confirm}</p>
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
                Creating account...
              </>
            ) : (
              "Create account"
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
              Already have an account?
            </span>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Sign in instead</Link>
        </Button>

      </div>
    </div>
  )
}