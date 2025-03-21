import { useState, useEffect } from "react";
import { Problem } from "../types/problem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Search, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import categories from "@/utils/categories";
import { useTranslations } from "next-intl";

interface GeneralTabProps {
  problem: Problem;
  isLoading: boolean;
  onUpdate: (updates: Partial<Problem>) => Promise<void>;
}

export function GeneralTab({ problem, isLoading, onUpdate }: GeneralTabProps) {
  const t = useTranslations("ProblemBank.problem");
  const [localProblem, setLocalProblem] = useState<Problem>(problem);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryDialog, setCategoryDialog] = useState<boolean>(false);

  const allCategories = categories();
  const categoryMap = Object.fromEntries(
    allCategories.map(cat => [cat.code, cat.name])
  );

  useEffect(() => {
    setLocalProblem(problem);
  }, [problem]);

  const handleInputChange = (field: keyof Problem, value: any) => {
    if (updateSuccess !== null) {
      setUpdateSuccess(null);
    }

    setLocalProblem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      setUpdateSuccess(null);
      await onUpdate(localProblem);
      setUpdateSuccess(true);

      toast({
        title: t("general.updateSuccess"),
        description: t("general.updateSuccessMessage"),
        variant: "default",
      });

      setAlertOpen(false);
    } catch (error) {
      console.error("Error updating problem:", error);
      setUpdateSuccess(false);

      toast({
        title: t("general.updateError"),
        description: t("general.updateErrorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDifficultyChange = (value: number) => {
    const normalizedValue = Math.max(
      500,
      Math.min(3500, Math.round(value / 100) * 100)
    );
    return normalizedValue;
  };
  
  const toggleCategory = (categoryCode: string) => {
    const isSelected = localProblem.categories?.includes(categoryCode);
    const updatedCategories = isSelected
      ? localProblem.categories.filter(c => c !== categoryCode)
      : [...(localProblem.categories || []), categoryCode];
    handleInputChange("categories", updatedCategories);
  };
  
  const filteredCategories = searchQuery.trim()
    ? allCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allCategories;

  const hasChanges = JSON.stringify(problem) !== JSON.stringify(localProblem);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto bg-dot-pattern">
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <div className="space-y-8">
          {/* Problem Info Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* ID Section */}
            <div className="col-span-2">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t("general.problemId")}
              </Label>
              <div className="p-3 rounded-lg font-mono text-sm bg-muted/20 border border-muted/30">
                {problem?.id}
              </div>
            </div>

            {/* Difficulty Section */}
            <div className="col-span-1">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block text-center">
                {t("general.difficulty")} ({localProblem.difficulty})
              </Label>
              <div className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    min="500"
                    max="3500"
                    step="100"
                    value={localProblem.difficulty}
                    onChange={(e) => {
                      const value = handleDifficultyChange(
                        parseInt(e.target.value) || 100
                      );
                      handleInputChange("difficulty", value);
                    }}
                    className={cn(
                      "w-full p-2.5 rounded-md font-mono text-base text-center",
                      "bg-background border border-input",
                      "[appearance:textfield]",
                      "[&::-webkit-outer-spin-button]:appearance-none",
                      "[&::-webkit-inner-spin-button]:appearance-none"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                    / 3500
                  </div>
                </div>

                <Slider
                  value={[localProblem.difficulty]}
                  min={500}
                  max={3500}
                  step={100}
                  disabled={isLoading || isUpdating}
                  onValueChange={([value]) => {
                    handleInputChange("difficulty", value);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <Label
              htmlFor="displayTitle"
              className="text-sm font-medium text-muted-foreground block"
            >
              {t("general.displayTitle")}
            </Label>
            <Input
              id="displayTitle"
              placeholder={t("general.enterDisplayTitle")}
              value={localProblem.displayTitle}
              onChange={(e) =>
                handleInputChange("displayTitle", e.target.value)
              }
              disabled={isLoading || isUpdating}
              className="bg-card/50 border-input/50 h-10"
            />
          </div>

          {/* Categories Section - Simplified */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground block">
                {t("general.categories")}
              </Label>
              <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    disabled={isLoading || isUpdating}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("general.selectCategories")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t("general.selectProblemCategories")}</DialogTitle>
                  </DialogHeader>
                  
                  {/* Search Categories */}
                  <div className="relative my-4">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      placeholder={t("general.searchCategories")}
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Simple Categories List */}
                  <ScrollArea className="h-[300px] pr-4 -mr-4">
                    <div className="space-y-1">
                      {filteredCategories.map(category => (
                        <div 
                          key={category.code}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox 
                            id={`category-${category.code}`}
                            checked={localProblem.categories?.includes(category.code)}
                            onCheckedChange={() => toggleCategory(category.code)}
                          />
                          <label 
                            htmlFor={`category-${category.code}`}
                            className="text-sm cursor-pointer flex-grow"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex justify-end mt-4 pt-2 border-t">
                    <Button onClick={() => setCategoryDialog(false)}>
                      {t("general.done")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Selected Categories Display */}
            <div className="flex flex-wrap gap-2 bg-card/50 p-4 rounded-lg border min-h-[80px]">
              {localProblem.categories?.length ? (
                localProblem.categories.map(code => {
                  const categoryName = categoryMap[code] || code;
                  return (
                    <Badge 
                      key={code} 
                      variant="secondary"
                      className="px-2 py-1 gap-1 cursor-pointer"
                      onClick={() => toggleCategory(code)}
                    >
                      {categoryName}
                      <X className="h-3 w-3" />
                    </Badge>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t("general.noCategories")}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="default"
                  disabled={isLoading || isUpdating || !hasChanges}
                >
                  {isLoading ? t("general.loading") : 
                   isUpdating ? t("general.updating") : 
                   hasChanges ? t("general.saveChanges") : t("general.noChanges")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("general.confirmAction")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("general.confirmUpdateProblem")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>
                    {t("general.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? t("general.updating") : t("general.update")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}