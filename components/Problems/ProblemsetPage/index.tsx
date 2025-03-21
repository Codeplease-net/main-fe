"use client";
import React, { useEffect, useState } from "react";
import { Search, Loader2, Filter, Plus } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { CategorySection } from "./components/CategorySection";
import { AddProblemDialog } from "./components/AddProblemDialog";
import { useProblems } from "./hooks/problems";
import { useFilters } from "./hooks/filters";
import { useAdminStatus } from "./hooks/useAdminStatus";
import { useTranslations } from "next-intl";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ProblemsetTable } from "./components/ProblemsetTable";

const ITEMS_PER_PAGE = 25;

export default function ProblemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const t = useTranslations("Problems");
  const [userId, setUserId] = useState<string | null>(null);
  const { isAdmin } = useAdminStatus();
  const [addProblemDialogOpen, setAddProblemDialogOpen] = useState(false);

  const {
    searchTerm,
    selectedCategories,
    currentPage,
    handleSearch,
    handleSearchKeyDown,
    handleCategoriesChange,
    handlePageChange,
  } = useFilters({ searchParams });

  const { problems, totalProblems, isLoading, fetchProblems } =
    useProblems(userId);

  // Get current user ID from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  // Fetch problems when filters change
  useEffect(() => {
    fetchProblems({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchParams.search,
      categories: searchParams.categories?.split(","),
    });
  }, [fetchProblems, currentPage, searchParams]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          
          {/* Admin Add Problem Button */}
          {isAdmin && (
            <Button
              onClick={() => setAddProblemDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("addProblem")}
            </Button>
          )}
        </div>
      </div>

      {/* Add Problem Dialog */}
      <AddProblemDialog
        open={addProblemDialogOpen}
        onOpenChange={setAddProblemDialogOpen}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Problem Table Card - Takes 5/7 of the space on large screens */}
          <div className="lg:col-span-5">
            <div className="border rounded-sm bg-card shadow-sm">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t("loading")}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full overflow-x-auto">
                    <ProblemsetTable
                      isAdmin={isAdmin}
                      searchParams={searchParams}
                      ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                      handlePageChange={handlePageChange}
                      totalProblems={totalProblems}
                      currentPage={currentPage}
                      showedproblems={problems}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search Panel - Takes 2/7 of the space on large screens */}
          <div className="lg:col-span-2">
            <div className="border rounded-sm bg-card shadow-sm">
              <div className="border-b bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">{t("filters")}</h3>
                </div>
              </div>

              <div className="p-4 space-y-5">
                {/* Search Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("searchLabel")}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("searchPlaceholder")}
                      value={searchTerm}
                      onChange={handleSearch}
                      onKeyDown={handleSearchKeyDown}
                      className="pl-9 h-10 bg-background/60"
                    />
                  </div>
                </div>

                {/* Categories Section */}
                {CategorySection({
                  selectedCategories,
                  handleCategoriesChange,
                })}

                {/* Problems Count Section */}
                <div className="flex items-center justify-between px-1 pt-2 border-border/40">
                  <label className="text-sm font-medium">
                    {t("problemsCount")}:
                  </label>
                  <div className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      totalProblems.toLocaleString()
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
