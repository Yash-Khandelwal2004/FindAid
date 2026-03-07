"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/listing/ListingCard";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "blood", label: "Blood" },
  { value: "oxygen", label: "Oxygen" },
  { value: "wheelchair", label: "Wheelchair" },
  { value: "medicine", label: "Medicine" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = useCallback(
    async (currentPage = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (bloodGroup) params.set("bloodGroup", bloodGroup);
        if (city) params.set("city", city);
        if (isUrgent) params.set("isUrgent", "true");
        params.set("page", currentPage.toString());
        params.set("limit", "12");

        const res = await fetch(`/api/listings?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          setListings(json.data.listings);
          setTotal(json.data.pagination.total);
          setTotalPages(json.data.pagination.totalPages);
          setPage(currentPage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [search, category, bloodGroup, city, isUrgent],
  );

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setBloodGroup("");
    setCity("");
    setIsUrgent(false);
  }

  const hasActiveFilters = search || category || bloodGroup || city || isUrgent;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Browse Aid</h1>
        <p className="text-muted-foreground text-sm">
          {total > 0 ? `${total} items available` : "No items found"}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, description or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* Category filter */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              category === cat.value
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Urgent toggle */}
        <button
          onClick={() => setIsUrgent(!isUrgent)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            isUrgent
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Urgent only
        </button>

        {/* City search */}
        <Input
          placeholder="Filter by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-36 h-8 text-sm"
        />

        {/* Blood group — only show when category is blood */}
        {category === "blood" && (
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="h-8 px-2 text-sm bg-card border border-border rounded-md text-foreground"
          >
            <option value="">All groups</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Listings grid */}
      {isLoading ? (
        // Skeleton loader
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        // Empty state
        <div className="text-center py-20">
          <p className="text-muted-foreground">No listings found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-destructive mt-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        // Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchListings(page - 1)}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchListings(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
