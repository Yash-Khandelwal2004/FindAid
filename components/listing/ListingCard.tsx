import Link from "next/link"
import { MapPin, Clock, AlertCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

 
const CATEGORY_LABELS: Record<string, string> = {
  blood:       "Blood",
  oxygen:      "Oxygen",
  wheelchair:  "Wheelchair",
  medicine:    "Medicine",
  equipment:   "Equipment",
  other:       "Other",
}

const CATEGORY_COLORS: Record<string, string> = {
  blood:       "bg-red-500/10 text-red-400 border-red-500/20",
  oxygen:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  wheelchair:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  medicine:    "bg-green-500/10 text-green-400 border-green-500/20",
  equipment:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  other:       "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const STATUS_COLORS: Record<string, string> = {
  available:   "bg-green-500/10 text-green-400",
  borrowed:    "bg-yellow-500/10 text-yellow-400",
  unavailable: "bg-zinc-500/10 text-zinc-400",
}

interface ListingCardProps {
  listing: {
    _id:       string
    title:     string
    category:  string
    bloodGroup?: string
    condition: string
    status:    string
    isUrgent:  boolean
    quantity:  number
    unit:      string
    location: {
      city:  string
      state: string
    }
    owner: {
      name: string
    }
    createdAt: string
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing._id}`}
      className="block bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/50 transition-colors group"
    >
      {/* Top row — category + urgent badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[listing.category]}`}>
          {CATEGORY_LABELS[listing.category]}
          {listing.bloodGroup && ` · ${listing.bloodGroup}`}
        </span>
        {listing.isUrgent && (
          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Urgent
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-foreground group-hover:text-foreground/80 transition-colors mb-1 line-clamp-1">
        {listing.title}
      </h3>

      {/* Quantity + condition */}
      <p className="text-muted-foreground text-sm mb-3">
        {listing.quantity} {listing.unit} · {listing.condition} condition
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="w-3.5 h-3.5" />
          {listing.location.city}, {listing.location.state}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[listing.status]}`}>
          {listing.status}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          by {listing.owner.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(listing.createdAt)}
        </span>
      </div>
    </Link>
  )
}