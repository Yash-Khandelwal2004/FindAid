"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BorrowModalProps {
  listing: {
    _id: string;
    title: string;
    quantity: number;
    unit: string;
  };
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BorrowModal({
  listing,
  token,
  onClose,
  onSuccess,
}: BorrowModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [needByDate, setNeedByDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    quantity?: string;
    message?: string;
    phone?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (!quantity || quantity < 1) e.quantity = "Quantity must be at least 1";
    if (quantity > listing.quantity)
      e.quantity = `Maximum available is ${listing.quantity}`;
    if (!message.trim()) e.message = "Please explain your need";
    if (!phone.trim()) e.phone = "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing._id,
          quantityRequested: quantity,
          message,
          urgencyLevel: urgency,
          needByDate: needByDate || undefined,
          requesterContact: {
            phone,
            preferredContact: "phone",
          },
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error);
        return;
      }

      onSuccess();
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold">Request to Borrow</h2>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {listing.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="quantity">
              Quantity
              <span className="text-muted-foreground text-xs ml-1">
                (max {listing.quantity} {listing.unit})
              </span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={listing.quantity}
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                if (errors.quantity)
                  setErrors({ ...errors, quantity: undefined });
              }}
              className={errors.quantity ? "border-destructive" : ""}
            />
            {errors.quantity && (
              <p className="text-destructive text-xs">{errors.quantity}</p>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-1.5">
            <Label>Urgency level</Label>
            <div className="grid grid-cols-3 gap-2">
              {["low", "medium", "critical"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`py-2 rounded-lg text-sm border capitalize transition-colors ${
                    urgency === level
                      ? level === "critical"
                        ? "bg-destructive/10 border-destructive/30 text-destructive"
                        : "bg-foreground/10 border-foreground/30 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Need by date */}
          <div className="space-y-1.5">
            <Label htmlFor="needByDate">
              Need by
              <span className="text-muted-foreground text-xs ml-1">
                (optional)
              </span>
            </Label>
            <Input
              id="needByDate"
              type="date"
              value={needByDate}
              onChange={(e) => setNeedByDate(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Your phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-destructive text-xs">{errors.phone}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">Explain your need</Label>
            <textarea
              id="message"
              rows={3}
              placeholder="Why do you need this item? Any relevant medical context..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message)
                  setErrors({ ...errors, message: undefined });
              }}
              className={`w-full bg-input border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring resize-none transition-colors ${
                errors.message ? "border-destructive" : "border-border"
              }`}
            />
            {errors.message && (
              <p className="text-destructive text-xs">{errors.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
