"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-400",
  approved: "bg-green-500/10 text-green-400",
  active: "bg-yellow-500/10 text-yellow-400",
  returned: "bg-zinc-500/10 text-zinc-400",
  rejected: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

const NEXT_ACTIONS: Record<
  string,
  {
    label: string;
    status: string;
    variant: "default" | "outline" | "destructive";
  }[]
> = {
  pending: [{ label: "Cancel", status: "cancelled", variant: "destructive" }],
  approved: [{ label: "Cancel", status: "cancelled", variant: "destructive" }],
  active: [],
  returned: [],
  rejected: [],
  cancelled: [],
};

const OWNER_ACTIONS: Record<
  string,
  {
    label: string;
    status: string;
    variant: "default" | "outline" | "destructive";
  }[]
> = {
  pending: [
    { label: "Approve", status: "approved", variant: "default" },
    { label: "Reject", status: "rejected", variant: "destructive" },
  ],
  approved: [
    { label: "Mark Handed Over", status: "active", variant: "default" },
  ],
  active: [{ label: "Mark Returned", status: "returned", variant: "default" }],
  returned: [],
  rejected: [],
  cancelled: [],
};

export default function RequestsPage() {
  const router = useRouter();
  const { user, token, isLoggedIn, isLoading } = useAuth();

  const [tab, setTab] = useState<"sent" | "received">("sent");
  const [requests, setRequests] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login?callbackUrl=/dashboard/requests");
    }
  }, [isLoading, isLoggedIn]);

  useEffect(() => {
    if (!token) return;
    fetchRequests();
  }, [token, tab]);

  async function fetchRequests() {
    setIsFetching(true);
    try {
      const role = tab === "sent" ? "requester" : "owner";
      const res = await fetch(`/api/requests?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleAction(requestId: string, newStatus: string) {
    setUpdating(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error);
        return;
      }

      toast.success(`Request ${newStatus}`);
      // Update status in local state
      setRequests(
        requests.map((r) =>
          r._id === requestId ? { ...r, status: newStatus } : r,
        ),
      );
    } catch {
      toast.error("Failed to update request");
    } finally {
      setUpdating(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const actions = tab === "sent" ? NEXT_ACTIONS : OWNER_ACTIONS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your borrow requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("sent")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            tab === "sent"
              ? "bg-background text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sent
        </button>
        <button
          onClick={() => setTab("received")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            tab === "received"
              ? "bg-background text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Received
        </button>
      </div>

      {/* Requests list */}
      {isFetching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {tab === "sent"
              ? "You haven't sent any borrow requests yet."
              : "You haven't received any borrow requests yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-card border border-border rounded-xl p-5 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">
                    {req.listing?.title ?? "Listing removed"}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {tab === "sent" ? (
                      <span>Owner: {req.owner?.name}</span>
                    ) : (
                      <span>
                        From: {req.requester?.name} · {req.requester?.phone}
                      </span>
                    )}
                    <span>{req.quantityRequested} units</span>
                    <span>{formatRelativeTime(req.createdAt)}</span>
                    {req.needByDate && (
                      <span>Need by: {formatDate(req.needByDate)}</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[req.status]}`}
                >
                  {req.status}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                "{req.message}"
              </p>

              {/* Owner note */}
              {req.ownerNote && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Note: </span>
                  {req.ownerNote}
                </p>
              )}

              {/* Action buttons */}
              {actions[req.status]?.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {actions[req.status].map(({ label, status, variant }) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={variant}
                      disabled={updating === req._id}
                      onClick={() => handleAction(req._id, status)}
                    >
                      {updating === req._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        label
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
