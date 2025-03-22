"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WaitingModal } from "@/components/ui/modal";
import { InputSection } from "./components/InputSection";
import { OutputSection } from "./components/OutputSection";
import { useProblem } from "./hooks/useProblem";
import { LanguageCode } from "./types/language";
import { useTranslations } from "next-intl";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProblemDetail({ id, lang, tab }: { id: string, lang: string, tab: string }) {
  const t = useTranslations("ProblemBank.problem");
  const router = useRouter();

  const [selectedTab, setSelectedTabState] = useState(tab);
  const { problem, state, actions, preview } = useProblem();

  // Load problem data when component mounts
  useEffect(() => {
    const loadProblem = async () => {
      try {
        if (!id) return;
        await actions.searchProblem(id);
      } catch (error) {
        console.error("Error loading problem:", error);
      }
    };
    loadProblem();
  }, [id]);

  // Function to update both state and URL when changing tabs
  const setSelectedTab = (newTab: string) => {
    // Update state first to avoid reload
    setSelectedTabState(newTab);
    
    // For tab changes, we need to change the URL path, not search params
    // First, preserve any existing query parameters
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.search;
    
    // Then construct the new path
    const basePath = `/problems-bank/${id}`;
    
    // Add the tab to the path, or use default path if it's "general"
    let newPath = `${basePath}/${newTab}`;
    
    // Add back any query parameters
    newPath += queryParams;
    
    // Use replaceState to update URL without triggering navigation/reload
    window.history.replaceState(null, '', newPath);
  };


  // Show loading state while problem loads or access is being checked
  if (state.loadingAcceess) {
    return (
      <div className="flex-1 relative">
        <WaitingModal
          open={true}
          onOpenChange={() => {}}
          children={<div>{t("loading")}</div>}
          isOpen={false}
        />
      </div>
    );
  }

  // Show access denied message if user doesn't have access
  if (problem.id && !state.hasAccess && !state.readOnly) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] p-6">
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="mb-2">{t("accessDenied")}</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{t("noPermissionProblemBank")}</p>
            <div className="flex space-x-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => router.push("/problems-bank")}
              >
                {t("backToProblemBank")}
              </Button>
              
              <Button 
                variant="default"
                onClick={() => window.location.reload()}
              >
                {t("tryAgain")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Normal render for users with access
  return (
    <div className="flex-1 relative">
      <WaitingModal
        open={state.isLoading}
        onOpenChange={() => {}}
        children={<div>{t("loading")}</div>}
        isOpen={false}
      />
      
      <div className="h-[calc(100vh)]">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={50}>
            <InputSection
              setSelectedTab={setSelectedTab}
              selectedTab={selectedTab}
              problem={problem}
              isLoading={state.isLoading}
              language={lang as LanguageCode}
              onPreviewChange={actions.onPreviewChange}
              onUpdateProblem={actions.updateProblem}
              readOnly={state.readOnly}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <OutputSection problem={preview} lang={lang as LanguageCode} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}