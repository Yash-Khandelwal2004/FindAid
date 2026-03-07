"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeftRight, Plus, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-400",
  borrowed: "bg-yellow-500/10 text-yellow-400",
  unavailable: "bg-zinc-500/10  text-zinc-400",
  pending: "bg-blue-500/10  text-blue-400",
  approved: "bg-green-500/10 text-green-400",
  active: "bg-yellow-500/10 text-yellow-400",
  returned: "bg-zinc-500/10  text-zinc-400",
  rejected: "bg-red-500/10   text-red-400",
  cancelled: "bg-zinc-500/10  text-zinc-400",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoggedIn, isLoading } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!token) {
      setIsFetching(false);
      return;
    }

    async function fetchData() {
      try {
        const [listingsRes, requestsRes] = await Promise.all([
          fetch("/api/listings/mine", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/requests?role=requester", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!listingsRes.ok || !requestsRes.ok) {
          console.error("Failed to fetch dashboard data");
          return;
        }

        const [listingsJson, requestsJson] = await Promise.all([
          listingsRes.json(),
          requestsRes.json(),
        ]);

        if (listingsJson.success) setListings(listingsJson.data.listings);
        if (requestsJson.success) setRequests(requestsJson.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    }

    fetchData();
  }, [token]);

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome header */}
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        {user?.city && user?.state && (
          <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {user.city}, {user.state}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/my-listings"
          className="bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/50 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              My Listings
            </span>
          </div>
          <p className="text-3xl font-bold">{listings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {listings.filter((l) => l.status === "available").length} available
          </p>
        </Link>

        <Link
          href="/dashboard/requests"
          className="bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/50 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              My Requests
            </span>
          </div>
          <p className="text-3xl font-bold">{requests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {requests.filter((r) => r.status === "pending").length} pending
          </p>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link href="/listings/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post Aid
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/listings">Browse Aid</Link>
        </Button>
      </div>

      {/* Recent requests */}
      {requests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Recent Requests</h2>
            <Link
              href="/dashboard/requests"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {requests.slice(0, 3).map((req: any) => (
              <div
                key={req._id}
                className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-1">
                    {req.listing?.title ?? "Listing removed"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(req.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 capitalize ${
                    STATUS_COLORS[req.status] ?? "bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {requests.length === 0 && listings.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">Nothing here yet</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Post your first aid listing or browse items near you.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="sm">
              <Link href="/listings/new">Post a listing</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/listings">Browse aid</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
