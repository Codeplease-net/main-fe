"use client";

import { useState, useEffect } from "react";
import { Problem } from "../types/problem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { SUPPORTED_LANGUAGES, LanguageCode } from "../types/language";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Save, X } from "lucide-react";
import { useTranslations } from "next-intl"; // Import useTranslations

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { FitEditorLatex } from "@/components/ui/description/fit-editor";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, FileText, Lightbulb, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface contentProps {
  title: string;
  description: string;
  solution: string;
}

interface DescriptionTabProps {
  problem: Problem;
  language: LanguageCode;
  isLoading: boolean;
  onUpdate: (updates: Partial<Problem>) => Promise<void>;
  onPreviewChange: (content: contentProps, lang: LanguageCode) => void;
}

export function DescriptionTab({
  problem,
  language,
  isLoading,
  onUpdate,
  onPreviewChange,
}: DescriptionTabProps) {
  // Get translations
  const t = useTranslations("ProblemBank.problem.descriptionTab");
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("description");
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [localContent, setLocalContent] = useState({
    title: problem.content.title[language] || "",
    description: problem.content.description[language] || "",
    solution: problem.content.solution[language] || "",
  });

  // Update localContent when language changes
  useEffect(() => {
    setLocalContent({
      title: problem.content.title[language] || "",
      description: problem.content.description[language] || "",
      solution: problem.content.solution[language] || "",
    });
  }, [language, problem.content]);

  const handleLanguageChange = (newLang: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);
    router.push(`?${params.toString()}`);
  };

  const handleContentChange = (
    field: keyof typeof localContent,
    value: string
  ) => {
    const newContent = {
      ...localContent,
      [field]: value,
    };
    setLocalContent(newContent);
    onPreviewChange(newContent, language);
  };

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(null);
      
      await onUpdate({
        content: {
          ...problem.content,
          title: { ...problem.content.title, [language]: localContent.title },
          description: {
            ...problem.content.description,
            [language]: localContent.description,
          },
          solution: {
            ...problem.content.solution,
            [language]: localContent.solution,
          },
        },
      });
      
      // Set success state
      setSaveSuccess(true);
      
      toast({
        title: t("notifications.successTitle"),
        description: t("notifications.successMessage", { language: currentLanguageName }),
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
      
    } catch (error) {
      setSaveSuccess(false);
      toast({
        title: t("notifications.errorTitle"),
        description: t("notifications.errorMessage"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentLanguageName = SUPPORTED_LANGUAGES[language]?.name || language;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        {/* Header with Breadcrumbs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("header.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("header.subtitle")}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-w-[140px] h-10"
                size="sm"
              >
                <Globe className="h-4 w-4" />
                {SUPPORTED_LANGUAGES[language]?.icon}
                <span>{t(`language.${currentLanguageName}`)}</span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                <DropdownMenuItem
                  key={code}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer",
                    code === language && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => handleLanguageChange(code)}
                >
                  {lang.icon}
                  <span>{t(`language.${lang.name}`)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title Card */}
        <Card className="shadow-md border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary/80" />
              {t("titleCard.title")}
            </CardTitle>
            <CardDescription>
              {t("titleCard.description", { language: currentLanguageName })}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <Input
                className="px-4 py-2.5 font-medium text-base focus-visible:ring-primary/30 h-11 transition-all border-border/60"
                value={localContent.title}
                onChange={(e) => handleContentChange("title", e.target.value)}
                placeholder={t("titleCard.placeholder", { language: currentLanguageName })}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs Card */}
        <Card className="shadow-md border-border/60 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="border-b pb-0 px-0 pt-0 bg-muted/30">
              <TabsList className="w-full rounded-none bg-transparent grid grid-cols-2">
                <TabsTrigger 
                  value="description" 
                  className="flex items-center gap-2 py-3.5 px-6 border-r border-border/30 relative rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  <span>{t("tabs.description")}</span>
                  {activeTab === 'description' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-fade-in" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="solution"
                  className="flex items-center gap-2 py-3.5 px-6 relative rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none transition-all duration-200"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>{t("tabs.solution")}</span>
                  {activeTab === 'solution' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-fade-in" />
                  )}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="description" className="mt-0 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      {t("description.label")}
                      <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                        {currentLanguageName}
                      </span>
                    </Label>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("/polygon/docs/mathjax", "_blank")}
                      className="text-xs flex items-center gap-1.5 h-8 text-primary hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-function-square">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3 3-3" />
                        <path d="M9 11.2h5.7" />
                      </svg>
                      <span>{t("common.mathjaxGuide")}</span>
                    </Button>
                  </div>
                  
                  <div className="group border rounded-md border-border/60 overflow-hidden transition-all focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 hover:border-muted-foreground/30 bg-background">
                    <div className="border-b border-border/40 px-3 py-1.5 bg-muted/30 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{t("description.editHeader")}</div>
                      <div className="text-xs text-muted-foreground">
                        <kbd className="px-1.5 py-0.5 bg-muted-foreground/10 rounded border border-muted-foreground/20 text-[10px] font-mono">Ctrl+Space</kbd>
                        <span className="mx-1 text-[10px]">{t("common.forSuggestions")}</span>
                      </div>
                    </div>
                    <FitEditorLatex
                      minLine={15}
                      content={localContent.description}
                      onChange={(value) => handleContentChange("description", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground ml-1">
                      {t("description.hint")}
                    </p>
                    
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-md">
                      {localContent.description.length} {t("common.characters")}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="solution" className="mt-0 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      {t("solution.label")}
                      <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                        {currentLanguageName}
                      </span>
                    </Label>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("/polygon/docs/mathjax", "_blank")}
                      className="text-xs flex items-center gap-1.5 h-8 text-primary hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-function-square">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3 3-3" />
                        <path d="M9 11.2h5.7" />
                      </svg>
                      <span>{t("common.mathjaxGuide")}</span>
                    </Button>
                  </div>
                  
                  <div className="group border rounded-md border-border/60 overflow-hidden transition-all focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 hover:border-muted-foreground/30 bg-background">
                    <div className="border-b border-border/40 px-3 py-1.5 bg-muted/30 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{t("solution.editHeader")}</div>
                      <div className="text-xs text-muted-foreground">
                        <kbd className="px-1.5 py-0.5 bg-muted-foreground/10 rounded border border-muted-foreground/20 text-[10px] font-mono">Ctrl+Space</kbd>
                        <span className="mx-1 text-[10px]">{t("common.forSuggestions")}</span>
                      </div>
                    </div>
                    <FitEditorLatex
                      minLine={15}
                      content={localContent.solution}
                      onChange={(value) => handleContentChange("solution", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground ml-1">
                      {t("solution.hint")}
                    </p>
                    
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-md">
                      {localContent.solution.length} {t("common.characters")}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full bg-card border border-border/60 rounded-lg px-4 py-3 shadow-md">
          <div className="text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
            <p><span className="font-medium text-foreground">{t("footer.noteLabel")}</span> {t("footer.noteText", { language: currentLanguageName })}</p>
            <p className="text-xs mt-1">{t("footer.switchHint")}</p>
          </div>
          
          <div className="order-1 sm:order-2 w-full sm:w-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={isLoading || isSaving}
                  className={cn(
                    "flex items-center gap-2 w-full sm:w-auto h-10 px-6",
                    "transition-all duration-200 relative overflow-hidden",
                    saveSuccess === true && "bg-emerald-600 hover:bg-emerald-700",
                    saveSuccess === false && "bg-destructive hover:bg-destructive/90",
                    isSaving && "opacity-80",
                    "shadow hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("buttons.saving")}</span>
                    </>
                  ) : saveSuccess === true ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>{t("buttons.saveSuccess")}</span>
                      {/* Success animation overlay */}
                      <span className="absolute inset-0 bg-emerald-500/20 animate-pulse-once" />
                    </>
                  ) : saveSuccess === false ? (
                    <>
                      <X className="h-4 w-4" />
                      <span>{t("buttons.saveError")}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{t("buttons.save")}</span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("saveDialog.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("saveDialog.description", { language: currentLanguageName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel 
                    disabled={isSaving}
                  >
                    {t("saveDialog.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      isSaving && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("buttons.saving")}</span>
                      </div>
                    ) : (
                      t("buttons.save")
                    )}
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