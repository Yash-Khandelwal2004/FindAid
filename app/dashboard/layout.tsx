"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/my-listings",
    label: "My Listings",
    icon: Package,
    exact: false,
  },
  {
    href: "/dashboard/requests",
    label: "Requests",
    icon: ArrowLeftRight,
    exact: false,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Mobile tab bar */}
      <div className="md:hidden flex gap-1 bg-card border border-border rounded-xl p-1 mb-6 ">
        {sidebarLinks.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex gap-10">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-48 shrink-0 ">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
            Dashboard
          </p>
          <nav className="flex flex-col gap-0.5">
            {sidebarLinks.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact
                ? pathname === href
                : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
