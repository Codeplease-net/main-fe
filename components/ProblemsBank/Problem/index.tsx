"use client";

import { useEffect } from "react";
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

export default function ProblemDetail({
  id,
  lang,
}: {
  id: string;
  lang: string;
}) {
  // Get translations
  const t = useTranslations("ProblemBank.problem");

  // Get problem data and actions from the hook
  const { problem, state, actions, preview } = useProblem();

  // Load problem data when component mounts or id changes
  useEffect(() => {
    // Only fetch if we have an ID
    if (id) {
      actions.searchProblem(id);
    }
  }, [id, actions.searchProblem]); // Include actions.searchProblem in dependencies

  return (
    <div className="flex-1 relative">
      {/* Show modal loading state for updates */}
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
