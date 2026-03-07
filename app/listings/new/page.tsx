"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { value: "blood", label: "Blood" },
  { value: "oxygen", label: "Oxygen" },
  { value: "wheelchair", label: "Wheelchair" },
  { value: "medicine", label: "Medicine" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs-repair", label: "Needs Repair" },
];

export default function NewListingPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, token } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/listings/new");
      return;
    }
  }, [isLoading, isLoggedIn, router]);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("oxygen");
  const [bloodGroup, setBloodGroup] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("units");
  const [condition, setCondition] = useState("good");
  const [isUrgent, setIsUrgent] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Location fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Dates
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTill, setAvailableTill] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};

    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";
    if (!category) e.category = "Category is required";
    if (category === "blood" && !bloodGroup)
      e.bloodGroup = "Blood group is required";
    if (!quantity || quantity < 1) e.quantity = "Quantity must be at least 1";
    if (!address.trim()) e.address = "Address is required";
    if (!city.trim()) e.city = "City is required";
    if (!state.trim()) e.state = "State is required";
    if (!pincode.trim()) e.pincode = "Pincode is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          bloodGroup: bloodGroup || undefined,
          quantity,
          unit,
          condition,
          isUrgent,
          tags,
          location: {
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          availableFrom: availableFrom || undefined,
          availableTill: availableTill || undefined,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.error);
        return;
      }

      toast.success("Listing created successfully!");
      router.push(`/listings/${json.data._id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Post Aid</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share an item you can lend to someone in need
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic info  */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-medium">Basic Information</h2>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Portable Oxygen Concentrator"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the item, its condition, and any usage notes..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors({ ...errors, description: "" });
              }}
              className={`w-full bg-input border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring resize-none transition-colors ${
                errors.description ? "border-destructive" : "border-border"
              }`}
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    if (cat.value !== "blood") setBloodGroup("");
                  }}
                  className={`py-2 rounded-lg text-sm border transition-colors ${
                    category === cat.value
                      ? "bg-foreground/10 border-foreground/30 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-destructive text-xs">{errors.category}</p>
            )}
          </div>

          {/* Blood group — only show for blood */}
          {category === "blood" && (
            <div className="space-y-1.5">
              <Label>Blood Group</Label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-lg text-sm border transition-colors ${
                      bloodGroup === bg
                        ? "bg-destructive/10 border-destructive/30 text-destructive font-medium"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
              {errors.bloodGroup && (
                <p className="text-destructive text-xs">{errors.bloodGroup}</p>
              )}
            </div>
          )}

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-destructive text-xs">{errors.quantity}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="units, bottles, cylinders..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <div className="grid grid-cols-4 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  className={`py-2 rounded-lg text-sm border transition-colors ${
                    condition === c.value
                      ? "bg-foreground/10 border-foreground/30 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Mark as urgent</p>
              <p className="text-xs text-muted-foreground">
                Urgent listings appear at the top of search results
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isUrgent ? "bg-destructive" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isUrgent ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Location  */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-medium">Location</h2>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street address, building name..."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors({ ...errors, address: "" });
              }}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-destructive text-xs">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Mumbai"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors({ ...errors, city: "" });
                }}
                className={errors.city ? "border-destructive" : ""}
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
                onChange={(e) => {
                  setState(e.target.value);
                  if (errors.state) setErrors({ ...errors, state: "" });
                }}
                className={errors.state ? "border-destructive" : ""}
              />
              {errors.state && (
                <p className="text-destructive text-xs">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              placeholder="400001"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                if (errors.pincode) setErrors({ ...errors, pincode: "" });
              }}
              className={errors.pincode ? "border-destructive" : ""}
            />
            {errors.pincode && (
              <p className="text-destructive text-xs">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* ── Availability  */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-medium">Availability</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="availableFrom">Available from</Label>
              <Input
                id="availableFrom"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="availableTill">
                Available till
                <span className="text-muted-foreground text-xs ml-1">
                  (optional)
                </span>
              </Label>
              <Input
                id="availableTill"
                type="date"
                value={availableTill}
                onChange={(e) => setAvailableTill(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Tags  */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-medium">Tags</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add tags to help people find your listing
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit  */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating listing...
            </>
          ) : (
            "Post Aid Listing"
          )}
        </Button>
      </form>
    </div>
  );
}
