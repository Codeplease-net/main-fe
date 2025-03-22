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
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProblemDetail({
  id,
  lang,
}: {
  id: string;
  lang: string;
}) {
  const t = useTranslations("ProblemBank.problem");
  const router = useRouter();
  const { problem, state, actions, preview } = useProblem();
  const { user } = useAuth(); // Use the useAuth hook to check user access

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
  }, [id, actions.searchProblem]);

  // Show loading state while problem loads or access is being checked
  if (state.isLoading || state.loadingAcceess) {
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
  if (problem.id && !state.hasAccess) {
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
              problem={problem}
              isLoading={state.isLoading}
              language={lang as LanguageCode}
              onPreviewChange={actions.onPreviewChange}
              onUpdateProblem={actions.updateProblem}
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