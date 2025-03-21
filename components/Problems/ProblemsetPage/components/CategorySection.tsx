import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tag, Search, XCircle, Check } from "lucide-react";
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import categories from "@/utils/categories";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CategorySection = ({
  selectedCategories,
  handleCategoriesChange,
  categoryTitle,
}: {
  selectedCategories: string[];
  handleCategoriesChange: (categories: string[]) => void;
  categoryTitle?: string;
}) => {
  const t = useTranslations("Problems");
  const [selectedCategoriesInside, setSelectedCategoriesInside] = useState<string[]>(selectedCategories);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const [chipFocusIndex, setChipFocusIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Update internal state when prop changes
  useEffect(() => {
    setSelectedCategoriesInside(selectedCategories);
  }, [selectedCategories]);

  // Reset focus indices when search query changes
  useEffect(() => {
    setFocusIndex(-1);
    setChipFocusIndex(-1);
    itemRefs.current = [];
  }, [searchQuery]);

  const allCategories = categories();

  // Get selected category objects for display
  const selectedCategoryObjects = selectedCategoriesInside
    .map((code) => allCategories.find((cat) => cat.code === code))
    .filter(Boolean);

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim()
    ? allCategories.filter(
        (cat) =>
          !selectedCategoriesInside.includes(cat.code) &&
          (cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           cat.code.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const isCategorySelected = (categoryCode: string) =>
    selectedCategoriesInside.includes(categoryCode);

  const handleCategoryClick = (categoryCode: string) => {
    const newCategories = isCategorySelected(categoryCode)
      ? selectedCategoriesInside.filter((code) => code !== categoryCode)
      : [...selectedCategoriesInside, categoryCode];

    setSelectedCategoriesInside(newCategories);
    handleCategoriesChange(newCategories);
    setSearchQuery(""); // Clear search after selection
    searchInputRef.current?.focus();
  };

  const removeCategory = (categoryCode: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const newCategories = selectedCategoriesInside.filter((code) => code !== categoryCode);
    setSelectedCategoriesInside(newCategories);
    handleCategoriesChange(newCategories);
    searchInputRef.current?.focus();
  };

  const clearAllCategories = () => {
    setSelectedCategoriesInside([]);
    handleCategoriesChange([]);
    searchInputRef.current?.focus();
  };

  // Ensure the focused item is visible in the scroll area
  useEffect(() => {
    if (focusIndex >= 0 && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [focusIndex]);

  // Handle keyboard navigation
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle navigation through chips
    if (e.key === "ArrowLeft" && searchQuery === "" && selectedCategoryObjects.length > 0) {
      e.preventDefault();
      setChipFocusIndex(selectedCategoryObjects.length - 1);
      return;
    }

    // Handle deletion of last chip with backspace
    if (e.key === "Backspace" && searchQuery === "" && selectedCategoryObjects.length > 0) {
      e.preventDefault();
      const lastCategory = selectedCategoryObjects[selectedCategoryObjects.length - 1];
      if (lastCategory) {
        removeCategory(lastCategory.code);
      }
      return;
    }

    if (
      filteredCategories.length === 0 &&
      !["ArrowDown", "ArrowUp", "Escape"].includes(e.key)
    )
      return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        break;
      case "Enter":
        if (focusIndex >= 0 && focusIndex < filteredCategories.length) {
          e.preventDefault();
          handleCategoryClick(filteredCategories[focusIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSearchQuery("");
        break;
    }
  };

  // Handle keyboard interaction on result items
  const handleResultKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    categoryCode: string,
    index: number
  ) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleCategoryClick(categoryCode);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCategories.length - 1
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
  const handleChipKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number, categoryCode: string) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (index < selectedCategoryObjects.length - 1) {
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
        removeCategory(categoryCode);
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
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium mb-2">
          {categoryTitle || t("categoriesTitle")}
        </h3>
        {selectedCategoriesInside.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllCategories}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("clearAll")}
          </Button>
        )}
      </div>

      {/* Combined search input with selected category chips */}
      <div className="space-y-2">
        <div 
          ref={inputContainerRef}
          className={cn(
            "flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-background",
            "min-h-10",
            "focus-within:outline-none focus-within:border-input",
            "transition-colors duration-200",
            searchQuery.trim() !== "" ? "rounded-t-md border-t border-l border-r" : "rounded-md border"
          )}
          onClick={() => searchInputRef.current?.focus()}
        >
          <Search className="h-4 w-4 text-muted-foreground mr-0.5 shrink-0" />
          
          {/* Render selected category chips inside the input */}
          {selectedCategoryObjects.map((category, index) => 
            category && (
              <div
                key={category.code}
                tabIndex={chipFocusIndex === index ? 0 : -1}
                onKeyDown={(e) => handleChipKeyDown(e, index, category.code)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs",
                  "bg-primary/10 text-foreground border border-primary/20",
                  chipFocusIndex === index 
                    ? "ring-2 ring-ring ring-offset-1" 
                    : "hover:bg-primary/15 transition-colors"
                )}
              >
                <span>{category.name}</span>
                <XCircle
                  className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={(e) => removeCategory(category.code, e)}
                />
              </div>
            )
          )}
          
          {/* Actual search input */}
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className={cn(
              "flex-1 min-w-[6rem] bg-transparent outline-none",
              "placeholder:text-muted-foreground"
            )}
            placeholder={
              selectedCategoryObjects.length == 0 ? t("searchCategory") : ""
            }
            aria-label="Search categories"
            aria-autocomplete="list"
            aria-controls="category-results"
            role="combobox"
            aria-expanded={searchQuery.trim() !== ""}
          />
          
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="Clear search"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Line-by-line search results with keyboard navigation */}
      {searchQuery.trim() !== "" && (
        <div
          id="category-results"
          role="listbox"
          aria-label="Category search results"
          className="border rounded-b-md border-border overflow-hidden"
          ref={resultsRef}
        >
          <ScrollArea className="max-h-48">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <div
                  key={category.code}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={focusIndex === index}
                  tabIndex={focusIndex === index ? 0 : -1}
                  onClick={() => handleCategoryClick(category.code)}
                  onKeyDown={(e) => handleResultKeyDown(e, category.code, index)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 border-b last:border-b-0 border-border",
                    "cursor-pointer transition-colors",
                    focusIndex === index
                      ? "bg-primary/10 outline-none" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{category.name}</span>
                  </div>
                  
                  {isCategorySelected(category.code) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No matching categories found
              </div>
            )}
          </ScrollArea>
        </div>
      )}

    </div>
  );
};