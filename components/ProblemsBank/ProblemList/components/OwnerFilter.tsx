import React, { useState, useMemo, useCallback, useRef, useEffect, KeyboardEvent } from "react";
import { Users, X, Search, Check, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl"; // Import useTranslations

interface OwnerFilterProps {
  owners: string[];
  selectedOwners: string[];
  setSelectedOwners: (owners: string[]) => void;
}

export default function OwnerFilter({
  owners,
  selectedOwners,
  setSelectedOwners,
}: OwnerFilterProps) {
  // Get translations
  const t = useTranslations("ProblemBank.ownerFilter");
  
  const [ownerSearch, setOwnerSearch] = useState("");
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const [chipFocusIndex, setChipFocusIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Memoized filtered owners list
  const filteredOwners = useMemo(() => {
    if (!owners?.length) return [];
    
    return owners
      .filter((owner) => owner && !selectedOwners.includes(owner))
      .filter((owner) => 
        owner.toLowerCase().includes(ownerSearch.toLowerCase())
      );
  }, [owners, selectedOwners, ownerSearch]);

  // Reset focus indices when search query changes
  useEffect(() => {
    setFocusIndex(-1);
    setChipFocusIndex(-1);
    itemRefs.current = [];
  }, [ownerSearch]);

  // Ensure the focused item is visible in the scroll area
  useEffect(() => {
    if (focusIndex >= 0 && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusIndex]);

  const handleSelectOwner = useCallback((owner: string) => {
    setSelectedOwners([...selectedOwners, owner]);
    setOwnerSearch("");
    searchInputRef.current?.focus();
  }, [selectedOwners, setSelectedOwners]);

  const handleRemoveOwner = useCallback((owner: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setSelectedOwners(selectedOwners.filter((o) => o !== owner));
    searchInputRef.current?.focus();
  }, [selectedOwners, setSelectedOwners]);

  const handleClearAll = useCallback(() => {
    setSelectedOwners([]);
    searchInputRef.current?.focus();
  }, [setSelectedOwners]);

  // Handle keyboard navigation
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle navigation through chips
    if (e.key === "ArrowLeft" && ownerSearch === "" && selectedOwners.length > 0) {
      e.preventDefault();
      setChipFocusIndex(selectedOwners.length - 1);
      return;
    }

    // Handle deletion of last chip with backspace
    if (e.key === "Backspace" && ownerSearch === "" && selectedOwners.length > 0) {
      e.preventDefault();
      const lastOwner = selectedOwners[selectedOwners.length - 1];
      handleRemoveOwner(lastOwner);
      return;
    }

    if (
      filteredOwners.length === 0 &&
      !["ArrowDown", "ArrowUp", "Escape"].includes(e.key)
    )
      return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev < filteredOwners.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOwners.length - 1
        );
        break;
      case "Enter":
        if (focusIndex >= 0 && focusIndex < filteredOwners.length) {
          e.preventDefault();
          handleSelectOwner(filteredOwners[focusIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOwnerSearch("");
        break;
    }
  };

  // Handle keyboard interaction on result items
  const handleResultKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    owner: string,
    index: number
  ) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleSelectOwner(owner);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev < filteredOwners.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOwners.length - 1
        );
        break;
      case "Escape":
        e.preventDefault();
        setFocusIndex(-1);
        searchInputRef.current?.focus();
        break;
    }
  };

  // Handle chip keyboard interaction
  const handleChipKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number, owner: string) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (index < selectedOwners.length - 1) {
          setChipFocusIndex(index + 1);
        } else {
          setChipFocusIndex(-1);
          searchInputRef.current?.focus();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (index > 0) {
          setChipFocusIndex(index - 1);
        }
        break;
      case "Backspace":
      case "Delete":
        e.preventDefault();
        handleRemoveOwner(owner);
        if (index > 0) {
          setChipFocusIndex(index - 1);
        } else {
          searchInputRef.current?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        setChipFocusIndex(-1);
        searchInputRef.current?.focus();
        break;
    }
  };

  return (
    <div className="relative flex-1">
      <div className="flex items-center justify-between mb-2">
        {selectedOwners.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("clearAll")}
          </Button>
        )}
      </div>

      {/* Combined search input with selected owner chips */}
      <div className="space-y-2">
        <div 
          ref={inputContainerRef}
          className={cn(
            "flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-background",
            "min-h-10",
            "focus-within:outline-none focus-within:border-input",
            "transition-colors duration-200",
            ownerSearch.trim() !== "" ? "rounded-t-md border-t border-l border-r" : "rounded-md border"
          )}
          onClick={() => searchInputRef.current?.focus()}
        >
          <Users className="h-4 w-4 text-muted-foreground mr-0.5 shrink-0" />
          
          {/* Render selected owner chips inside the input */}
          {selectedOwners.map((owner, index) => (
            <div
              key={owner}
              tabIndex={chipFocusIndex === index ? 0 : -1}
              onKeyDown={(e) => handleChipKeyDown(e, index, owner)}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs",
                "bg-primary/10 text-foreground border border-primary/20",
                chipFocusIndex === index 
                  ? "ring-2 ring-ring ring-offset-1" 
                  : "hover:bg-primary/15 transition-colors"
              )}
            >
              <span>{owner}</span>
              <XCircle
                className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors"
                onClick={(e) => handleRemoveOwner(owner, e)}
              />
            </div>
          ))}
          
          {/* Actual search input */}
          <input
            ref={searchInputRef}
            value={ownerSearch}
            onChange={(e) => setOwnerSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className={cn(
              "flex-1 min-w-[6rem] bg-transparent outline-none",
              "placeholder:text-muted-foreground"
            )}
            placeholder={selectedOwners.length === 0 ? t("searchPlaceholder") : ""}
            aria-label={t("searchAriaLabel")}
            aria-autocomplete="list"
            aria-controls="owner-results"
            role="combobox"
            aria-expanded={ownerSearch.trim() !== ""}
          />
          
          {ownerSearch && (
            <button
              onClick={() => {
                setOwnerSearch("");
                searchInputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label={t("clearSearchAriaLabel")}
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search results panel */}
      {ownerSearch.trim() !== "" && (
        <div
          id="owner-results"
          role="listbox"
          aria-label={t("resultsAriaLabel")}
          className="border rounded-b-md border-border overflow-hidden"
          ref={resultsRef}
        >
          <ScrollArea className="max-h-48">
            {filteredOwners.length > 0 ? (
              filteredOwners.map((owner, index) => (
                <div
                  key={owner}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={focusIndex === index}
                  tabIndex={focusIndex === index ? 0 : -1}
                  onClick={() => handleSelectOwner(owner)}
                  onKeyDown={(e) => handleResultKeyDown(e, owner, index)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 border-b last:border-b-0 border-border",
                    "cursor-pointer transition-colors",
                    focusIndex === index
                      ? "bg-primary/10 outline-none" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{owner}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {t("noResultsFound")}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}