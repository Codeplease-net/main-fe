import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Trash2,
  FileText,
  CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { doc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/api/Readfirebase";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl"; // Import useTranslations
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Modified to use locale from translations
const formatDate = (timestamp: number, locale: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Modified to use locale from translations
const getRelativeTime = (timestamp: number, locale: string): string => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const now = new Date();
  const diff = timestamp - now.getTime();

  // Convert to absolute values for comparison
  const absDiff = Math.abs(diff);
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Create appropriate signed values for formatting
  const sign = diff < 0 ? -1 : 1;

  if (days > 30) {
    return formatDate(timestamp, locale);
  } else if (days > 0) {
    return rtf.format(sign * days, "day");
  } else if (hours > 0) {
    return rtf.format(sign * hours, "hour");
  } else if (minutes > 0) {
    return rtf.format(sign * minutes, "minute");
  } else {
    return "just now"; // This will be replaced by translation
  }
};

interface Problem {
  id: string;
  owner: string;
  createdAt: number;
  numberOfTestCases?: number;
  displayTitle?: string;
}

interface TestCasesProps {
  index: number;
  input: string;
  output: string;
  score: number;
}

interface ConfigProps {
  memory_limit: number;
  time_limit: number;
  type_of_judging: "AC" | "SC";
  short_name: string;
  test_cases: TestCasesProps[];
  num_testcases?: number;
}

interface ProblemSetTableProps {
  showedproblems: Problem[];
  onDelete: () => void;
}

interface TestCaseInfo {
  [problemId: string]: {
    config: ConfigProps | null;
    loading: boolean;
    error: boolean;
  };
}

export default function ProblemSetTable({
  showedproblems,
  onDelete,
}: ProblemSetTableProps) {
  // Get translations
  const t = useTranslations("ProblemBank.problemTable");
  const tCommon = useTranslations("Common");
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [testCaseInfo, setTestCaseInfo] = useState<TestCaseInfo>({});
  const [confirmationInput, setConfirmationInput] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const { toast } = useToast();
  
  // Get current locale for date formatting
  const locale = tCommon("locale");

  useEffect(() => {
    const fetchTestCaseCounts = async () => {
      const initialState: TestCaseInfo = {};
      showedproblems.forEach((problem) => {
        initialState[problem.id] = {
          config: null,
          loading: true,
          error: false,
        };
      });

      setTestCaseInfo(initialState);

      for (const problem of showedproblems) {
        try {
          const form = new FormData();
          form.append("name", problem.id);
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/problems/get_problem_config`,
            form
          );

          setTestCaseInfo((prev) => ({
            ...prev,
            [problem.id]: {
              config: response.data,
              loading: false,
              error: false,
            },
          }));
        } catch (error) {
          console.error(
            `Error fetching test case config for ${problem.id}:`,
            error
          );
          setTestCaseInfo((prev) => ({
            ...prev,
            [problem.id]: {
              config: null,
              loading: false,
              error: true,
            },
          }));
        }
      }
    };

    fetchTestCaseCounts();
  }, [showedproblems]);

  useEffect(() => {
    if (!isDialogOpen) {
      setConfirmationInput("");
    }
  }, [isDialogOpen]);

  const handleDelete = async (problemId: string) => {
    setIsDeleting(problemId);
    try {
      const form = new FormData();
      form.append("name", problemId);
      await axios.post(
        process.env.NEXT_PUBLIC_JUDGE0_API_KEY + "/problems/delete",
        form
      );
  
      // Delete problem document
      const problemRef = doc(db, "problems", problemId);
      await deleteDoc(problemRef);
      
      // Delete problem permissions
      const problemPermissionsRef = doc(db, "problem-permissions", problemId);
      await deleteDoc(problemPermissionsRef);
      
      // Get current user's ID for the log
      const currentUser = auth.currentUser;
      
      // Log deletion to Firebase with auto-generated ID
      await addDoc(collection(db, "logs"), {
        action: "problem_deleted",
        problemId: problemId,
        problemTitle: activeProblem?.displayTitle || problemId,
        deletedBy: currentUser?.uid || "unknown_user", // Use current user ID
        deletedByEmail: currentUser?.email || "unknown_email", // Optional: also log email for easier identification
        problemOwner: activeProblem?.owner, // Keep the original owner info
        timestamp: serverTimestamp(),
        metadata: {
          testCasesCount: testCaseInfo[problemId]?.config?.num_testcases || 
                        testCaseInfo[problemId]?.config?.test_cases?.length || 0,
          judgeType: testCaseInfo[problemId]?.config?.type_of_judging || "unknown"
        }
      });
  
      toast({
        title: t("deleteSuccess.title"),
        description: t("deleteSuccess.description"),
      });
      onDelete();
    } catch (error) {
      console.error("Error deleting problem:", error);
      toast({
        title: t("deleteError.title"),
        description: t("deleteError.description"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setIsDialogOpen(false);
      setActiveProblem(null);
    }
  };

  const getJudgeTypeBadge = (type: string) => {
    switch (type) {
      case "SC":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 font-normal"
          >
            {t("judgeTypes.scoring")}
          </Badge>
        );
      case "AC":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 font-normal"
          >
            {t("judgeTypes.standard")}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 font-normal"
          >
            {type || t("judgeTypes.unknown")}
          </Badge>
        );
    }
  };

  return (
    <div className="border rounded-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[30%]">{t("tableHeaders.problem")}</TableHead>
            <TableHead className="w-[20%] hidden md:table-cell">
              {t("tableHeaders.owner")}
            </TableHead>
            <TableHead className="w-[45%] hidden sm:table-cell">
              {t("tableHeaders.detail")}
            </TableHead>
            <TableHead className="w-[5%] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showedproblems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-50" />
                  <p>{t("noProblemsFound")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            showedproblems.map((problem) => (
              <TableRow
                key={problem.id}
                className="group transition-colors hover:bg-muted/50"
              >
                <TableCell className="py-3.5">
                  <div
                    className={cn(
                      "group flex flex-col gap-0.5",
                      "transition-all duration-200"
                    )}
                  >
                    <div>
                      <Link
                        href={`/problems-bank/${problem.id}`}
                        target="_blank"
                      >
                        <span
                          className={cn(
                            "font-medium text-sm leading-snug",
                            "hover:text-primary/90 hover:underline hover:underline-offset-2"
                          )}
                        >
                          {problem.displayTitle || problem.id}
                        </span>
                      </Link>
                    </div>
                    {problem.displayTitle && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {problem.id}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-3 hidden md:table-cell">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center mr-2 text-xs font-medium">
                      {problem.owner.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{problem.owner}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3 hidden sm:table-cell">
                  {testCaseInfo[problem.id]?.loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t("loadingConfiguration")}
                      </span>
                    </div>
                  ) : testCaseInfo[problem.id]?.error ? (
                    <div className="text-sm text-muted-foreground">
                      {t("noConfigurationAvailable")}
                    </div>
                  ) : testCaseInfo[problem.id]?.config ? (
                    <div className="space-y-2">
                      {/* Problem specifications */}
                      <div className="flex items-center flex-wrap gap-2">
                        {getJudgeTypeBadge(
                          testCaseInfo[problem.id]?.config?.type_of_judging ||
                            ""
                        )}

                        <div className="h-4 border-r border-gray-200"></div>

                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {testCaseInfo[problem.id]?.config?.num_testcases ||
                              testCaseInfo[problem.id]?.config?.test_cases
                                ?.length ||
                              0}
                          </span>{" "}
                          {t("specs.tests")}
                        </div>

                        <div className="h-4 border-r border-gray-200"></div>

                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {testCaseInfo[problem.id]?.config?.time_limit ||
                              1000}
                          </span>{" "}
                          {t("specs.ms")}
                        </div>

                        <div className="h-4 border-r border-gray-200"></div>

                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {testCaseInfo[problem.id]?.config?.memory_limit ||
                              256}
                          </span>{" "}
                          {t("specs.mb")}
                        </div>
                      </div>

                      {/* Problem metadata */}
                      <div className="flex flex-wrap gap-x-4 items-center">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 mr-1.5" />
                          <span>
                            {t("created")} {getRelativeTime(problem.createdAt, locale)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {t("noConfigurationAvailable")}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right py-3">
                  <AlertDialog 
                    open={isDialogOpen && activeProblem?.id === problem.id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) {
                        setActiveProblem(problem);
                      } else {
                        setActiveProblem(null);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        disabled={isDeleting === problem.id}
                      >
                        {isDeleting === problem.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          {t("deleteDialog.title")}: {problem.displayTitle || problem.id}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                          <p>{t("deleteDialog.warning")}</p>
                          
                          <div className="bg-muted/50 p-4 rounded-md border mt-2">
                            <p className="text-sm font-medium mb-3">
                              {t("deleteDialog.confirmPrompt")} <span className="font-mono text-foreground">{problem.id}</span> {t("deleteDialog.toConfirm")}
                            </p>
                            <Input
                              value={confirmationInput}
                              onChange={(e) => setConfirmationInput(e.target.value)}
                              placeholder={t("deleteDialog.confirmPlaceholder")}
                              className="font-mono"
                              autoComplete="off"
                              spellCheck="false"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-opacity"
                          disabled={confirmationInput !== problem.id || isDeleting === problem.id}
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirmationInput === problem.id) {
                              handleDelete(problem.id);
                            }
                          }}
                          data-matching={confirmationInput === problem.id ? "true" : "false"}
                        >
                          {isDeleting === problem.id ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t("deleteDialog.deletingStatus")}
                            </span>
                          ) : (
                            t("deleteDialog.confirmButton")
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}