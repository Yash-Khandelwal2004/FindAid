"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, X, Plus, LogOut, User } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

const navLinks = [
  { href: "/listings",  label: "Browse Aid" },
  { href: "/dashboard", label: "Dashboard"  },
]

export default function Navbar() {
  const pathname            = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoggedIn, isLoading, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          <Heart className="w-5 h-5 text-destructive fill-destructive" />
          FindAid
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoading && (
            <>
              {isLoggedIn ? (
                <>
                  {/* Show user name */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/listings/new" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Post Aid
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/listings/new" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Post Aid
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen
            ? <X    className="w-5 h-5" />
            : <Menu className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground py-1"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {isLoggedIn ? (
              <>
                <Button asChild size="sm">
                  <Link href="/listings/new">Post Aid</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/listings/new">Post Aid</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}