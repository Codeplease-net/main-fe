"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/api/Readfirebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CalendarClock,
  FileText,
  Filter,
  Loader2,
  Search,
  Trash,
  User,
  PlusCircle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// Types for the log data
interface BaseLogEntry {
  id?: string;
  action: string;
  timestamp: Timestamp;
  problemId: string;
  problemTitle: string;
}

interface ProblemCreatedLog extends BaseLogEntry {
  action: "problem_created";
  createdBy: string;
  createdByEmail: string;
  metadata: {
    judgingType: string;
    memoryLimit: number;
    timeLimit: number;
  };
}

interface ProblemDeletedLog extends BaseLogEntry {
  action: "problem_deleted";
  deletedBy: string;
  deletedByEmail: string;
  metadata: {
    judgeType: string;
    testCasesCount: number;
  };
  problemOwner: string;
}

interface OtherLogEntry extends BaseLogEntry {
  action: "problem_updated" | "problem_tested" | string;
  metadata?: any; // Added optional metadata property for consistency
}

type LogEntry = ProblemCreatedLog | ProblemDeletedLog | OtherLogEntry;

const PAGE_SIZE = 10;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [filterValue, setFilterValue] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const t = useTranslations("logs");
  const locale = useLocale();

  // Function to format date based on locale
  const formatDate = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  };

  // Function to format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, "second");
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
      }
    } catch (err) {
      console.error("Relative time formatting error:", err);
      return "Unknown time";
    }
  };

  // Fetch logs from Firebase
  const fetchLogs = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
        setLogs([]);
      } else {
        setIsLoadingMore(true);
      }

      // Start building the query
      const baseQuery = collection(db, "logs");
      let finalQuery;

      // No action filter - all logs
      if (!isInitial && lastVisible) {
        // With pagination
        finalQuery = query(
          baseQuery,
          orderBy("timestamp", "desc"),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
      } else {
        // Initial query without filter
        finalQuery = query(
          baseQuery,
          orderBy("timestamp", "desc"),
          limit(PAGE_SIZE)
        );
      }

      const querySnapshot = await getDocs(finalQuery);

      if (querySnapshot.empty) {
        setHasMore(false);
        if (isInitial) {
          setLogs([]);
        }
      } else {
        // Update the last visible document for pagination
        const lastVisibleDoc =
          querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);

        const fetchedLogs = querySnapshot.docs.map((doc) => {
          const data = doc.data() as LogEntry;
          return {
            ...data,
            id: doc.id,
          };
        });

        if (isInitial) {
          setLogs(fetchedLogs);
        } else {
          setLogs((prev) => [...prev, ...fetchedLogs]);
        }

        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(t("fetchError"));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchLogs(true);
  }, []);

  // Filter logs when search value changes
  const filteredLogs = useMemo(() => {
    if (!searchValue.trim()) return logs;

    const searchLower = searchValue.toLowerCase().trim();
    return logs.filter((log) => {
      return (
        log.problemId?.toLowerCase().includes(searchLower) ||
        log.problemTitle?.toLowerCase().includes(searchLower) ||
        (log.action === "problem_created" &&
          (log as ProblemCreatedLog).createdByEmail
            ?.toLowerCase()
            .includes(searchLower)) ||
        (log.action === "problem_deleted" &&
          (log as ProblemDeletedLog).deletedByEmail
            ?.toLowerCase()
            .includes(searchLower))
      );
    });
  }, [logs, searchValue]);

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    // Apply additional filtering logic here if needed
  };

  // Render log list function
  const renderLogsList = (logs: LogEntry[]) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!isLoading && logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("noLogs")}</h3>
          <p className="text-muted-foreground text-center max-w-md mt-2">
            {t("noLogsMessage")}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {logs.map((log, index) => (
          <div
            key={`${log.id || index}`}
            className="flex items-start space-x-4"
          >
            {/* Action icon */}
            <div
              className={`rounded-full p-2 ${
                log.action === "problem_created"
                  ? "bg-green-100 text-green-700"
                  : log.action === "problem_deleted"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {log.action === "problem_created" ? (
                <PlusCircle className="h-5 w-5" />
              ) : log.action === "problem_deleted" ? (
                <Trash className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>

            {/* Log content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {log.action === "problem_created" ? (
                      <>
                        {t("logMessages.problemCreated", {
                          title: log.problemTitle,
                        })}
                      </>
                    ) : log.action === "problem_deleted" ? (
                      <>
                        {t("logMessages.problemDeleted", {
                          title: log.problemTitle,
                        })}
                      </>
                    ) : (
                      <>
                        {t("logMessages.problemAction", {
                          action: t(`actions.${log.action}`, {
                            fallback: log.action,
                          }),
                          title: log.problemTitle,
                        })}
                      </>
                    )}
                  </p>

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                    <User className="h-3.5 w-3.5" />
                    <span>
                      {log.action === "problem_created"
                        ? (log as ProblemCreatedLog).createdByEmail
                        : log.action === "problem_deleted"
                        ? (log as ProblemDeletedLog).deletedByEmail
                        : t("unknownUser")}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    log.action === "problem_created"
                      ? "default"
                      : log.action === "problem_deleted"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {log.action === "problem_created"
                    ? t("actions.problem_created")
                    : log.action === "problem_deleted"
                    ? t("actions.problem_deleted")
                    : t(`actions.${log.action}`, { fallback: log.action })}
                </Badge>
              </div>

              {/* Metadata section */}
              <div className="bg-muted/50 rounded-md p-3 mt-2 text-sm space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {t("problemId")}:{" "}
                      <span className="font-mono">{log.problemId}</span>
                    </span>
                  </div>

                  {log.action === "problem_created" &&
                    (log as ProblemCreatedLog).metadata && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {t("judgeType")}:{" "}
                          {(log as ProblemCreatedLog).metadata.judgingType}
                        </span>
                        <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {t("timeLimit")}:{" "}
                          {(log as ProblemCreatedLog).metadata.timeLimit}ms
                        </span>
                        <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {t("memoryLimit")}:{" "}
                          {(log as ProblemCreatedLog).metadata.memoryLimit}MB
                        </span>
                      </div>
                    )}

                  {log.action === "problem_deleted" &&
                    (log as ProblemDeletedLog).metadata && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {t("judgeType")}:{" "}
                          {(log as ProblemDeletedLog).metadata.judgeType}
                        </span>
                        <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {t("testCases")}:{" "}
                          {(log as ProblemDeletedLog).metadata.testCasesCount}
                        </span>
                        {(log as ProblemDeletedLog).problemOwner && (
                          <span className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                            {t("owner")}:{" "}
                            {(log as ProblemDeletedLog).problemOwner}
                          </span>
                        )}
                      </div>
                    )}
                </div>

                <div className="flex items-center text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                  <span title={formatDate(log.timestamp)}>
                    {getRelativeTime(log.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search")}
              className="pl-8 w-full sm:w-[250px]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {renderLogsList(filteredLogs)}
          </CardContent>

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mx-6 mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {hasMore && filteredLogs.length > 0 && (
            <div className="flex justify-center pb-6">
              <Button
                variant="outline"
                onClick={() => fetchLogs(false)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loadingMore")}
                  </>
                ) : (
                  t("loadMore")
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
