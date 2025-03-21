"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/api/Readfirebase";
import getProblems from "./api/problemApi";
import {
  Book,
  Users,
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  XCircle,
  LockKeyhole,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OwnerFilter from "./components/OwnerFilter";
import ProblemSetTable from "./components/ProblemsetTable";
import { useRouter } from "next/navigation";
import { NewProblemForm } from "./components/NewProblemForm";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { useTranslations } from "next-intl";

interface Problem {
  id: string;
  owner: string;
  createdAt: number;
  numberOfTestCases: number;
  availableLanguages: string[];
  displayTitle?: string;
}

export default function ProblemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  // Get translations for the page
  const t = useTranslations("ProblemBank");
  
  const router = useRouter();
  const { user, userRole, isLoadingUser } = useAuth(); // Get user and loading state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [isLoading, setIsLoading] = useState(true);
  const [totalProblems, setTotalProblems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [allOwners, setAllOwners] = useState<string[]>([]);
  const [userHandle, setUserHandle] = useState<string>("");

  // Pagination
  const pageSize = 20;
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;

  // Filters
  const selectedOwners = searchParams.owners
    ? searchParams.owners.split(",")
    : [];

  // Check if user is admin or problem-setter
  const isAdmin = userRole === "admin";
  const isProblemSetter = userRole === "problem-setter";

  // Fetch user handle when user is authenticated
  useEffect(() => {
    async function fetchUserHandle() {
      if (user && (isProblemSetter || isAdmin)) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.handle) {
              setUserHandle(userData.handle);
            }
          }
        } catch (err) {
          console.error("Error fetching user handle:", err);
        }
      }
    }

    fetchUserHandle();
  }, [user, isProblemSetter, isAdmin]);

  // Update owner filter handler
  const handleOwnerFilter = (owners: string[]) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);

    if (owners.length > 0) {
      params.set("owners", owners.join(","));
    } else {
      params.delete("owners");
    }

    // Reset to first page when changing filters
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  const fetchProblems = async () => {
    // Don't fetch if still loading user data
    if (isLoadingUser) return;
    
    setIsLoading(true);
    try {
      // Pass filters and pagination params to getProblems
      const filters = {
        search: searchParams.search || "",
        owners: isProblemSetter ? [userHandle || ""] : selectedOwners, // Use handle for problem-setters
        page: currentPage,
        pageSize: pageSize,
      };

      const result = await getProblems(filters);
      if (!result || typeof result !== "object") {
        throw new Error("Fetched data is invalid");
      }

      setProblems(result.problems);
      setTotalProblems(result.total);
      setHasMore(result.hasMore);

      // Count unique owners from the total set (not just current page)
      if (result.allOwners) {
        setAllOwners(result.allOwners);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for user authentication before fetching problems
  useEffect(() => {
    if (!isLoadingUser) {
      fetchProblems();
    }
  }, [isLoadingUser, searchParams.search, searchParams.owners, searchParams.page, userHandle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams as Record<string, string>);

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    // Reset to first page when searching
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      goToPage(currentPage + 1);
    }
  };

  // Show loading state while determining authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h2 className="text-xl font-medium">{t("loading.title")}</h2>
          <p className="text-muted-foreground">{t("loading.description")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 bg-dot-pattern">
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {t("title")}
                </h1>
                {/* Show role indicator */}
                {isAdmin && (
                  <Badge variant="outline" className="bg-primary/10 gap-1">
                    <Shield className="h-3 w-3" />
                    {t("roles.admin")}
                  </Badge>
                )}
                {isProblemSetter && (
                  <Badge variant="outline" className="bg-primary/10 gap-1">
                    <LockKeyhole className="h-3 w-3" />
                    {t("roles.problemSetter")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {t("description")}
              </p>
            </div>
            <NewProblemForm onSuccess={fetchProblems} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
          {/* Right Content - Problem List */}
          <div className="space-y-4 problem-table">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{t("problemsSection.title")}</h2>
              <div className="text-sm text-muted-foreground">
                {t("problemsSection.showing", {
                  start: problems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0,
                  end: (currentPage - 1) * pageSize + problems.length,
                  total: totalProblems
                })}
              </div>
            </div>

            <Card className=" bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {t("problemsSection.loadingProblems")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ProblemSetTable
                    showedproblems={problems}
                    onDelete={fetchProblems}
                  />
                )}

                {/* Pagination Controls */}
                {!isLoading && problems.length > 0 && (
                  <div className="flex items-center justify-between p-4">
                    <div className="text-sm text-muted-foreground">
                      {t("pagination.page", { page: currentPage })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">
                          {t("pagination.previous")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={!hasMore}
                      >
                        <span className="sr-only md:not-sr-only md:mr-2">
                          {t("pagination.next")}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!isLoading && problems.length === 0 && (
                  <div className="py-12 px-4 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Book className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {t("problemsSection.noProblems.title")}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || selectedOwners.length > 0
                        ? t("problemsSection.noProblems.withFilters")
                        : t("problemsSection.noProblems.noFilters")}
                    </p>
                    {searchTerm || selectedOwners.length > 0 ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          router.push("?");
                        }}
                      >
                        {t("filters.clearFilters")}
                      </Button>
                    ) : (
                      <NewProblemForm onSuccess={fetchProblems}>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t("actions.addProblem")}
                        </Button>
                      </NewProblemForm>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Left Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Stats Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("overview.title")}
                  </h2>
                  {isLoading && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card/50 backdrop-blur-sm border hover:border-primary/50 transition-colors group">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground group-hover:text-foreground">
                        {t("overview.totalProblems")}
                        <Book className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <div className="text-2xl font-bold">
                          {totalProblems}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border hover:border-primary/50 transition-colors group">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground group-hover:text-foreground">
                        {isProblemSetter 
                          ? t("overview.myProblems")
                          : t("overview.contributors")}
                        {isProblemSetter ? (
                          <LockKeyhole className="h-4 w-4 text-primary" />
                        ) : (
                          <Users className="h-4 w-4 text-primary" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      {isLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <div className="text-2xl font-bold">
                          {isProblemSetter ? totalProblems : allOwners.length}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Filters Section */}
              <Card className="bg-card/50 backdrop-blur-sm border hover:border-primary/50 transition-colors group">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground group-hover:text-foreground">
                    {t("filters.title")}
                    <Search className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-4">
                  <form onSubmit={handleSearch} className="space-y-2">
                    <div
                      className={cn(
                        "flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-background",
                        "min-h-10",
                        "focus-within:outline-none focus-within:border-input",
                        "transition-colors duration-200",
                        "rounded-md border"
                      )}
                      onClick={() =>
                        document.getElementById("problem-search-input")?.focus()
                      }
                    >
                      <Search className="h-4 w-4 text-muted-foreground mr-0.5 shrink-0" />

                      <input
                        id="problem-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                          "flex-1 min-w-[6rem] bg-transparent outline-none",
                          "placeholder:text-muted-foreground"
                        )}
                        placeholder={t("filters.searchPlaceholder")}
                        aria-label={t("filters.searchAriaLabel")}
                      />

                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm("");
                            document
                              .getElementById("problem-search-input")
                              ?.focus();
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                          aria-label={t("filters.clearSearch")}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </form>
                  
                  {/* Only show owner filter for admins */}
                  {isAdmin && (
                    <OwnerFilter
                      owners={allOwners}
                      selectedOwners={selectedOwners}
                      setSelectedOwners={handleOwnerFilter}
                    />
                  )}

                  {/* Active filters */}
                  {(selectedOwners.length > 0 || searchParams.search) && (
                    <div className="pt-3 border-t border-border/50 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {t("filters.activeFilters")}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchParams.search && (
                          <Badge
                            variant="secondary"
                            className="group bg-secondary/70 backdrop-blur-sm"
                          >
                            {t("filters.searchLabel")}: {searchParams.search}
                            <button
                              className="ml-1.5 text-muted-foreground group-hover:text-destructive"
                              onClick={() => {
                                setSearchTerm("");
                                const params = new URLSearchParams(
                                  searchParams as Record<string, string>
                                );
                                params.delete("search");
                                params.set("page", "1");
                                router.push(`?${params.toString()}`);
                              }}
                            >
                              <X className="inline-block h-3 w-3" />
                            </button>
                          </Badge>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setSearchTerm("");
                            router.push("?page=1");
                          }}
                        >
                          {t("filters.clearAll")}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:hidden">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.scrollTo({
                      top:
                        document
                          .querySelector(".problem-table")
                          ?.getBoundingClientRect().top ||
                        0 + window.scrollY - 100,
                      behavior: "smooth",
                    })
                  }
                >
                  {t("actions.viewProblems")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}