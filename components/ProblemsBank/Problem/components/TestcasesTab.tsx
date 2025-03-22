import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Database, FileText, Plus, Eye, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Scale, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl"; // Import useTranslations
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface TestcasesTabProps {
  problemId: string;
  readOnly: boolean;
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
  type_of_judging: string;
  short_name: string;
  test_cases: TestCasesProps[];
}

export function TestcasesTab({ problemId, readOnly }: TestcasesTabProps) {
  // Get translations
  const t = useTranslations("ProblemBank.problem.testcases");
  
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const null_config: ConfigProps = {
    memory_limit: 0,
    time_limit: 0,
    type_of_judging: "AC",
    short_name: "",
    test_cases: [],
  };

  const [config, setConfig] = useState<ConfigProps>(null_config);
  const [isAddingTestCase, setIsAddingTestCase] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    input: "",
    output: "",
    inputFile: null as File | null,
    outputFile: null as File | null,
    score: 0,
  });

  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [batchTestCases, setBatchTestCases] = useState<Array<{
    input: string, 
    output: string, 
    inputFile: File | null,
    outputFile: File | null,
    score: number
  }>>([]);

  const [batchUploadProgress, setBatchUploadProgress] = useState<{
    currentIndex: number;
    totalCount: number;
    currentProgress: number;
    currentFileName: string;
    failedUploads: { index: number; error: string }[];
  }>({
    currentIndex: 0,
    totalCount: 0,
    currentProgress: 0,
    currentFileName: "",
    failedUploads: []
  });
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  // Common score presets for quick selection
  const scorePresets = [0, 5, 10, 50, 100];

  const fetchConfig = () => {
    setIsLoading(true);
    setLoadingError(null);
    
    const form = new FormData();
    form.append("name", problemId);
    axios
      .post(
        process.env.NEXT_PUBLIC_JUDGE0_API_KEY + "/problems/get_problem_config",
        form
      )
      .then((response) => {
        setConfig(response.data);
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        setLoadingError(t("errors.loadingFailed"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = async (index: number) => {
    if (readOnly) return; // Prevent deletion in read-only mode
    
    setIsDeleting(index);
    try {
      const form = new FormData();
      form.append("name", problemId);
      form.append("test_case_index", index.toString());

      await axios.post(
        `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/testcases/delete`,
        form
      );

      toast({
        title: t("toasts.deleteSuccess"),
        description: t("toasts.deleteSuccessDetail"),
      });

      fetchConfig(); // Refresh the test cases
    } catch (error) {
      console.error("Error deleting test case:", error);
      toast({
        title: t("errors.errorTitle"),
        description: t("errors.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const addToBatch = () => {
    if (readOnly) return; // Prevent adding to batch in read-only mode
    
    // Validate current test case
    if ((!newTestCase.input && !newTestCase.inputFile) || 
        (!newTestCase.output && !newTestCase.outputFile)) {
      toast({
        title: t("toasts.incompleteTestCase"),
        description: t("toasts.inputOutputRequired"),
        variant: "destructive",
      });
      return;
    }
    
    // Add to batch
    setBatchTestCases([...batchTestCases, { ...newTestCase }]);
    
    // Reset form for next test case
    setNewTestCase({
      input: "",
      output: "",
      inputFile: null,
      outputFile: null,
      score: newTestCase.score, // Keep the same score for convenience
    });
    
    toast({
      title: t("toasts.addedToBatch"),
      description: t("toasts.testCaseAddedToBatch", { count: batchTestCases.length + 1 }),
    });
  };

  const handleAddTest = async (e: React.FormEvent) => {
    if (readOnly) return; // Prevent adding test cases in read-only mode
    
    e.preventDefault();
    
    // Check if we have a batch or single test case
    const hasBatch = batchTestCases.length > 0;
    
    // If we have a batch but the current form also has data, ask to add it
    if (hasBatch && (newTestCase.input || newTestCase.output || 
        newTestCase.inputFile || newTestCase.outputFile)) {
      // Ask if user wants to include the current form in the batch
      if (confirm(t("confirm.addToBatchBeforeUpload"))) {
        addToBatch();
      }
    }
    
    // If we're uploading a single test case with no batch
    if (!hasBatch) {
      setIsAddingTestCase(true);
      try {
        const form = new FormData();
        form.append("name", problemId);
        if (newTestCase.inputFile) {
          form.append("input_file", newTestCase.inputFile);
        } else if (newTestCase.input) {
          const inputBlob = new Blob([newTestCase.input], { type: 'text/plain' });
          const inputFile = new File([inputBlob], 'input.txt', { type: 'text/plain' });
          form.append("input_file", inputFile);
        }
    
        if (newTestCase.outputFile) {
          form.append("output_file", newTestCase.outputFile);
        } else if (newTestCase.output) {
          const outputBlob = new Blob([newTestCase.output], { type: 'text/plain' });
          const outputFile = new File([outputBlob], 'output.txt', { type: 'text/plain' });
          form.append("output_file", outputFile);
        }
    
        form.append("score", newTestCase.score.toString());

        await axios.post(
          `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/testcases/add`,
          form
        );

        toast({
          title: t("toasts.success"),
          description: t("toasts.testCaseAddedSuccess"),
        });

        // Reset form and close dialog
        setNewTestCase({
          input: "",
          output: "",
          inputFile: null,
          outputFile: null,
          score: 0,
        });
        setOpen(false);
        fetchConfig(); // Refresh the test cases list
      } catch (error) {
        console.error("Error adding test case:", error);
        toast({
          title: t("errors.errorTitle"),
          description: t("errors.addFailed"),
          variant: "destructive",
        });
      } finally {
        setIsAddingTestCase(false);
      }
    } 
    // If we have a batch to upload
    else {
      setIsUploadingBulk(true);
      setShowUploadProgress(true);
      setBatchUploadProgress({
        currentIndex: 0,
        totalCount: batchTestCases.length,
        currentProgress: 0,
        currentFileName: "",
        failedUploads: []
      });
      
      try {
        // Upload each test case in sequence
        for (let i = 0; i < batchTestCases.length; i++) {
          const testCase = batchTestCases[i];
          
          const form = new FormData();
          form.append("name", problemId);
          
          let currentFileName = "";
          
          // Input file handling
          if (testCase.inputFile) {
            form.append("input_file", testCase.inputFile);
            currentFileName = testCase.inputFile.name;
          } else if (testCase.input) {
            const inputBlob = new Blob([testCase.input], { type: 'text/plain' });
            const inputFile = new File([inputBlob], 'input.txt', { type: 'text/plain' });
            form.append("input_file", inputFile);
            currentFileName = "input.txt";
          }
          
          // Output file handling
          if (testCase.outputFile) {
            form.append("output_file", testCase.outputFile);
            if (!currentFileName) currentFileName = testCase.outputFile.name;
          } else if (testCase.output) {
            const outputBlob = new Blob([testCase.output], { type: 'text/plain' });
            const outputFile = new File([outputBlob], 'output.txt', { type: 'text/plain' });
            form.append("output_file", outputFile);
            if (!currentFileName) currentFileName = "output.txt";
          }
          
          form.append("score", testCase.score.toString());
          
          setBatchUploadProgress(prev => ({
            ...prev,
            currentIndex: i,
            currentProgress: 0,
            currentFileName
          }));
          
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/testcases/add`,
              form,
              {
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / (progressEvent.total || 100)
                  );
                  setBatchUploadProgress(prev => ({
                    ...prev,
                    currentProgress: percentCompleted
                  }));
                }
              }
            );
          } catch (error) {
            console.error(`Error uploading test case ${i+1}:`, error);
            setBatchUploadProgress(prev => ({
              ...prev,
              failedUploads: [...prev.failedUploads, { 
                index: i, 
                error: error instanceof Error ? error.message : t("errors.uploadFailed") 
              }]
            }));
          }
        }
        
        toast({
          title: t("toasts.success"),
          description: t("toasts.successfullyUploadedTestCases", { count: batchTestCases.length - batchUploadProgress.failedUploads.length }),
        });
        
        // Reset form and close dialog only if all uploads were successful
        if (batchUploadProgress.failedUploads.length === 0) {
          setBatchTestCases([]);
          setNewTestCase({
            input: "",
            output: "",
            inputFile: null,
            outputFile: null,
            score: 0,
          });
          setOpen(false);
        }
        fetchConfig(); // Refresh the test cases list
      } catch (error) {
        console.error("Error in batch upload process:", error);
        toast({
          title: t("errors.errorTitle"),
          description: t("errors.addMultipleFailed"),
          variant: "destructive",
        });
      } finally {
        setIsUploadingBulk(false);
        // Keep the progress dialog open if there were failures
        if (batchUploadProgress.failedUploads.length === 0) {
          setTimeout(() => {
            setShowUploadProgress(false);
          }, 1500); // Show complete status briefly before hiding
        }
      }
    }
  };

  const removeBatchTestCase = (index: number) => {
    if (readOnly) return; // Prevent removing batch test cases in read-only mode
    
    const updated = [...batchTestCases];
    updated.splice(index, 1);
    setBatchTestCases(updated);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Loading screen component
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center bg-dot-pattern p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h3 className="text-xl font-semibold">{t("loading.title")}</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            {t("loading.description")}
          </p>
        </div>
      </div>
    );
  }

  // Error screen component
  if (loadingError) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center bg-dot-pattern p-6">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold">{t("errors.loadingTitle")}</h3>
          <p className="text-muted-foreground">{loadingError}</p>
          <Button onClick={fetchConfig}>{t("actions.tryAgain")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto bg-muted/5 p-6 md:p-8 space-y-6">
      {/* Read-Only Banner */}
      {readOnly && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              {t("readOnlyNotice")}
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("header.title")}</h1>
        <p className="text-muted-foreground">{t("header.subtitle")}</p>
      </div>
      
      {/* Problem Configuration Card */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("config.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Limit */}
            <div className="flex items-center space-x-4 p-3 rounded-md bg-muted/40">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("config.timeLimit")}</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold">{config.time_limit}</span>
                  <span className="text-sm text-muted-foreground">{t("config.ms")}</span>
                </div>
              </div>
            </div>
            
            {/* Memory Limit */}
            <div className="flex items-center space-x-4 p-3 rounded-md bg-muted/40">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("config.memoryLimit")}</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold">{config.memory_limit}</span>
                  <span className="text-sm text-muted-foreground">{t("config.mb")}</span>
                </div>
              </div>
            </div>
            
            {/* Judging Type */}
            <div className="flex items-center space-x-4 p-3 rounded-md bg-muted/40">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("config.judgingType")}</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold">{config.type_of_judging}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases Section */}
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-lg font-medium">{t("testCases.title", { count: config.test_cases.length })}</h2>
        {/* Only show Add Test Case button when not in read-only mode */}
        {!readOnly && (
          <div className="flex items-center">
            <Dialog open={open} onOpenChange={(isOpen) => {
              if (!isOpen) {
                // When closing dialog, clear the batch
                setBatchTestCases([]);
              }
              setOpen(isOpen);
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t("actions.addTestCase")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("dialog.addTestCases")}</DialogTitle>
                  <DialogDescription>
                    {t("dialog.createDescription")}
                  </DialogDescription>
                </DialogHeader>
                
                <form className="space-y-6" onSubmit={handleAddTest}>
                  {/* Current Test Case Form */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">
                        {batchTestCases.length > 0 ? t("dialog.addAnother") : t("dialog.newTestCase")}
                      </h3>
                      {batchTestCases.length > 0 && (
                        <Badge variant="secondary" className="font-mono">
                          {t("dialog.inBatch", { count: batchTestCases.length })}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Input */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="input" className="text-sm font-medium">{t("fields.input")}</Label>
                          <Badge variant="outline" className="font-normal">{t("fields.required")}</Badge>
                        </div>
                        
                        <div className="relative">
                          <Input
                            type="file"
                            onChange={(e) => setNewTestCase({...newTestCase, inputFile: e.target.files?.[0] || null})}
                            className="w-full"
                            accept=".txt,.in,.inp"
                            disabled={isAddingTestCase || isUploadingBulk}
                          />
                          <div className="my-2 text-center text-xs text-muted-foreground">— {t("common.or")} —</div>
                        </div>
                        
                        <Textarea
                          id="input"
                          placeholder={t("placeholders.inputText")}
                          value={newTestCase.input}
                          onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                          className="font-mono min-h-[140px]"
                          disabled={isAddingTestCase || isUploadingBulk}
                        />
                      </div>

                      {/* Right Column - Output */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="output" className="text-sm font-medium">{t("fields.expectedOutput")}</Label>
                          <Badge variant="outline" className="font-normal">{t("fields.required")}</Badge>
                        </div>
                        
                        <div className="relative">
                          <Input
                            type="file"
                            onChange={(e) => setNewTestCase({...newTestCase, outputFile: e.target.files?.[0] || null})}
                            className="w-full"
                            accept=".txt,.out"
                            disabled={isAddingTestCase || isUploadingBulk}
                          />
                          <div className="my-2 text-center text-xs text-muted-foreground">— {t("common.or")} —</div>
                        </div>
                        
                        <Textarea
                          id="output"
                          placeholder={t("placeholders.outputText")}
                          value={newTestCase.output}
                          onChange={(e) => setNewTestCase({ ...newTestCase, output: e.target.value })}
                          className="font-mono min-h-[140px]"
                          disabled={isAddingTestCase || isUploadingBulk}
                        />
                      </div>
                    </div>

                    {/* Score Input */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="score" className="text-sm">{t("fields.score")}</Label>
                          <span className="text-xs text-muted-foreground">{t("fields.defaultScore")}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {scorePresets.map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              size="sm"
                              variant={newTestCase.score === preset ? "default" : "outline"}
                              className="h-8 px-3"
                              onClick={() => setNewTestCase({...newTestCase, score: preset})}
                              disabled={isAddingTestCase || isUploadingBulk}
                            >
                              {preset}
                            </Button>
                          ))}
                          <div className="relative flex items-center">
                            <Input
                              id="score"
                              type="number"
                              min="0"
                              placeholder={t("placeholders.customScore")}
                              value={!scorePresets.includes(newTestCase.score) && newTestCase.score !== 0 ? newTestCase.score : ""}
                              onChange={(e) => {
                                const value = e.target.value.trim() === "" ? 0 : parseInt(e.target.value);
                                setNewTestCase({...newTestCase, score: isNaN(value) ? 0 : value})
                              }}
                              className="h-8 pr-16"
                              disabled={isAddingTestCase || isUploadingBulk}
                            />
                            <span className="absolute right-3 text-xs text-muted-foreground">{t("fields.points")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add to Batch Button */}
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={addToBatch}
                        disabled={isAddingTestCase || isUploadingBulk || 
                          (!newTestCase.input && !newTestCase.inputFile) || 
                          (!newTestCase.output && !newTestCase.outputFile)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("actions.addToBatch")}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Batch Preview Section */}
                  {batchTestCases.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">{t("batch.title", { count: batchTestCases.length })}</h3>
                        {batchTestCases.length > 3 && (
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                            {t("batch.scrollHint", { count: batchTestCases.length })}
                          </span>
                        )}
                      </div>
                      
                      <div className="border rounded-md">
                        <div className="max-h-[300px] overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card shadow-sm z-10">
                              <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium">#</th>
                                <th className="text-left py-2 px-3 font-medium">{t("batch.inputPreview")}</th>
                                <th className="text-left py-2 px-3 font-medium">{t("batch.outputPreview")}</th>
                                <th className="text-left py-2 px-3 font-medium">{t("batch.score")}</th>
                                <th className="text-right py-2 px-3 font-medium">{t("batch.action")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batchTestCases.map((testCase, index) => (
                                <tr key={index} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                                  <td className="py-2 px-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                      {index + 1}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="max-w-[150px] truncate font-mono text-xs">
                                      {testCase.inputFile ? 
                                        t("batch.fileLabel", { name: testCase.inputFile.name }) : 
                                        (testCase.input || t("batch.empty"))}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="max-w-[150px] truncate font-mono text-xs">
                                      {testCase.outputFile ? 
                                        t("batch.fileLabel", { name: testCase.outputFile.name }) : 
                                        (testCase.output || t("batch.empty"))}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <Badge variant="outline" className="font-mono">
                                      {testCase.score}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => removeBatchTestCase(index)}
                                      disabled={isUploadingBulk}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Batch summary footer */}
                        <div className="bg-muted/20 p-3 border-t flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {t("batch.total", {
                              count: batchTestCases.length,
                              testCase: batchTestCases.length === 1 
                                ? t("common.testCase") 
                                : t("common.testCases")
                            })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setBatchTestCases([])}
                            disabled={isUploadingBulk}
                          >
                            {t("actions.clearAll")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="pt-2">
                    {batchTestCases.length > 0 ? (
                      <Button 
                        type="submit" 
                        disabled={isAddingTestCase || isUploadingBulk}
                      >
                        {isUploadingBulk ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("actions.uploadingMultiple", { count: batchTestCases.length })}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("actions.uploadMultiple", { count: batchTestCases.length })}
                          </span>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={isAddingTestCase || 
                          (!newTestCase.input && !newTestCase.inputFile) || 
                          (!newTestCase.output && !newTestCase.outputFile)}
                      >
                        {isAddingTestCase ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("actions.creating")}
                          </span>
                        ) : (
                          t("actions.createTestCase")
                        )}
                      </Button>
                    )}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
        {/* Show read-only indicator when in read-only mode */}
        {readOnly && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-sm text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400">
            <Eye className="h-4 w-4" />
            {t("readOnlyMode")}
          </div>
        )}
      </div>

      {/* Test Cases Card */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-0">
          {config.test_cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">{t("empty.title")}</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {t("empty.description")}
              </p>
              {!readOnly && (
                <Button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  {t("empty.addFirst")}
                </Button>
              )}
              {readOnly && (
                <div className="text-muted-foreground">
                  {t("empty.noTestCasesReadOnly")}
                </div>
              )}
            </div>
          ) : (
            <div>
              {config.test_cases.map((testCase, index) => (
                <div key={index} className="border-b border-border/60 last:border-b-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="font-medium">{t("testCase.title", { number: index + 1 })}</div>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {t("testCase.score", { score: testCase.score })}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Input Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{t("fields.input")}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            asChild
                          >
                            <a
                              href={`${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/testcases/download?name=${problemId}&test_case_index=${testCase.index}&type=input`}
                              download
                            >
                              <Download className="h-3 w-3" />
                              {t("actions.download")}
                            </a>
                          </Button>
                        </div>
                        
                        <ScrollArea className="border rounded-md bg-background h-[100px]">
                          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
                            {testCase.input || <span className="text-muted-foreground italic">{t("testCase.emptyInput")}</span>}
                          </pre>
                        </ScrollArea>
                      </div>
                      
                      {/* Output Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{t("fields.expectedOutput")}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            asChild
                          >
                            <a
                              href={`${process.env.NEXT_PUBLIC_JUDGE0_API_KEY}/testcases/download?name=${problemId}&test_case_index=${testCase.index}&type=output`}
                              download
                            >
                              <Download className="h-3 w-3" />
                              {t("actions.download")}
                            </a>
                          </Button>
                        </div>
                        
                        <ScrollArea className="border rounded-md bg-background h-[100px]">
                          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
                            {testCase.output || <span className="text-muted-foreground italic">{t("testCase.emptyOutput")}</span>}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                    
                    {/* Actions - Only show in non-read-only mode */}
                    {!readOnly && (
                      <div className="flex justify-end mt-3">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 border-destructive/30"
                              disabled={isDeleting === index}
                            >
                              {isDeleting === index ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  {t("actions.deleting")}
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {t("actions.delete")}
                                </span>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("delete.title", { number: index + 1 })}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("delete.description")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(testCase.index)}
                              >
                                {t("actions.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress Dialog */}
      <Dialog open={showUploadProgress} onOpenChange={setShowUploadProgress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {batchUploadProgress.failedUploads.length > 0
                ? t("progress.uploadWithErrors")
                : isUploadingBulk
                ? t("progress.uploading")
                : t("progress.uploadComplete")}
            </DialogTitle>
            <DialogDescription>
              {t("progress.uploadingTestCase", {
                current: batchUploadProgress.currentIndex + 1,
                total: batchUploadProgress.totalCount
              })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Overall progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t("progress.overall")} ({batchUploadProgress.currentIndex + 1}/{batchUploadProgress.totalCount})
                </span>
                <span>{Math.round((batchUploadProgress.currentIndex + 1) * 100 / batchUploadProgress.totalCount)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${((batchUploadProgress.currentIndex + 1) * 100) / batchUploadProgress.totalCount}%` }}
                />
              </div>
            </div>

            {/* Current file progress */}
            {isUploadingBulk && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="truncate max-w-[200px]">
                    {batchUploadProgress.currentFileName || t("progress.currentFile")}
                  </span>
                  <span>{batchUploadProgress.currentProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${batchUploadProgress.currentProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Failed uploads */}
            {batchUploadProgress.failedUploads.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-destructive mb-2">
                  {t("progress.failedUploads", { count: batchUploadProgress.failedUploads.length })}
                </h4>
                <ScrollArea className="h-[100px] border rounded">
                  <div className="p-3">
                    {batchUploadProgress.failedUploads.map((failure) => (
                      <div key={failure.index} className="text-sm text-destructive mb-1">
                        {t("progress.failedTestCase", { index: failure.index + 1 })}: {failure.error}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            {!isUploadingBulk && (
              <Button onClick={() => setShowUploadProgress(false)}>
                {batchUploadProgress.failedUploads.length > 0 
                  ? t("progress.continue") 
                  : t("progress.close")}
              </Button>
            )}
            
            {isUploadingBulk && (
              <Button variant="outline" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("progress.uploading")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}