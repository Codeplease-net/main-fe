import React, { useState, useEffect } from 'react';
import { X, Loader2, ListPlus, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getFirestore, doc, getDoc, writeBatch } from 'firebase/firestore';
import { useTranslations } from 'next-intl'; // Import useTranslations hook

interface AddProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationResult {
  id: string;
  exists: boolean;
  alreadyAdded: boolean;
  message: string;
  status: 'success' | 'error' | 'warning';
  problemDetails?: {
    title?: string;
    difficulty?: string;
  };
}

export function AddProblemDialog({ open, onOpenChange }: AddProblemDialogProps) {
  // Get translations
  const t = useTranslations('Problems.addDialog');
  
  const [problemIds, setProblemIds] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [debouncedIds, setDebouncedIds] = useState('');

  const getProblemCount = () => {
    return problemIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .length;
  };

  // Debounced input handler
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedIds(problemIds);
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [problemIds]);

  // Auto validation
  useEffect(() => {
    if (debouncedIds && getProblemCount() > 0) {
      handleValidation();
    }
  }, [debouncedIds]);

  const handleValidation = async () => {
    // Split input by newlines and filter out empty lines
    const ids = problemIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);
      
    if (ids.length === 0) {
      setValidationResults([]);
      setShowValidation(false);
      return;
    }
    
    setIsValidating(true);
    setShowValidation(true);
    const results: ValidationResult[] = [];
    
    const db = getFirestore();
    
    try {
      console.log("Starting validation for:", ids);
      
      // Check each problem ID
      for (const id of ids) {
        // Check if problem exists
        const problemRef = doc(db, `problems/${id}`);
        const problemDoc = await getDoc(problemRef);
        
        // Check if problem is already added
        const permissionRef = doc(db, `problem-permissions/${id}`);
        const permissionDoc = await getDoc(permissionRef);
        
        console.log(`Problem ${id}:`, { 
          exists: problemDoc.exists(), 
          permissionExists: permissionDoc.exists(),
          permissionData: permissionDoc.data()
        });
        
        if (!problemDoc.exists()) {
          results.push({
            id,
            exists: false,
            alreadyAdded: false,
            message: t('validation.problemNotExist', { id }),
            status: 'error'
          });
        } else if (permissionDoc.exists() && permissionDoc.data()?.public === true) {
          // Problem exists and is already added - fetch its details
          const problemData = problemDoc.data();
          const title = problemData?.displayTitle || id;

          results.push({
            id,
            exists: true,
            alreadyAdded: true,
            message: t('validation.alreadyAdded', { id }),
            status: 'warning',
            problemDetails: {
              title: title,
              difficulty: problemData?.difficulty
            }
          });
        } else {
          // Problem exists but not yet added - fetch its details
          const problemData = problemDoc.data();
          const title = problemData?.displayTitle || id;

          results.push({
            id,
            exists: true,
            alreadyAdded: false,
            message: t('validation.valid', { id }),
            status: 'success',
            problemDetails: {
              title: title,
              difficulty: problemData?.difficulty
            }
          });
        }
      }
      console.log("Validation results:", results);
    } catch (error) {
      console.error("Error validating problems:", error);
    } finally {
      setValidationResults(results);
      setIsValidating(false);
    }
  };

  const getValidCount = () => {
    return validationResults.filter(result => result.exists && !result.alreadyAdded).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValidating) {
      return; // Wait for validation to complete
    }
    
    if (!validationResults.length) {
      await handleValidation();
      return;
    }
    
    // Filter only valid problems that are not already added
    const validProblems = validationResults
      .filter(result => result.exists && !result.alreadyAdded)
      .map(result => result.id);
      
    if (validProblems.length === 0) {
      // No valid problems to add
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Import Firebase modules dynamically to reduce bundle size
      const db = getFirestore();
      
      // Use batch write for better performance and atomicity
      const batch = writeBatch(db);
      
      // Process each valid problem
      for (const problemId of validProblems) {
        // Create or update problem permission document
        const permissionRef = doc(db, 'problem-permissions', problemId);
        batch.set(permissionRef, {
          public: true,
          updatedAt: new Date().getTime(),
        }, { merge: true }); // Use merge to preserve other fields if they exist
      }
      
      // Commit the batch
      await batch.commit();
            
      // Reset form and close dialog on success
      setProblemIds('');
      setValidationResults([]);
      setShowValidation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding problems:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        // Reset state when dialog closes
        setProblemIds('');
        setValidationResults([]);
        setShowValidation(false);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ListPlus className="mr-2 h-5 w-5 text-primary" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="problem-ids" className="text-sm font-medium">
                {t('form.idsLabel')}
              </Label>
              <Badge variant="outline" className="font-normal">
                {t('form.problemCount', { count: getProblemCount() })}
              </Badge>
            </div>
            
            <Textarea
              id="problem-ids"
              value={problemIds}
              onChange={(e) => {
                setProblemIds(e.target.value);
              }}
              placeholder={t('form.placeholder')}
              className="min-h-[150px] font-mono text-sm"
              required
              disabled={isSubmitting}
            />
            
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.instruction')}
            </p>
          </div>
          
          {/* Validation Results */}
          {isValidating && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm ml-2">{t('status.validating')}</span>
            </div>
          )}
          
          {!isValidating && showValidation && validationResults.length === 0 && (
            <div className="border rounded-md p-3 bg-amber-50/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{t('status.noResults')}</p>
              </div>
            </div>
          )}
          
          {!isValidating && showValidation && validationResults.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/20 px-3 py-1.5 border-b flex justify-between items-center">
                <h4 className="text-sm font-medium">{t('validation.results')}</h4>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {validationResults.filter(r => r.status === 'success').length}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationResults.filter(r => r.status === 'warning').length}
                  </span>
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {validationResults.filter(r => r.status === 'error').length}
                  </span>
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {validationResults.map((result, index) => {
                  // Define status-specific colors
                  let bgColor, borderColor, iconColor, textColor;
                  
                  if (result.status === 'success') {
                    bgColor = "bg-green-50/90 dark:bg-green-950/50";
                    borderColor = "border-green-200 dark:border-green-800/50";
                    iconColor = "text-green-600 dark:text-green-400";
                    textColor = "text-green-800 dark:text-green-300";
                  } else if (result.status === 'warning') {
                    bgColor = "bg-amber-50/90 dark:bg-amber-950/50";
                    borderColor = "border-amber-200 dark:border-amber-800/50";
                    iconColor = "text-amber-600 dark:text-amber-400";
                    textColor = "text-amber-800 dark:text-amber-300";
                  } else { // error
                    bgColor = "bg-red-50/90 dark:bg-red-950/50";
                    borderColor = "border-red-200 dark:border-red-800/50";
                    iconColor = "text-red-600 dark:text-red-400";
                    textColor = "text-red-800 dark:text-red-300";
                  }

                  return (
                    <div 
                      key={index} 
                      className={`p-3 ${
                        index !== validationResults.length - 1 ? `border-b ${borderColor}` : ''
                      } ${bgColor}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {result.status === 'success' ? (
                            <CheckCircle2 className={`h-4.5 w-4.5 ${iconColor}`} />
                          ) : result.status === 'warning' ? (
                            <AlertCircle className={`h-4.5 w-4.5 ${iconColor}`} />
                          ) : (
                            <XCircle className={`h-4.5 w-4.5 ${iconColor}`} />
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-mono font-medium text-sm ${textColor}`}>{result.id}</span>
                          </div>
                          
                          {result.exists && result.problemDetails?.title && (
                            <p className="text-xs text-foreground/90 font-medium">
                              {result.problemDetails.title}
                            </p>
                          )}
                          
                          <p className={`text-sm font-medium ${textColor}`}>
                            {result.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {t('actions.cancel')}
            </Button>
            
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={getValidCount() === 0 || isValidating || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('actions.addingProblems')}
                </>
              ) : (
                <>
                  {t('actions.addProblems', { count: getValidCount() > 0 ? getValidCount() : '' })}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}