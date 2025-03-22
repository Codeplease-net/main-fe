import React from "react";
import { useTranslations } from "next-intl";
import { TestCase } from "@/components/Problems/PlaygroundPage/utils/types";
import { countAccepted } from "@/components/Problems/PlaygroundPage/utils/formatters";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Check,
  X,
  Clock,
  MemoryStick,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  ListFilter,
  Ban,
  SkipForward,
  Award,
  Trophy
} from "lucide-react";
import { abbreviationToFull } from "@/components/Problems/PlaygroundPage/utils/constants";

interface TestResultsProps {
  testCases: TestCase[];
  testCasesCount?: number; // Total test cases count (all tests that would run if none failed)
  scoringMode: boolean; // True if using scoring mode (SC) instead of standard AC mode
}

export default function TestcaseDetail({ testCases, testCasesCount, scoringMode }: TestResultsProps) {
  const t = useTranslations("Playground");
  const t2 = useTranslations("Playground.status");
  
  const passedTests = countAccepted(testCases);
  const displayedTests = testCases?.length || 0;
  const totalTests = testCasesCount || displayedTests;
  const allPassed = passedTests === totalTests && totalTests > 0;
  
  // There are two types of "hidden" tests:
  // 1. Tests that weren't executed because judging was aborted after a failure
  const skippedTests = totalTests - displayedTests;
  const wasAborted = displayedTests < totalTests && !allPassed;
  
  // 2. Tests that were executed but not shown (e.g., hidden by the problem setter)
  const hasHiddenTests = testCasesCount && testCasesCount > displayedTests && !wasAborted;

  // Calculate total score if in scoring mode - using direct score properties
  const totalScore = scoringMode ? testCases.reduce((sum, test) => {
    return sum + (test.result === "AC" ? (test.score || 0) : 0);
  }, 0) : 0;

  // Calculate total possible score - using direct score_config property
  const totalPossibleScore = scoringMode ? testCases.reduce((sum, test) => {
    return sum + (test.score_config || 0);
  }, 0) : 0;

  // Using theme-aligned colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AC":
        return "bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "WA":
        return "bg-destructive/10 text-destructive-foreground dark:bg-destructive/20 dark:text-destructive-foreground";
      case "TLE":
        return "bg-amber-500/10 text-amber-400 dark:bg-amber-500/15 dark:text-amber-400";
      case "MLE":
        return "bg-orange-500/10 text-orange-400 dark:bg-orange-500/15 dark:text-orange-400";
      case "CE":
        return "bg-rose-500/10 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400";
      case "RTE":
        return "bg-destructive/10 text-destructive-foreground dark:bg-destructive/20 dark:text-destructive-foreground";
      default:
        return "bg-secondary/50 text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AC":
        return <Check className="h-3.5 w-3.5" />;
      case "WA":
        return <X className="h-3.5 w-3.5" />;
      case "TLE":
        return <Clock className="h-3.5 w-3.5" />;
      case "MLE":
        return <MemoryStick className="h-3.5 w-3.5" />;
      case "CE":
        return <AlertCircle className="h-3.5 w-3.5" />;
      case "RTE":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5" />;
    }
  };

  return (
    <Card className="border border-border shadow-sm overflow-hidden">
      <CardHeader className="px-5 py-4 flex flex-row items-center justify-between space-y-0 border-b border-border">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            {t("testCases")}
            {(hasHiddenTests || wasAborted) && (
              <CardDescription className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <ListFilter className="h-3 w-3" />
                {wasAborted 
                  ? t("abortedAfterFailedTest", { run: displayedTests, total: totalTests })
                  : t("showingVisibleTests", { visible: displayedTests, total: totalTests })}
              </CardDescription>
            )}
          </CardTitle>
          
          <div className="flex items-center flex-wrap gap-2">
            {/* Passed tests badge */}
            <Badge
              variant="secondary"
              className={cn("px-2 py-0.5 text-xs font-medium", 
                allPassed
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {passedTests}/{totalTests} {t("passed")}
            </Badge>
            
            {/* Scoring badge for scoring mode */}
            {scoringMode && (
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 border-amber-500/20 dark:border-amber-400/20"
              >
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-3 w-3" /> {totalScore}/{totalPossibleScore} {t("points")}
                </span>
              </Badge>
            )}
            
            {/* Overall status badge */}
            <Badge
              variant={allPassed ? "default" : "outline"}
              className={cn("text-xs font-medium px-2 py-0.5 rounded-full", 
                allPassed
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-muted-foreground/30 hover:border-muted-foreground/50 text-muted-foreground"
              )}
            >
              {allPassed ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3 w-3" /> {t("allPassed")}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" /> {t("someFailed")}
                </span>
              )}
            </Badge>
            
            {/* New skipped tests badge */}
            {wasAborted && skippedTests > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-medium px-2 py-0.5 border-amber-500/30 text-amber-500 dark:border-amber-400/30 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-900/10"
              >
                <span className="flex items-center gap-1.5">
                  <SkipForward className="h-3 w-3" /> {skippedTests} {t("skipped")}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-0 pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/5">
                <TableHead className="w-12 text-xs font-medium text-muted-foreground sticky top-0 bg-card z-10 pl-5">
                  #
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground sticky top-0 bg-card z-10">
                  {t("statusText")}
                </TableHead>
                {scoringMode && (
                  <TableHead className="text-xs font-medium text-muted-foreground sticky top-0 bg-card z-10">
                    {t("pointsColumn")}
                  </TableHead>
                )}
                <TableHead className="text-xs font-medium text-muted-foreground text-right sticky top-0 bg-card z-10">
                  {t("time")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-right sticky top-0 bg-card z-10 pr-5">
                  {t("memory")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases?.map((testCase, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/5 transition-colors",
                    testCase.result === "AC" && "bg-primary/5 hover:bg-primary/10",
                    testCase.result !== "AC" && testCase.result !== "IQ" && "bg-destructive/5 hover:bg-destructive/10"
                  )}
                >
                  <TableCell className="pl-5 py-2.5 font-medium text-muted-foreground text-sm">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${getStatusColor(
                        testCase.result
                      )}`}
                    >
                      {getStatusIcon(testCase.result)}
                      <span className="text-xs font-medium">
                        {t2(abbreviationToFull[testCase.result as keyof typeof abbreviationToFull]) || 
                         testCase.result}
                      </span>
                    </div>
                  </TableCell>
                  {scoringMode && (
                    <TableCell className="py-2.5">
                      {testCase.score_config > 0 && (
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={testCase.result === "AC" ? "default" : "outline"}
                            className={cn(
                              "text-xs py-0.5 px-1.5",
                              testCase.result === "AC" 
                                ? "bg-amber-500 text-amber-50"
                                : "border-amber-200/50 text-amber-400/70 dark:border-amber-700/50 dark:text-amber-400/70 bg-transparent"
                            )}
                          >
                            {testCase.result === "AC" ? testCase.score : 0}/{testCase.score_config}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {testCase.time_used !== undefined
                      ? `${testCase.time_used} ms`
                      : "—"}
                  </TableCell>
                  <TableCell className="py-2.5 pr-5 text-right font-mono text-xs text-muted-foreground">
                    {testCase.memory_used !== undefined
                      ? `${(testCase.memory_used / 1024).toFixed(1)} KB`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Render placeholder row for skipped tests if judging was aborted */}
              {wasAborted && (
                <TableRow className="border-b border-border/50 bg-amber-50/5 dark:bg-amber-950/5">
                  <TableCell colSpan={scoringMode ? 5 : 4} className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <SkipForward className="h-3.5 w-3.5" />
                      <span>
                        <strong>{skippedTests}</strong> {t("remainingTestsSkipped")}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {!testCases?.length && (
                <TableRow>
                  <TableCell colSpan={scoringMode ? 5 : 4} className="text-center py-6 text-muted-foreground">
                    {t("noTestCasesAvailable")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {hasHiddenTests && (
            <div className="px-5 py-3 text-xs text-muted-foreground border-t border-border/50 flex items-center justify-center bg-muted/5">
              <ListFilter className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              {t("additionalHiddenTestcases", { count: totalTests - displayedTests })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}