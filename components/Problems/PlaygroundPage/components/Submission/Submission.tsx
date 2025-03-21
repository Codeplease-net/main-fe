import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import axios from "axios";

// Components
import { DotsLoader } from "../DotsLoader";
import TestcaseDetail from "./TestcaseDetail";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FitEditor from "@/components/ui/description/fit-editor";
import { Button } from "@/components/ui/button";

// Icons
import { 
  ArrowLeft, 
  Code, 
  Calendar, 
  Clock, 
  HardDrive, 
  XCircle,
  AlertTriangle,
  ChevronRight,
  Check
} from "lucide-react";

// Utilities
import { 
  getLocalTimeAndDate, 
  calculateTime, 
  calculateMemory 
} from "@/components/Problems/PlaygroundPage/utils/formatters";
import { 
  SubmissionDetailProps, 
} from "@/components/Problems/PlaygroundPage/utils/types";
import { langToMonacoLang, FormalLang } from "@/components/Problems/PlaygroundPage/utils/constants";

interface SubmissionProps {
  submissionId: string;
  setDisplaySubmission: (id: string | undefined) => void;
  problemTitle?: string;
}

export default function Submission({
  submissionId,
  setDisplaySubmission,
  problemTitle = "Problem"
}: SubmissionProps) {
  const [submission, setSubmission] = useState<SubmissionDetailProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0);
  const t = useTranslations("Playground");
  const MAX_POLLING_ATTEMPTS = 20; // Maximum number of polling attempts (20 * 2 seconds = 40 seconds max wait)

  const fetchSubmission = async () => {
    try {
      if (!loading && !processing) setLoading(true);
      setError(null);
      
      const form = new FormData();
      form.append("id", submissionId);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/database/query`, 
        form
      );

      console.log(response.data)
      
      // Check if submission is still in queue
      if (response.data.result === "IQ") {
        setProcessing(true);
        
        // If we've polled too many times, stop and show an error
        if (pollingCountRef.current >= MAX_POLLING_ATTEMPTS) {
          clearTimeout(pollingTimerRef.current!);
          setError(t("submissionTimeout"));
          setProcessing(false);
          setLoading(false);
          return;
        }
        
        // Poll again in 2 seconds
        pollingCountRef.current += 1;
        pollingTimerRef.current = setTimeout(fetchSubmission, 2000);
        
        // Set partial submission data to show "Processing" state
        setSubmission({
          ...response.data,
          status: "Processing"
        });
      } else {
        // Submission is complete
        setSubmission(response.data);
        setProcessing(false);
        
        // Clear any ongoing polling
        if (pollingTimerRef.current) {
          clearTimeout(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      setError(t("fetchError"));
      
      // Clear any ongoing polling on error
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    } finally {
      if (!processing) setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      // Reset polling counter when submission ID changes
      pollingCountRef.current = 0;
      fetchSubmission();
    }
    
    // Cleanup on unmount
    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [submissionId]);

  // Status information helpers
  const getStatusLabel = (result: string) => {
    switch(result) {
      case "AC": return t("status.accepted");
      case "WA": return t("status.wrongAnswer");
      case "TLE": return t("status.timeLimit");
      case "RTE": return t("status.runtime");
      case "MLE": return t("status.memoryLimit");
      case "CE": return t("status.compileError");
      case "IQ": return t("status.inQueue");
      default: return result;
    }
  };

  const getStatusColor = (result: string) => {
    const colorMap: Record<string, string> = {
      AC: "bg-emerald-500 hover:bg-emerald-600",
      WA: "bg-red-500 hover:bg-red-600",
      TLE: "bg-amber-500 hover:bg-amber-600",
      RTE: "bg-red-500 hover:bg-red-600",
      MLE: "bg-orange-500 hover:bg-orange-600",
      CE: "bg-rose-500 hover:bg-rose-600",
      IQ: "bg-blue-500 hover:bg-blue-600"
    };
    return colorMap[result] || "bg-gray-500 hover:bg-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-screen bg-gradient-to-b from-background to-muted/30 overflow-y-auto"
    >
      {/* Header section remains unchanged */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-background/80">
        <div className="max-w-5xl mx-auto px-4 h-16 border-b flex items-center justify-between">
          <div className="flex items-center">
            
            {/* Simplified breadcrumb */}
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    onClick={() => setDisplaySubmission(undefined)}>
                {problemTitle}
              </span>
              <ChevronRight className="h-3.5 w-3.5 mx-2 text-muted-foreground" />
              <span className="font-medium">
                {t("submission")} #{submissionId.slice(-6)}
              </span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && !processing ? (
          <div className="flex flex-col gap-4 justify-center items-center h-[50vh]">
            <DotsLoader size={10} />
            <p className="text-muted-foreground text-sm animate-pulse">
              {t("loadingSubmission")}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3 justify-center items-center h-[50vh]">
            <XCircle className="h-10 w-10 text-destructive/80" />
            <p className="text-destructive/80">{error}</p>
            
            <Button 
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setDisplaySubmission(undefined)}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              {t("backToSubmissions")}
            </Button>
          </div>
        ) : submission?.result === "IQ" || processing ? (
          <Card className="w-full rounded-lg bg-card/90 shadow-md border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 pt-5 px-5">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium">
                  {t("submission")} <span className="text-muted-foreground">#{submissionId.slice(-6)}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <DotsLoader size={4} />
                <Badge className="text-sm px-3 py-1 rounded-md bg-primary text-primary-foreground">
                  {submission?.test_cases?.length ? t("status.testing") : t("status.inQueue")}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="px-5 pb-6">
              <div className="flex flex-col py-4">
                {/* Basic metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <SubmissionMetadataItem
                    icon={<Calendar className="w-4 h-4" />}
                    value={submission?.timestamp ? getLocalTimeAndDate(submission.timestamp) : "--"}
                    label={t("submittedLabel")}
                    index={0}
                  />
                  <SubmissionMetadataItem
                    icon={<Code className="w-4 h-4" />}
                    value={submission?.language ? (FormalLang[submission.language as keyof typeof FormalLang] || submission.language) : "--"}
                    label={t("languageLabel")}
                    index={1}
                  />
                </div>

                {/* Progress indicator */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">{t("judgeStatus")}</h3>
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-xs text-muted-foreground">
                        {submission?.test_cases?.length 
                          ? t("testingProgress", { completed: submission.test_cases.length, total: submission.test_count }) 
                          : t("preparingTests")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-muted rounded-full w-full overflow-hidden">
                    {submission?.test_cases?.length ? (
                      <motion.div 
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: `${(submission.test_cases.length / submission.test_count) * 100}%` 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    ) : (
                      <div className="h-full bg-primary rounded-full w-[5%]"></div>
                    )}
                  </div>
                </div>
                
                {/* Test Cases */}
                <div className="border border-border/50 rounded-md overflow-hidden mb-6">
                  <div className="bg-muted/30 px-4 py-2 border-b border-border/50 flex justify-between items-center">
                    <h3 className="text-sm font-medium">{t("testCases")}</h3>
                    <Badge variant="outline" className="text-xs font-normal">
                      {submission?.test_cases?.length || 0}/{submission?.test_count || "?"} {t("completed")}
                    </Badge>
                  </div>

                  {submission?.test_cases?.length ? (
                    <div className="divide-y divide-border/50 overflow-y-auto">
                      {Array.from({ length: submission.test_count }, (_, i) => {
                        const index = i;
                        const hasResult = index < submission.test_cases.length;
                        const testCase = hasResult ? submission.test_cases[index] : null;
                        const isPassing = testCase && testCase.result === "AC";
                        
                        return (
                          <div key={i} className={`flex items-center justify-between px-4 py-3 ${
                            submission.test_cases.length === i ? "bg-accent/10" : ""
                          }`}>
                            <div className="flex items-center gap-3">
                              {/* Updated circle container with better sizing */}
                              <div className={`flex items-center justify-center rounded-full h-6 w-6
                                ${hasResult 
                                  ? (isPassing ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")
                                  : submission.test_cases.length === i 
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"}`}>
                                {hasResult ? (
                                  isPassing ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                  )
                                ) : submission.test_cases.length === i ? (
                                  // Properly sized loading indicator
                                  <div className="w-3.5 h-3.5 animate-pulse rounded-full bg-primary/50"></div>
                                ) : (
                                  <span className="text-xs">{i + 1}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-sm">
                                  {t("testCase")} #{i + 1}
                                </span>
                                {hasResult && (
                                  <p className="text-xs text-muted-foreground">
                                    {testCase?.time_used ? `${testCase.time_used}ms` : ""} 
                                    {testCase?.memory_used ? ` • ${Math.round(testCase.memory_used / 1024)}KB` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              {hasResult ? (
                                <Badge className={`px-2 py-0.5 text-xs ${
                                  isPassing 
                                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                }`}>
                                  {isPassing ? t("status.passed") : t("status.failed")}
                                </Badge>
                              ) : submission.test_cases.length === i ? (
                                <span className="text-xs text-primary animate-pulse">{t("status.running")}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">{t("status.pending")}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center">
                      <DotsLoader size={6} />
                      <p className="text-sm text-muted-foreground mt-3">
                        {t("preparingTestCases")}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Source code preview */}
                {submission?.source && (
                  <div className="w-full mt-6">
                    <div className="flex items-center mb-2 justify-between">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary/70" />
                        {t("codeLabel")}
                      </h3>
                      {!submission.test_cases?.length && (
                        <span className="text-xs text-primary animate-pulse">{t("compilingCode")}</span>
                      )}
                    </div>
                    <FitEditor
                      content={submission.source}
                      language={submission.language ? (langToMonacoLang[submission.language as keyof typeof langToMonacoLang] || "plaintext") : "plaintext"}
                      readOnly={true}
                    />
                  </div>
                )}
                
                {/* Current activity status */}
                <div className="flex justify-center mt-4">
                  <div className="inline-flex items-center gap-2 bg-accent/10 text-foreground/80 rounded-full px-4 py-1.5">
                    <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
                    <p className="text-xs font-medium">
                      {submission?.test_cases?.length 
                        ? t("runningTestcase", { 
                            current: submission.test_cases.length + 1, 
                            total: submission.test_count 
                          })
                        : t("compilingSubmission")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : submission ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full rounded-lg bg-card/90 shadow-md border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 pt-5 px-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-medium">
                    {t("submission")} <span className="text-muted-foreground">#{submissionId.slice(-6)}</span>
                  </h2>
                </div>
                <Badge
                  className={`text-sm px-3 py-1 rounded-md ${
                    getStatusColor(submission.result)
                  } text-white`}
                >
                  {getStatusLabel(submission.result)}
                </Badge>
              </CardHeader>
              
              <CardContent className="px-5 pb-6">
                {/* Conditionally render metadata items based on submission type */}
                <div className={`grid ${submission.result === "CE" ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 mb-6`}>
                  {/* Always show submission time and language */}
                  <SubmissionMetadataItem
                    icon={<Calendar className="w-4 h-4" />}
                    value={getLocalTimeAndDate(submission.timestamp)}
                    label={t("submittedLabel")}
                    index={0}
                  />
                  <SubmissionMetadataItem
                    icon={<Code className="w-4 h-4" />}
                    value={FormalLang[submission.language as keyof typeof FormalLang] || submission.language}
                    label={t("languageLabel")}
                    index={1}
                  />
                  
                  {/* Only show runtime and memory for non-compile error submissions */}
                  {submission.result !== "CE" && (
                    <>
                      <SubmissionMetadataItem
                        icon={<Clock className="w-4 h-4" />}
                        value={calculateTime(submission.test_cases)}
                        label={t("runtimeLabel")}
                        index={2}
                      />
                      <SubmissionMetadataItem
                        icon={<HardDrive className="w-4 h-4" />}
                        value={calculateMemory(submission.test_cases)}
                        label={t("memoryLabel")}
                        index={3}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Conditionally render test cases or compile error message */}
                  {submission.result === "CE" ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <h3 className="text-base font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500/80" />
                          <span className="text-rose-500/90">{t("status.compileError")}</span>
                        </h3>
                      </div>
                      <div className="bg-muted/30 border border-rose-300/20 dark:border-rose-800/30 rounded-md p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-rose-500/90 overflow-auto max-h-[400px]">
                          {submission.error_output || t("noErrorMessage")}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <TestcaseDetail testCasesCount={submission.test_count} testCases={submission.test_cases} />
                  )}

                  {/* Source Code section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium flex items-center gap-2">
                        <Code className="w-4 h-4 text-primary/70" />
                        {t("codeLabel")} ({FormalLang[submission.language as keyof typeof FormalLang] || submission.language})
                      </h3>
                    </div>
                    <FitEditor
                      content={submission.source}
                      language={langToMonacoLang[submission.language as keyof typeof langToMonacoLang] || "plaintext"}
                      readOnly={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Floating back button remains unchanged */}
            <div className="fixed bottom-6 right-6 md:hidden z-50">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full shadow-md h-10 w-10 border border-border/50"
                onClick={() => setDisplaySubmission(undefined)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3 justify-center items-center h-[50vh] text-muted-foreground">
            <p className="text-sm">{t("noSubmissionFound")}</p>
            <Button 
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setDisplaySubmission(undefined)}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              {t("backToSubmissions")}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// SubmissionMetadataItem remains unchanged
function SubmissionMetadataItem({ 
  icon, 
  value, 
  label, 
  index 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
  index: number;
}) {
  return (
    <div className="flex items-start p-3.5 rounded-md bg-muted/30 border border-border/30 hover:border-border/50 transition-colors">
      <div className="p-1.5 rounded-md bg-primary/5 mr-3 text-primary/70">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}