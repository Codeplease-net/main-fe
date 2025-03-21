import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseFiltersProps {
  searchParams: { [key: string]: string | undefined };
}

export function useFilters({ searchParams }: UseFiltersProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.categories ? searchParams.categories.split(",") : []
  );
  const [currentPage, setCurrentPage] = useState(
    searchParams.page ? parseInt(searchParams.page) : 1
  );

  const updateURL = useCallback((params: URLSearchParams) => {
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const params = new URLSearchParams(searchParams as Record<string, string>);
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      } else {
        params.delete("search");
      }
      updateURL(params);
    }
  };

  const handleCategoriesChange = (value: string[]) => {
    setSelectedCategories(value);
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (value.length > 0) {
      params.set("categories", value.join(","));
    } else {
      params.delete("categories");
    }
    updateURL(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", page.toString());
    updateURL(params);
    setCurrentPage(page);
  };

  // Sync with URL params
  useEffect(() => {
    setSelectedCategories(
      searchParams.categories ? searchParams.categories.split(",") : []
    );
    setSearchTerm(searchParams.search || "");
    setCurrentPage(searchParams.page ? parseInt(searchParams.page) : 1);
  }, [searchParams]);

  return {
    searchTerm,
    selectedCategories,
    currentPage,
    handleSearch,
    handleSearchKeyDown,
    handleCategoriesChange,
    handlePageChange
  };
}