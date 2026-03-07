"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2, Pencil, Trash2, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-400",
  borrowed: "bg-yellow-500/10 text-yellow-400",
  unavailable: "bg-zinc-500/10 text-zinc-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  blood: "text-red-400",
  oxygen: "text-blue-400",
  wheelchair: "text-purple-400",
  medicine: "text-green-400",
  equipment: "text-yellow-400",
  other: "text-zinc-400",
};

export default function MyListingsPage() {
  const router = useRouter();
  const { token, isLoggedIn, isLoading } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login?callbackUrl=/dashboard/my-listings");
    }
  }, [isLoading, isLoggedIn]);

  useEffect(() => {
    if (!token) return;
    fetchListings();
  }, [token]);

  async function fetchListings() {
    try {
      const res = await fetch("/api/listings/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setListings(json.data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error);
        return;
      }

      toast.success("Listing deleted");
      setListings(listings.filter((l) => l._id !== id));
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setDeleting(null);
    }
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/listings/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            You haven't posted any listings yet.
          </p>
          <Button asChild size="sm">
            <Link href="/listings/new">Post your first listing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + urgent */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium line-clamp-1">
                      {listing.title}
                    </h3>
                    {listing.isUrgent && (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className={CATEGORY_COLORS[listing.category]}>
                      {listing.category}
                      {listing.bloodGroup && ` · ${listing.bloodGroup}`}
                    </span>
                    <span>
                      {listing.quantity} {listing.unit}
                    </span>
                    <span>
                      {listing.location.city}, {listing.location.state}
                    </span>
                    <span>{formatRelativeTime(listing.createdAt)}</span>
                    <span>{listing.viewCount} views</span>
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[listing.status]}`}
                  >
                    {listing.status}
                  </span>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                  >
                    <Link href={`/listings/${listing._id}`}>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(listing._id)}
                    disabled={deleting === listing._id}
                  >
                    {deleting === listing._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
