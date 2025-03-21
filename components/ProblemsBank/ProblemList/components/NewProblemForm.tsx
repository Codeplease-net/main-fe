import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, AlertCircle, Check, HelpCircle, Loader2 } from "lucide-react";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/api/Readfirebase";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { debounce } from "lodash";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl"; // Import useTranslations

interface NewProblemFormProps {
  onSuccess: () => void;
  children?: React.ReactNode;
}

function generateSearchableTerms(title: string): string[] {
  const terms = [];
  const normalizedTitle = title.toLowerCase();
  
  // Generate all possible substrings
  for (let i = 0; i < normalizedTitle.length; i++) {
    for (let j = i + 1; j <= normalizedTitle.length; j++) {
      terms.push(normalizedTitle.slice(i, j));
    }
  }
  
  return Array.from(new Set(terms)); // Remove duplicates
}

export function NewProblemForm({ onSuccess, children }: NewProblemFormProps) {
  // Get translations
  const t = useTranslations("ProblemBank.newProblemForm");
  
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const [uid, setUid] = useState("");
  
  // Form validation states
  const [problemId, setProblemId] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [idError, setIdError] = useState<string | null>(null);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idExists, setIdExists] = useState(false);
  
  // New form fields
  const [judgingType, setJudgingType] = useState<"AC" | "SC">("AC");
  const [timeLimit, setTimeLimit] = useState<number>(1000);
  const [memoryLimit, setMemoryLimit] = useState<number>(256);
  
  // Validate problem ID format: lowercase letters and single hyphens only
  const validateProblemId = (id: string): boolean => {
    // Check if empty
    if (!id.trim()) {
      setIdError(t("validation.idEmpty"));
      return false;
    }
    
    // Check for invalid characters
    if (!/^[a-z-]+$/.test(id)) {
      setIdError(t("validation.idInvalidChars"));
      return false;
    }
    
    // Check for consecutive hyphens
    if (id.includes("--")) {
      setIdError(t("validation.idConsecutiveHyphens"));
      return false;
    }
    
    // Check for starting/ending with hyphen
    if (id.startsWith("-") || id.endsWith("-")) {
      setIdError(t("validation.idStartsEndsHyphen"));
      return false;
    }
    
    // Check if ID already exists
    if (idExists) {
      setIdError(t("validation.idExists"));
      return false;
    }
    
    // All validations passed
    setIdError(null);
    return true;
  };

  // Debounced function to check if problem ID already exists
  const checkIdExists = useCallback(
    debounce(async (id: string) => {
      if (id && id.trim().length > 2 && !/^[a-z-]+$/.test(id) === false) {
        setIsCheckingId(true);
        try {
          const problemRef = doc(db, "problems", id);
          const problemDoc = await getDoc(problemRef);
          setIdExists(problemDoc.exists());
          if (problemDoc.exists()) {
            setIdError(t("validation.idExists"));
          }
        } catch (error) {
          console.error("Error checking ID:", error);
        } finally {
          setIsCheckingId(false);
        }
      }
    }, 500),
    [t]
  );

  const addProblemOnServer = async (problemId: string) => {
    const form = new FormData();
    form.append("name", problemId);
    form.append("time_limit", timeLimit.toString());
    form.append("memory_limit", memoryLimit.toString());
    form.append("short_name", problemId);
    form.append("type_of_judging", judgingType);
    
    return axios.post(
      process.env.NEXT_PUBLIC_JUDGE0_API_KEY + "/problems/add",
      form
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateProblemId(problemId)) {
      return; // Stop submission if ID format is invalid
    }
    
    setLoading(true);

    try {
      // Double check if problem already exists
      const problemRef = doc(db, "problems", problemId);
      const problemDoc = await getDoc(problemRef);

      if (problemDoc.exists()) {
        toast({
          title: t("notifications.errorTitle"),
          description: t("notifications.idExistsError"),
          variant: "destructive",
        });
        setIdExists(true);
        setIdError(t("validation.idExists"));
        setLoading(false);
        return;
      }
      
      // Create problem on judge server
      await addProblemOnServer(problemId);

      const searchableTitle = generateSearchableTerms(displayTitle);

      // Create new problem in Firestore
      const newProblem = {
        owner: uid,
        createdAt: Date.now(),
        displayTitle: displayTitle,
        timeLimit: timeLimit,
        memoryLimit: memoryLimit,
        judgingType: judgingType,
        searchableTitle
      };

      await setDoc(problemRef, newProblem);
      
      // Get current user for logging
      const currentUser = auth.currentUser;
      
      // Log problem creation to Firebase
      await addDoc(collection(db, "logs"), {
        action: "problem_created",
        problemId: problemId,
        problemTitle: displayTitle,
        createdBy: currentUser?.uid || uid, // Use auth.currentUser if available, fallback to uid state
        createdByEmail: currentUser?.email || "unknown_email",
        timestamp: serverTimestamp(),
        metadata: {
          timeLimit: timeLimit,
          memoryLimit: memoryLimit,
          judgingType: judgingType
        }
      });
      
      toast({
        title: t("notifications.successTitle"),
        description: t("notifications.successMessage"),
      });
      
      // Reset form
      setProblemId("");
      setDisplayTitle("");
      setTimeLimit(1000);
      setMemoryLimit(256);
      setJudgingType("AC");
      setIdExists(false);
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating problem:", error);
      toast({
        title: t("notifications.errorTitle"),
        description: t("notifications.createError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Run validation and ID existence check when the ID changes
  useEffect(() => {
    if (problemId) {
      const basicValid = validateProblemId(problemId);
      if (basicValid) {
        checkIdExists(problemId);
      }
    } else {
      setIdExists(false);
      setIdError(null);
    }
    
    // Cancel debounced checks on unmount
    return () => {
      checkIdExists.cancel();
    };
  }, [problemId, checkIdExists]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            {t("buttonText")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id" className="flex items-center justify-between">
              {t("fields.id.label")}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("fields.id.tooltip.example")}</p>
                    <p className="text-xs mt-1">{t("fields.id.tooltip.format")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input 
                id="id" 
                value={problemId}
                onChange={(e) => {
                  const value = e.target.value;
                  setProblemId(value);
                }}
                placeholder={t("fields.id.placeholder")}
                className={idError ? "border-destructive pr-10" : ""}
                required 
              />
              {isCheckingId && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isCheckingId && problemId && !idError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
              )}
              {!isCheckingId && idError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
              )}
            </div>
            {idError && (
              <p className="text-xs text-destructive mt-1">{idError}</p>
            )}
            {idExists && (
              <p className="text-xs text-destructive mt-1">
                {t("validation.idExistsChooseAnother")}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("fields.id.hint")}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayTitle">{t("fields.title.label")}</Label>
            <Input 
              id="displayTitle" 
              value={displayTitle}
              onChange={(e) => setDisplayTitle(e.target.value)}
              placeholder={t("fields.title.placeholder")}
              required 
            />
            <p className="text-xs text-muted-foreground">
              {t("fields.title.hint")}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit" className="flex items-center justify-between">
                {t("fields.timeLimit.label")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("fields.timeLimit.tooltip.description")}</p>
                      <p className="text-xs mt-1">{t("fields.timeLimit.tooltip.recommendation")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input 
                id="timeLimit" 
                type="number"
                min="100"
                max="60000"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1000)}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memoryLimit" className="flex items-center justify-between">
                {t("fields.memoryLimit.label")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("fields.memoryLimit.tooltip.description")}</p>
                      <p className="text-xs mt-1">{t("fields.memoryLimit.tooltip.recommendation")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input 
                id="memoryLimit" 
                type="number"
                min="16"
                max="2048"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 256)}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              {t("fields.judgingType.label")}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p><strong>{t("fields.judgingType.tooltip.acTitle")}</strong>: {t("fields.judgingType.tooltip.acDescription")}</p>
                    <p className="text-xs mt-1">{t("fields.judgingType.tooltip.acUseCase")}</p>
                    <p className="mt-2"><strong>{t("fields.judgingType.tooltip.scTitle")}</strong>: {t("fields.judgingType.tooltip.scDescription")}</p>
                    <p className="text-xs mt-1">{t("fields.judgingType.tooltip.scUseCase")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <RadioGroup 
              value={judgingType} 
              onValueChange={(value) => setJudgingType(value as "AC" | "SC")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AC" id="ac" />
                <Label htmlFor="ac" className="cursor-pointer">{t("fields.judgingType.options.ac")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SC" id="sc" />
                <Label htmlFor="sc" className="cursor-pointer">{t("fields.judgingType.options.sc")}</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {judgingType === "AC" ? 
                t("fields.judgingType.hints.ac") : 
                t("fields.judgingType.hints.sc")}
            </p>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              type="submit" 
              disabled={loading || !!idError || isCheckingId || idExists || !problemId || !displayTitle}
              className="w-full"
            >
              {loading ? (
                <>
                  <span className="mr-2">{t("buttons.creatingStatus")}</span>
                  <span className="animate-pulse">•</span>
                </>
              ) : (
                t("buttons.create")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}