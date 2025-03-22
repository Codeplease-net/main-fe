"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, X, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale, useTranslations } from "next-intl";
import DifficultyBox from "../../../ui/difficulty";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadges";
import { Problem } from "../types/interfaces";
import { getAuth } from "firebase/auth";
import { Pagination } from "./Pagination";
import { useRouter } from "next/navigation";
import categories from "@/utils/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/api/Readfirebase";

// Define submission status interface with the correct result types from the API
interface SubmissionStatus {
  id: string;
  result: "AC" | "WA" | "TLE" | "MLE" | "CE" | "RTE" | "IQ";
  lastSubmission: Date | null;
}

export function ProblemsetTable({
  ITEMS_PER_PAGE,
  showedproblems,
  currentPage,
  totalProblems,
  handlePageChange,
  searchParams,
  isAdmin
}: {
  isAdmin: boolean;
  searchParams: { [key: string]: string | undefined };
  ITEMS_PER_PAGE: number;
  showedproblems: Problem[];
  currentPage: number;
  totalProblems: number;
  handlePageChange: (page: number) => void;
}) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Problems");
  const user = getAuth().currentUser;
  const [problemStatuses, setProblemStatuses] = useState<{
    [key: string]: SubmissionStatus;
  }>({});
  const __categories = categories();
  const [isLoading, setIsLoading] = useState(true);
  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processingDelete, setProcessingDelete] = useState(false);

  const getCategoryName = (categoryCode: string) => {
    const category = __categories.find((c) => c.code === categoryCode);
    return category ? category.name : categoryCode;
  };

  // Fetch submission status for the current user
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const form = new FormData();
        form.append("start", "1");
        form.append("end", "100000");
        form.append("user", user.uid);

        // Only request problems that are being displayed
        if (showedproblems.length > 0) {
          const problemIds = showedproblems.map((p) => p.id).join(",");
          form.append("problems", problemIds);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/database/list_from_start_to_end`,
          form
        );

        // Process submissions and create a status map for each problem
        const statusMap: { [key: string]: SubmissionStatus } = {};
        const submissionsByProblem: { [key: string]: any[] } = {};

        response.data.forEach((submission: any) => {
          const problemId = submission.problem;
          if (!submissionsByProblem[problemId]) {
            submissionsByProblem[problemId] = [];
          }
          submissionsByProblem[problemId].push(submission);
        });

        Object.keys(submissionsByProblem).forEach((problemId) => {
          submissionsByProblem[problemId].sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          const hasAccepted = submissionsByProblem[problemId].some(
            (sub: any) => sub.result === "AC"
          );

          if (hasAccepted) {
            statusMap[problemId] = {
              id: problemId,
              result: "AC",
              lastSubmission: new Date(
                submissionsByProblem[problemId][0].created_at
              ),
            };
          } else {
            const latestSubmission = submissionsByProblem[problemId][0];
            statusMap[problemId] = {
              id: problemId,
              result: latestSubmission.result as any,
              lastSubmission: new Date(latestSubmission.created_at),
            };
          }
        });

        setProblemStatuses(statusMap);
      } catch (error) {
        console.error("Error fetching submission status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, showedproblems]);

  // Render status icon based on submission status
  const renderStatusIcon = (problemId: string) => {
    const status = problemStatuses[problemId];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center w-6 h-6">
          <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
        </div>
      );
    }

    if (!status) {
      return (
        <div className="flex items-center justify-center w-6 h-6 opacity-30">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
        </div>
      );
    }

    switch (status.result) {
      case "AC":
        return (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="focus:outline-none">
                <div className="flex items-center justify-center w-6 h-6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{t("solvedProblem")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "WA":
        return (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="focus:outline-none">
                <div className="flex items-center justify-center w-6 h-6">
                  <X className="w-4 h-4 text-red-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{t("incorrectSolution")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "TLE":
        return (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="focus:outline-none">
                <div className="flex items-center justify-center w-6 h-6">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{t("timeLimitExceeded")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="focus:outline-none">
                <div className="flex items-center justify-center w-6 h-6">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{t("submissionFailed")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  const handleDeleteClick = (problemId: string) => {
    setDeletingProblemId(problemId);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProblemId) return;

    try {
      setProcessingDelete(true);
      const problemRef = doc(db, "problem-permissions", deletingProblemId);
      await updateDoc(problemRef, {public: false});
      router.refresh();
    } catch (error) {
      console.error("Error hiding problem:", error);
      toast.error(t("admin.hideProblemError"));
    } finally {
      setProcessingDelete(false);
      setConfirmDialogOpen(false);
      setDeletingProblemId(null);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-muted/10">
              <TableHead className="w-14 text-center py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("statusColumn")}
              </TableHead>
              <TableHead className="py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("titleColumn")}
              </TableHead>
              <TableHead className="hidden sm:table-cell py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("categoryColumn")}
              </TableHead>
              <TableHead className="w-24 text-center py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("difficultyColumn")}
              </TableHead>
              {isAdmin && (
                <TableHead className="w-10 text-center py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("actionsColumn")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {showedproblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">{t("noProblemsFound")}</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {t("tryAdjustingFilters")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              showedproblems.map((problem, index) => (
                <TableRow
                  key={problem.id}
                  className={cn(
                    "transition-colors",
                    index % 2 === 0 ? "bg-muted/[0.01]" : "bg-transparent",
                    "hover:bg-muted/5"
                  )}
                >
                  <TableCell className="text-center py-3.5 px-4">
                    {renderStatusIcon(problem.id)}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div
                      className={cn(
                        "group flex flex-col gap-0.5",
                        "transition-all duration-200",
                        problemStatuses[problem.id]?.result === "AC" &&
                          "text-emerald-600/90 dark:text-emerald-400/90"
                      )}
                    >
                      <div>
                        <Link href={`/problems/${problem.id}`}>
                          <span
                            className={cn(
                              "font-medium text-sm leading-snug",
                              "hover:text-primary/90 hover:underline hover:underline-offset-2"
                            )}
                          >
                            {(problem.title && problem.title[
                              locale as keyof typeof problem.title
                            ]) || problem.displayTitle}
                          </span>
                        </Link>
                      </div>

                      {/* Only show displayTitle if it's different from the localized title */}
                      {problem.title && (problem.title[locale as keyof typeof problem.title] &&
                        problem.title[locale as keyof typeof problem.title] !==
                          problem.displayTitle && (
                          <span className="text-xs text-muted-foreground font-normal truncate">
                            {problem.displayTitle}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {problem.categories.map((category, idx) => (
                        <div
                          key={`${problem.id}-${category}-${idx}`}
                          className="cursor-pointer"
                          onClick={() => {
                            const params = new URLSearchParams(
                              searchParams as Record<string, string>
                            );
                            params.set("categories", category);
                            router.push(`?${params.toString()}`, {
                              scroll: false,
                            });
                          }}
                        >
                          <CategoryBadge
                            category={getCategoryName(category)}
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    <div className="flex items-center justify-center">
                      <DifficultyBox difficulty={problem.difficulty} />
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-center py-3.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteClick(problem.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{t("admin.hideProblemTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showedproblems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalProblems / ITEMS_PER_PAGE)}
          onPageChange={handlePageChange}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.hideProblemTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.hideProblemDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingDelete}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={processingDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {processingDelete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("admin.processing")}
                </>
              ) : (
                t("admin.hideProblem")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
