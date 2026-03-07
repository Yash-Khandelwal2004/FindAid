"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X, Plus, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/listings", label: "Browse Aid" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6 relative">
        {/* Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-base hover:opacity-80 transition-opacity shrink-0"
          >
            <Heart className="w-5 h-5 text-destructive fill-destructive" />
            <span>FindAid</span>
          </Link>
        </div>

        {/* Desktop nav links — centered */}
        <div className="hidden md:flex items-center gap-6 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-3 shrink-0">
          {isLoading ? (
            // Placeholder to prevent layout shift
            <div className="h-8 w-32 rounded-md bg-secondary animate-pulse" />
          ) : isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-3 py-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </div>
              <Button asChild size="sm">
                <Link
                  href="/listings/new"
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Post Aid
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={logout}
                className="flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex flex-1 md:hidden justify-end">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full border-b border-border bg-background shadow-lg">
          <div className="px-6 py-4 flex flex-col gap-1">
            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-sm py-2.5 px-3 rounded-lg transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth actions */}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </div>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/listings/new" onClick={() => setIsOpen(false)}>
                      Post Aid
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Get started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
