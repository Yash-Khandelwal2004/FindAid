"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  Package,
  AlertCircle,
  ArrowLeft,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import BorrowModal from "@/components/request/BorrowModal";

const CATEGORY_COLORS: Record<string, string> = {
  blood: "bg-red-500/10 text-red-400 border-red-500/20",
  oxygen: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  wheelchair: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  medicine: "bg-green-500/10 text-green-400 border-green-500/20",
  equipment: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  other: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  borrowed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  unavailable: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoggedIn } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBorrow, setShowBorrow] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        const json = await res.json();

        if (!json.success) {
          toast.error(json.error);
          router.push("/listings");
          return;
        }

        setListing(json.data);
      } catch {
        toast.error("Failed to load listing");
        router.push("/listings");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) fetchListing();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-card rounded w-3/4" />
          <div className="h-4 bg-card rounded w-1/2" />
          <div className="h-48 bg-card rounded" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const isOwner = user?.id === listing.owner._id;
  const canBorrow = isLoggedIn && !isOwner && listing.status === "available";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-card border border-border rounded-xl p-6">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[listing.category]}`}
              >
                {listing.category}
                {listing.bloodGroup && ` · ${listing.bloodGroup}`}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[listing.status]}`}
              >
                {listing.status}
              </span>
              {listing.isUrgent && (
                <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Urgent
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold mb-2">{listing.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                {listing.quantity} {listing.unit} · {listing.condition}{" "}
                condition
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {listing.location.city}, {listing.location.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(listing.createdAt)}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Location card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-medium mb-3">Location</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{listing.location.address}</p>
              <p>
                {listing.location.city}, {listing.location.state} —{" "}
                {listing.location.pincode}
              </p>
            </div>
          </div>

          {/* Tags */}
          {listing.tags?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-medium mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar  */}
        <div className="space-y-4">
          {/* Borrow card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-medium mb-4">Request this item</h2>

            {!isLoggedIn ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to request this item
                </p>
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/login?callbackUrl=/listings/${listing._id}`)
                  }
                >
                  Sign in to borrow
                </Button>
              </div>
            ) : isOwner ? (
              <p className="text-sm text-muted-foreground">
                This is your listing
              </p>
            ) : listing.status !== "available" ? (
              <p className="text-sm text-muted-foreground">
                This item is currently {listing.status}
              </p>
            ) : (
              <Button className="w-full" onClick={() => setShowBorrow(true)}>
                Request to Borrow
              </Button>
            )}

            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
              <p>👁 {listing.viewCount} views</p>
              <p>📅 Available from {formatDate(listing.availableFrom)}</p>
              {listing.availableTill && (
                <p>📅 Available till {formatDate(listing.availableTill)}</p>
              )}
            </div>
          </div>

          {/* Owner card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-medium mb-4">Posted by</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{listing.owner.name}</p>
                <p className="text-xs text-muted-foreground">
                  {listing.owner.location?.city},{" "}
                  {listing.owner.location?.state}
                </p>
              </div>
            </div>
            {listing.owner.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {listing.owner.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Borrow modal */}
      {showBorrow && (
        <BorrowModal
          listing={listing}
          token={token!}
          onClose={() => setShowBorrow(false)}
          onSuccess={() => {
            setShowBorrow(false);
            toast.success("Borrow request submitted!");
          }}
        />
      )}
    </div>
  );
}
